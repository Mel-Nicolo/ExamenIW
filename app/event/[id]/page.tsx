'use client'
import { useEffect, useState, use } from "react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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

// Dynamic import for map components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/event/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Error al cargar el evento');
        const data = await response.json();
        setEvent(data);
        setMapKey(prev => prev + 1);
      } catch (err) {
        setError("Error al cargar el evento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [resolvedParams.id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500 text-xl">{error}</div>
    </div>
  );
  
  if (!event) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-500 text-xl">Evento no encontrado</div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/home" className="text-blue-500 mb-4 block hover:underline">
        ← Volver
      </Link>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img 
          src={event.imagen} 
          alt={event.nombre}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{event.nombre}</h1>
          <div className="space-y-3">
            <p>
              <span className="font-semibold">Fecha:</span>{' '}
              {new Date(event.timestamp).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Lugar:</span>{' '}
              {event.lugar}
            </p>
            <p>
              <span className="font-semibold">Organizador:</span>{' '}
              {event.organizador}
            </p>
          </div>
          
          <div className="h-[400px] w-full relative mt-6 rounded-lg overflow-hidden">
            <MapContainer 
              key={mapKey}
              center={[event.lat, event.lon]} 
              zoom={13} 
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[event.lat, event.lon]} icon={icon}>
                <Popup>
                  {event.lugar}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}