import { type NextRequest, NextResponse } from 'next/server';
import { db, schema } from '../../../lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import UAParser from 'my-ua-parser';

// Schema para validar los datos de entrada del SDK
const incomingEventSchema = z.object({
  event: z.string(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  site: z.string().optional(),

  // Session & User
  sessionId: z.string().optional(),
  userId: z.string().optional(),

  // Device info (optional object)
  device: z.object({
    userAgent: z.string().optional(),
    screenWidth: z.number().optional(),
    screenHeight: z.number().optional(),
    viewportWidth: z.number().optional(),
    viewportHeight: z.number().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    connectionType: z.string().optional(),
  }).optional(),

  // Page info (optional object)
  page: z.object({
    title: z.string().optional(),
    pathname: z.string().optional(),
    hostname: z.string().optional(),
    loadTime: z.number().optional(),
  }).optional(),

  // UTM parameters (optional object)
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),

  // Custom properties
  props: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('body', body);
    // Validar los datos de entrada
    const validatedData = incomingEventSchema.parse(body);

    // Extraer información de props (que viene del SDK)
    const props = validatedData.props || {};

    // El SDK ya nos envía toda la información que necesitamos
    const site = validatedData.site || props.hostname as string || 'unknown';

    // Parsear el user agent solo para información básica
    const userAgentInfo = validatedData.device?.userAgent ? UAParser(validatedData.device.userAgent) : null;

    // Session ID viene del SDK
    const sessionId = validatedData.sessionId || props.sessionId as string || null;

    // Preparar los datos para insertar - usar principalmente datos del SDK
    const eventToInsert = {
      id: nanoid(),
      site: site,
      ts: validatedData.timestamp.toString(),
      evt: validatedData.event,
      url: validatedData.url || null,
      ref: validatedData.referrer || null,
      props: validatedData.props ? JSON.stringify(validatedData.props) : null,

      // User Agent information (básica)
      userAgent: validatedData.device?.userAgent || null,
      browser: userAgentInfo?.browser.name ?
        `${userAgentInfo.browser.name} ${userAgentInfo.browser.version || ''}`.trim() : null,
      os: userAgentInfo?.os.name ?
        `${userAgentInfo.os.name} ${userAgentInfo.os.version || ''}`.trim() : null,
      device: userAgentInfo?.device.type || null,
      deviceVendor: userAgentInfo?.device.vendor || null,
      deviceModel: userAgentInfo?.device.model || null,
      engine: userAgentInfo?.engine.name || null,
      cpu: userAgentInfo?.cpu.architecture || null,

      // Geographic information (placeholder)
      country: null,
      region: null,
      city: null,

      // Session information
      sessionId: sessionId,
      userId: validatedData.userId || null,

      // Page information (del SDK)
      pageTitle: validatedData.page?.title || null,
      pathname: validatedData.page?.pathname || null,
      hostname: validatedData.page?.hostname || null,

      // Performance metrics (del SDK)
      loadTime: validatedData.page?.loadTime || null,

      // UTM parameters (ahora vienen del SDK)
      utmSource: validatedData.utm?.source || null,
      utmMedium: validatedData.utm?.medium || null,
      utmCampaign: validatedData.utm?.campaign || null,
      utmTerm: validatedData.utm?.term || null,
      utmContent: validatedData.utm?.content || null,

      // Screen and viewport information (del SDK)
      screenWidth: validatedData.device?.screenWidth || null,
      screenHeight: validatedData.device?.screenHeight || null,
      viewportWidth: validatedData.device?.viewportWidth || null,
      viewportHeight: validatedData.device?.viewportHeight || null,

      // Language (del SDK)
      language: validatedData.device?.language || null,
    };

    console.log(eventToInsert);
    // Insertar en la base de datos
    await db.insert(schema.events).values(eventToInsert);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving event:', error);

    // Si es un error de validación de Zod, devolver detalles específicos
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}