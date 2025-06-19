# Plan de Implementación: Sistema de Gestión de Sitios/Proyectos

## Contexto
- El dashboard se auto-mide (es uno de los sitios que puede trackear)
- Actualmente usa BA_123 (variable de entorno global)
- Necesitamos crear múltiples proyectos con site keys únicos (ej: BA_231)
- Cada organización puede tener múltiples sitios/proyectos
- Los eventos se filtran por site key para mostrar stats específicas

## 1. Database Schema Changes

### Nueva tabla: `sites`
```sql
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Mi Dashboard", "Blog Personal"
  site_key TEXT NOT NULL UNIQUE,        -- "BA_231", "BA_456" (identificador único)
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  domain TEXT,                           -- "dashboard.example.com" (opcional)
  description TEXT,                      -- Descripción del proyecto
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sites_organization_id ON sites(organization_id);
CREATE INDEX idx_sites_site_key ON sites(site_key);
```

## 2. Rutas Nuevas

### Estructura de navegación actualizada:
```
/{orgSlug}/
├── sites/                    -> Lista de sitios de la org
│   ├── new                  -> Crear nuevo sitio
│   └── {siteKey}/
│       ├── stats            -> Analytics del sitio específico
│       └── settings         -> Configuración del sitio
└── settings/                -> Settings de la organización
```

### Middleware updates:
- Validar que siteKey existe y pertenece a la org
- Remover completamente las rutas `/{orgSlug}/stats` y `/{orgSlug}/settings`

## 3. Componentes Nuevos

### 3.1 Site Management
- `apps/app/src/modules/sites/components/site-list.tsx`
- `apps/app/src/modules/sites/components/site-card.tsx`
- `apps/app/src/modules/sites/components/create-site-form.tsx`
- `apps/app/src/modules/sites/components/site-selector.tsx`

### 3.2 Site Analytics (refactor completo)
- **BORRAR** `apps/app/src/modules/stats/` completamente
- **CREAR** `apps/app/src/modules/sites/components/analytics/`
- Reestructurar components para recibir `siteKey` como parámetro

### 3.3 Navigation Updates
- **REFACTOR** `org-navigation.tsx` - cambiar de "Stats/Settings" a solo "Sites"
- **BORRAR** navegación directa a stats desde org level
- Agregar site selector en el header cuando estemos dentro de un sitio

## 4. Backend Changes

### 4.1 Database Operations
```typescript
// apps/app/src/lib/db/sites.ts
export const sitesTable = pgTable('sites', { ... });

// Operations
- createSite(orgId, name, domain?, description?)
- getSitesByOrg(orgId)
- getSiteByKey(siteKey)
- updateSite(siteId, data)
- deleteSite(siteId)
```

### 4.2 Analytics API Updates
```typescript
// **BORRAR** apps/app/src/modules/stats/lib/analytics.ts
// **CREAR** apps/app/src/modules/sites/lib/analytics.ts
// Refactor completo para recibir siteKey específico
export async function getComprehensiveStats(siteKey: string): Promise<AnalyticsStats>
```

## 5. Páginas Nuevas/Actualizadas

### 5.1 Sites Management
```typescript
// apps/app/src/app/(auth)/[orgSlug]/sites/page.tsx
- Lista todos los sitios de la organización
- Botón "Create New Site"
- Cards con info de cada sitio + botón "View Analytics"

// apps/app/src/app/(auth)/[orgSlug]/sites/new/page.tsx
- Form para crear nuevo sitio
- Genera site_key automáticamente
- Redirección a /sites después de crear
```

### 5.2 Site-specific Analytics
```typescript
// apps/app/src/app/(auth)/[orgSlug]/sites/[siteKey]/stats/page.tsx
- Recibe siteKey como parámetro
- Muestra analytics específicas de ese sitio
- Breadcrumb: Org > Sites > SiteName > Stats

// apps/app/src/app/(auth)/[orgSlug]/sites/[siteKey]/settings/page.tsx
- Configuración específica del sitio
- Editar nombre, dominio, descripción
- Regenerar site_key
- Eliminar sitio
```

### 5.3 Layout Updates
```typescript
// apps/app/src/app/(auth)/[orgSlug]/sites/[siteKey]/layout.tsx
- Nuevo layout que incluye site context
- Site selector en header
- Navegación site-specific (Stats, Settings)
```

## 6. Site Key Generation

### 6.1 Formato
```typescript
// Patrón: BA_{org_id_short}_{random}
// Ejemplo: BA_A1B2_X9Y8Z7
function generateSiteKey(orgId: string): string {
  const orgShort = orgId.slice(0, 4).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `BA_${orgShort}_${random}`;
}
```

### 6.2 Validación
- Verificar unicidad en base de datos
- Longitud máxima/mínima
- Caracteres permitidos

## 7. Onboarding Flow

### 7.1 Primera vez (sin sitios)
```
/{orgSlug}/ 
  ↓
Detecta que no hay sitios
  ↓
Muestra onboarding: "Create your first site to start tracking analytics"
  ↓
Formulario de creación
  ↓
Redirect a /{orgSlug}/sites/{siteKey}/stats
```

### 7.2 Con sitios existentes
```
/{orgSlug}/
  ↓
Redirect a /{orgSlug}/sites
  ↓
Lista de sitios con opción de ver analytics
  ↓
Si solo hay 1 sitio, auto-redirect a /{orgSlug}/sites/{siteKey}/stats
```

## 8. Environment Variable Strategy

### 8.1 Desarrollo
```env
# Para el dashboard self-tracking
NEXT_PUBLIC_BA_SITE=BA_SELF_DEV123
```

### 8.2 Producción
```env
# Cuando queramos trackear el dashboard en producción
NEXT_PUBLIC_BA_SITE=BA_SELF_PROD456
```

### 8.3 Analytics Component Update
```typescript
// apps/app/src/app/layout.tsx
// Mantener la variable de entorno para self-tracking del dashboard
<Analytics
  api="/api/collect"
  site={process.env.NEXT_PUBLIC_BA_SITE} // Self-tracking
  debug={true}
/>
```

## 9. Breaking Changes Strategy

### 9.1 Database Migration
```sql
-- 0003_add_sites_table.sql
CREATE TABLE sites ( ... );
```

### 9.2 Routes to DELETE/REPLACE
- **BORRAR** `apps/app/src/app/(auth)/[orgSlug]/stats/page.tsx`
- **BORRAR** `apps/app/src/app/(auth)/[orgSlug]/settings/page.tsx` (settings van a nivel de sitio)
- **REFACTOR** layout.tsx para remover navegación a stats/settings directos

## 10. Implementation Order (Breaking Changes Approach)

### Phase 1: Clean Slate (Día 1)
1. ✅ **BORRAR** todo el módulo `modules/stats/`
2. ✅ **BORRAR** rutas `[orgSlug]/stats` y `[orgSlug]/settings`
3. ✅ Database schema + migration
4. ✅ Site key generation utility

### Phase 2: Foundation (Día 2)
5. ✅ Basic CRUD operations para sites
6. ✅ Sites list page (`/{orgSlug}/sites`)
7. ✅ Create site page (`/{orgSlug}/sites/new`)

### Phase 3: Analytics Rebuild (Días 3-4)
8. ✅ **CREAR** `modules/sites/lib/analytics.ts` desde cero
9. ✅ **CREAR** analytics components en `modules/sites/components/analytics/`
10. ✅ Site-specific stats page (`/{orgSlug}/sites/{siteKey}/stats`)

### Phase 4: Complete Integration (Día 5)
11. ✅ Site settings page (`/{orgSlug}/sites/{siteKey}/settings`)
12. ✅ Site selector component
13. ✅ Navigation refactor completo
14. ✅ Onboarding flow
15. ✅ Middleware updates

## 11. Considerations

### 11.1 Self-tracking
- El dashboard seguirá usando la variable de entorno global (`NEXT_PUBLIC_BA_SITE`)
- Los sitios creados por usuarios usarán sus propios site_keys generados
- Son sistemas paralelos que comparten la misma API de colección (`/api/collect`)

### 11.2 Security
- Validar que el usuario tiene acceso al sitio antes de mostrar analytics
- Site_keys son únicos globalmente, no por org
- Org settings permanecen separados de site settings

### 11.3 UX
- **No más navegación directa a stats desde org level**
- Forzar workflow: Org → Sites → Site específico → Stats
- Auto-redirect si solo hay 1 sitio en la org
- Onboarding obligatorio para crear primer sitio

### 11.4 Performance
- Índices apropiados en base de datos
- Site keys indexados para búsquedas rápidas
- Analytics data pre-agregada por site

### 11.5 Breaking Changes Impact
- **Todas las URLs existentes serán inválidas**
- **Componentes de stats necesitan refactor completo**
- **Navigation patterns completamente nuevos**
- ✅ **Pero sin usuarios en producción = Sin problemas**
