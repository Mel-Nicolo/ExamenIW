"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Event {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);


  const searchEvents = async () => {
    try {
      setLoading(true);
      
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        setLocation({ lat, lon });
        const response = await fetch(`/api/event?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('Error al cargar los eventos');
        
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">

      <div className="w-full max-w-xl mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Introduce una direcciÃ³n"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={searchEvents}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      {location && (
        <div className="w-full max-w-7xl mb-8">
          <Map location={location} eventos={events} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {events.map((event) => (
          <Link href={`/event/${event._id}`} key={event._id}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={event.imagen} 
                alt={event.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{event.nombre}</h2>
                <p className="text-gray-600">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{event.lugar}</p>
                <p className="text-gray-600">Organizador: {event.organizador}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}