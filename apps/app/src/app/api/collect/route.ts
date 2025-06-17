import { type NextRequest, NextResponse } from 'next/server';
import { db, schema } from '../../../lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import UAParser from 'my-ua-parser';

// Schema para validar los datos de entrada del SDK
const incomingEventSchema = z.object({
  event: z.string(),
  props: z.record(z.any()).optional(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  site: z.string().optional(),
});

// Función para extraer parámetros UTM de una URL
function extractUtmParams(url: string) {
  try {
    const urlObj = new URL(url);
    return {
      utmSource: urlObj.searchParams.get('utm_source'),
      utmMedium: urlObj.searchParams.get('utm_medium'),
      utmCampaign: urlObj.searchParams.get('utm_campaign'),
      utmTerm: urlObj.searchParams.get('utm_term'),
      utmContent: urlObj.searchParams.get('utm_content'),
    };
  } catch {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };
  }
}



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
    const userAgentInfo = validatedData.userAgent ? UAParser(validatedData.userAgent) : null;

    // Extraer UTM params de la URL
    const utmParams = validatedData.url ? extractUtmParams(validatedData.url) : {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };

    // Session ID viene del SDK
    const sessionId = props.sessionId as string || null;

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
      userAgent: validatedData.userAgent || null,
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
      userId: null,

      // Page information (del SDK)
      pageTitle: props.pageTitle as string || null,
      pathname: props.pathname as string || null,
      hostname: props.hostname as string || null,

      // Performance metrics (del SDK)
      loadTime: props.loadTime as number || null,

      // UTM parameters
      utmSource: utmParams.utmSource,
      utmMedium: utmParams.utmMedium,
      utmCampaign: utmParams.utmCampaign,
      utmTerm: utmParams.utmTerm,
      utmContent: utmParams.utmContent,

      // Screen and viewport information (del SDK)
      screenWidth: props.screenWidth as number || null,
      screenHeight: props.screenHeight as number || null,
      viewportWidth: props.viewportWidth as number || null,
      viewportHeight: props.viewportHeight as number || null,

      // Language (del SDK)
      language: props.language as string || null,
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