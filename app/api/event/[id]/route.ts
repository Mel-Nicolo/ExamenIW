import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

interface RouteContext {
  params: {
    id: string;
  }
}

export async function GET(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();
    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el evento" },
      { status: 500 }
    );
  }
}