import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Log from "@/models/Log";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { pageOwner, visitante } = await req.json();
    
    await connectDB();

    const loginLog = new Log({
      timestamp: new Date(),
      visitante,
      pageOwner,
      token: Math.random().toString(36).substring(2, 15), // Token aleatorio
    });

    await loginLog.save();
    return NextResponse.json(loginLog, { status: 201 });
  } catch (error) {
    console.error("Error al registrar la visita:", error);
    return NextResponse.json(
      { error: "Error al registrar la visita" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageOwner = searchParams.get("pageOwner");

    await connectDB();
    
    if (!pageOwner) {
      return NextResponse.json([]);
    }

    const logs = await Log.find({ pageOwner }).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error al obtener logs:", error);
    return NextResponse.json(
      { error: "Error al obtener logs" },
      { status: 500 }
    );
  }
}