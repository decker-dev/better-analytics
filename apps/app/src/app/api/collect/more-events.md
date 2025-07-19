# Analytics API Scaling Strategy - High Volume Events

## Current Situation

### Architecture Overview
- **Current Pattern**: Synchronous HTTP requests to `/api/collect` per event
- **Database**: PostgreSQL with normalized schema (events + web_events/mobile_events/server_events/geo_events)
- **Processing**: Direct database writes on each request
- **Optimization**: 10+ indexes for query performance, normalized tables for storage efficiency

### Performance Characteristics
- **Good for**: < 100 events/second
- **Problematic at**: 1K-10K events/second (86M-864M events/day)
- **Breaking point**: Database write contention, connection exhaustion, index maintenance overhead

## The High-Volume Problem

### Technical Challenges
1. **Write Contention**: PostgreSQL struggles with concurrent writes at scale
2. **Index Maintenance**: Each INSERT updates 6+ indexes across 5 tables
3. **Connection Limits**: Each request consumes a DB connection
4. **Lock Contention**: Transactions competing for table/row locks
5. **Memory Pressure**: High concurrent connections = high memory usage

### Real-World Impact
- **1K events/sec**: 86M events/day - manageable with optimization
- **10K events/sec**: 864M events/day - requires architectural changes
- **100K events/sec**: 8.6B events/day - needs distributed system

## Scaling Options

### 1. Immediate Optimizations (Current Architecture)

**Database Tuning**
```sql
-- Write-optimized PostgreSQL config
shared_buffers = 25% of RAM
wal_buffers = 16MB
checkpoint_timeout = 15min
max_wal_size = 4GB
```

**Connection Pooling**
- PgBouncer with transaction pooling
- Reduce connection overhead
- Better resource utilization

**Hardware Scaling**
- Vertical scaling (more CPU/RAM/faster SSD)
- Read replicas for analytics queries
- Separate write/read workloads

### 2. Async Processing (Medium Term)

**Pattern**: API returns 200 immediately, processes in background

```typescript
// API endpoint becomes:
export async function POST(request: Request) {
  const event = await request.json();
  
  // Validate and enqueue immediately
  await eventQueue.add(event);
  
  return new Response('OK', { status: 200 });
}
```

**Benefits**:
- Sub-10ms response times
- Decouples API from database performance
- Natural batching opportunities

**Implementation**:
- Redis/BullMQ for event queue
- Background workers for processing
- Batch processing (50-100 events per DB transaction)

### 3. Message Queue + Batch Processing

**Architecture**:
```
Client → API → Redis Queue → Batch Worker → PostgreSQL
```

**Batch Worker Logic**:
- Collect events for 100ms windows
- Process in batches of 50-100 events
- Single transaction per batch
- Automatic retry on failures

**Benefits**:
- 10-50x better write throughput
- Reduced index maintenance overhead
- Better error handling and retry logic

### 4. Time-Series Database Migration

**Option A: TimescaleDB**
- PostgreSQL extension for time-series
- Automatic partitioning by time
- Compression for older data
- Maintains SQL compatibility

**Option B: ClickHouse**
- Column-oriented, built for analytics
- Extremely fast for aggregations
- 100x faster than PostgreSQL for analytics queries
- Requires learning new query syntax

### 5. Event Streaming (Long Term)

**Architecture**:
```
Client → API → Kafka → Stream Processors → Multiple Stores
                  ↓
            Real-time Analytics → Redis
                  ↓
            Batch Analytics → ClickHouse
                  ↓
            Raw Storage → S3
```

**Benefits**:
- Infinite scalability
- Real-time + batch processing
- Multiple data stores for different use cases
- Event replay capabilities

## Recommended Approach (Vercel + Neon Stack)

### Phase 1: Immediate (1-2 weeks) - Upstash + Vercel Cron
**Perfect for intermittent traffic spikes (1K events/second)**

1. **Upstash Redis Queue** - serverless-native Redis for event buffering
2. **Ultra-fast API** - enqueue events in <10ms, return immediately
3. **Vercel Cron processing** - batch process every minute via cron jobs
4. **Leverage existing stack** - no new infrastructure needed

**Implementation:**
```typescript
// Fast API endpoint
export async function POST(request: Request) {
  const event = await request.json();
  await redis.lpush('events', JSON.stringify(event));
  return new Response('OK', { status: 200 }); // <10ms
}

// Cron processor (/api/cron/process-events)
export async function POST() {
  const events = await redis.lrange('events', 0, 49); // 50 events
  await db.transaction(async (tx) => {
    // Process batch in single transaction
  });
  await redis.ltrim('events', events.length, -1);
}
```

**Benefits for Vercel + Neon:**
- ✅ Handles traffic spikes without lambda timeouts
- ✅ Reduces Neon connection pressure
- ✅ Economical (Upstash free tier + Vercel cron)
- ✅ Zero infrastructure management
- ✅ Auto-scaling built-in

### Phase 2: Medium Term (1-2 months)
1. **Queue monitoring** - dashboard for queue depth and processing stats
2. **Error handling** - dead letter queue for failed events
3. **Dynamic batching** - adjust batch size based on queue length
4. **Neon optimization** - read replicas for analytics queries

### Phase 3: Long Term (3-6 months)
1. **Evaluate TimescaleDB** - if staying with PostgreSQL
2. **Consider ClickHouse** - for analytics-heavy workloads
3. **Event streaming** - if approaching 100K+ events/sec

## Implementation Steps (Upstash + Vercel)

### Step 1: Setup Upstash Redis
```bash
# Install dependencies
pnpm add @upstash/redis

# Create Upstash account and get credentials
# Add to .env.local:
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Step 2: Create Redis Client
```typescript
// lib/upstash.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Step 3: Modify Collection API
```typescript
// app/api/collect/route.ts (modified)
import { redis } from '@/lib/upstash';

export async function POST(request: Request) {
  const event = await request.json();
  
  // Quick validation
  if (!event.type || !event.timestamp) {
    return new Response('Invalid event', { status: 400 });
  }
  
  // Queue instead of direct DB write
  await redis.lpush('analytics_events', JSON.stringify({
    ...event,
    queued_at: Date.now()
  }));
  
  return new Response('OK', { status: 200 });
}
```

### Step 4: Create Batch Processor
```typescript
// app/api/cron/process-events/route.ts
import { redis } from '@/lib/upstash';
import { db } from '@/lib/db';

export async function POST() {
  const BATCH_SIZE = 50;
  
  try {
    const events = await redis.lrange('analytics_events', 0, BATCH_SIZE - 1);
    if (events.length === 0) return new Response('No events');
    
    // Process in transaction (your existing logic)
    await db.transaction(async (tx) => {
      for (const eventStr of events) {
        const event = JSON.parse(eventStr);
        // Your existing event processing logic here
      }
    });
    
    // Remove processed events
    await redis.ltrim('analytics_events', events.length, -1);
    
    return new Response(`Processed ${events.length} events`);
  } catch (error) {
    console.error('Processing failed:', error);
    return new Response('Error', { status: 500 });
  }
}
```

### Step 5: Configure Vercel Cron
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-events",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

### Step 6: Add Monitoring
```typescript
// app/api/cron/queue-status/route.ts
export async function GET() {
  const queueLength = await redis.llen('analytics_events');
  return Response.json({
    queue_length: queueLength,
    status: queueLength > 1000 ? 'warning' : 'ok',
    timestamp: new Date().toISOString()
  });
}
```

## Implementation Priority

### High Priority (Immediate ROI)
- [ ] Setup Upstash Redis account
- [ ] Modify /api/collect to use queue
- [ ] Create batch processor endpoint
- [ ] Configure Vercel cron job
- [ ] Basic queue monitoring

### Medium Priority (Scale Preparation)
- [ ] Error handling and retry logic
- [ ] Dead letter queue for failed events
- [ ] Dynamic batch sizing
- [ ] Queue metrics dashboard

### Low Priority (Future Scale)
- [ ] Time-series database evaluation
- [ ] Event streaming architecture
- [ ] Multi-region deployment
- [ ] Real-time analytics pipeline

## Key Metrics to Monitor

1. **API Latency**: < 50ms for event collection
2. **Queue Depth**: < 1000 events in queue
3. **Processing Time**: < 100ms per batch
4. **Database Connections**: < 80% of max connections
5. **Error Rate**: < 0.1% event loss

## Conclusion

The current architecture is solid for moderate scale but needs async processing for high-volume scenarios. The key is implementing changes incrementally while maintaining data integrity and low latency for users.

**Bottom Line**: Start with async processing + batching. This single change can handle 10x more events with the same infrastructure.
