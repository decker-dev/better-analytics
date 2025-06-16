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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar los datos de entrada
    const validatedData = incomingEventSchema.parse(body);

    // Usar el site del payload o extraer de la URL como fallback
    const site = validatedData.site ||
      (validatedData.url ? new URL(validatedData.url).hostname : 'unknown');

    // Parsear el user agent para extraer información útil
    // Extrae: browser, OS, device type/vendor/model, engine, CPU architecture
    const userAgentInfo = validatedData.userAgent ? UAParser(validatedData.userAgent) : null;

    // Preparar props extendidas con información del user agent
    const extendedProps = {
      ...validatedData.props,
      ...(userAgentInfo && {
        browser: userAgentInfo.browser.name ? `${userAgentInfo.browser.name} ${userAgentInfo.browser.version || ''}`.trim() : undefined,
        os: userAgentInfo.os.name ? `${userAgentInfo.os.name} ${userAgentInfo.os.version || ''}`.trim() : undefined,
        device: userAgentInfo.device.type || undefined,
        deviceVendor: userAgentInfo.device.vendor || undefined,
        deviceModel: userAgentInfo.device.model || undefined,
        engine: userAgentInfo.engine.name || undefined,
        cpu: userAgentInfo.cpu.architecture || undefined,
      })
    };
    console.log(extendedProps);

    // Preparar los datos para insertar en la base de datos
    const eventToInsert = {
      id: nanoid(),
      site: site,
      ts: validatedData.timestamp.toString(),
      evt: validatedData.event,
      url: validatedData.url || null,
      ref: validatedData.referrer || null,
      props: validatedData.props ? JSON.stringify(validatedData.props) : null,
    };

    // Insertar en la base de datos directamente
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