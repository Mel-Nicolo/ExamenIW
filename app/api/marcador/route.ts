import { NextRequest, NextResponse } from "next/server";
import Marcador from "@/models/Marcador";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creador = searchParams.get("creador");

    await connectDB();

    if (creador) {
      const marcadores = await Marcador.find({ creador });
      return NextResponse.json(marcadores);
    }

    // Si no hay creador, devolvemos un array vacio
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error al obtener los marcadores:", error);
    return NextResponse.json(
      { error: "Error al obtener marcador" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear marcadores" },
        { status: 401 }
      );
    }

    await connectDB();
    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    if (!imagen) {
      return NextResponse.json(
        { error: "No se ha proporcionado una imagen" },
        { status: 400 }
      );
    }

    const bytes = await imagen.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    const imagenUrl = (response as { secure_url: string }).secure_url;

    // Obtener las coordenadas basadas en 'lugar' usando OpenStreetMap Nominatim API
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      lugar
    )}&format=json&limit=1`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    let lat = 0;
    let lon = 0;

    if (geocodeData && geocodeData.length > 0) {
      lat = parseFloat(geocodeData[0].lat);
      lon = parseFloat(geocodeData[0].lon);
    } else {
      console.error(
        "No se pudieron obtener las coordenadas para el lugar proporcionado."
      );
    }

    // Crear el marcador usando el email del usuario autenticado
    const marcador = new Marcador({
      nombre,
      lugar,
      lat,
      lon,
      creador: session.user.email,
      imagen: imagenUrl,
    });

    await marcador.save();
    return NextResponse.json(marcador, { status: 201 });
  } catch (error) {
    console.error("Error al crear el marcador:", error);
    return NextResponse.json(
      { error: "Error al crear el marcador" },
      { status: 500 }
    );
  }
}