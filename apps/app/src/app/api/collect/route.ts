import { type NextRequest, NextResponse } from 'next/server';
import { db, schema } from '../../../lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Schema para validar los datos de entrada del SDK
const incomingEventSchema = z.object({
  event: z.string(),
  props: z.record(z.any()).optional(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar los datos de entrada
    const validatedData = incomingEventSchema.parse(body);

    // Extraer el sitio de la URL o usar un valor por defecto
    const site = validatedData.url ? new URL(validatedData.url).hostname : 'unknown';

    // Preparar los datos para insertar en la base de datos
    const eventToInsert = {
      id: nanoid(),
      site: site,
      ts: validatedData.timestamp,
      evt: validatedData.event,
      url: validatedData.url || null,
      ref: validatedData.referrer || null,
      props: validatedData.props ? JSON.stringify(validatedData.props) : null,
    };

    // Validar con el schema de la base de datos
    const validatedEvent = schema.insertEventSchema.parse(eventToInsert);

    // Insertar en la base de datos
    await db.insert(schema.events).values(validatedEvent);

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