import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lon = parseFloat(searchParams.get("lon") || "0");

    await connectDB();
    
    const events = await Event.find({
      "location.lat": { $gte: lat - 0.2, $lte: lat + 0.2 },
      "location.lon": { $gte: lon - 0.2, $lte: lon + 0.2 },
      timestamp: { $gte: new Date() }
    }).sort({ timestamp: 1 });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Error al buscar eventos" }, { status: 500 });
  }
}