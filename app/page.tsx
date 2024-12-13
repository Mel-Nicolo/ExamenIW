"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Event {
  _id: string;
  nombre: string;
  lugar: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
}

interface LoginLog {
  timestamp: string;
  visitante: string;
  token: string;
  pageOwner: string;
}

function HomeContent() {
  const { data: session, status } = useSession();
  const [markers, setMarkers] = useState<Event[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const searchParams = useSearchParams();
  const searchEmail = searchParams.get('email');

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      if (searchEmail && searchEmail !== session?.user?.email) {
        registerVisit(searchEmail, session.user.email);
        fetchUserMarkers(searchEmail);
        fetchUserLogs(searchEmail);
      } else if (session.user?.email) {
        fetchUserMarkers(session.user.email);
        fetchUserLogs(session.user.email);
      }
    } else if (status === "unauthenticated") {
      setMarkers([]);
      setLogs([]);
      setLocation(null);
    }
  }, [status, session, searchEmail]);

  const registerVisit = async (pageOwner: string, visitor: string) => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageOwner,
          visitante: visitor
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al registrar la visita');
      }
    } catch (error) {
      console.error('Error al registrar la visita:', error);
    }
  };

  const fetchUserMarkers = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marcador?creador=${email}`);
      if (!response.ok) throw new Error('Error al cargar los marcadores');
      
      const data = await response.json();
      setMarkers(data);
      
      if (data.length > 0) {
        setLocation({ lat: data[0].lat, lon: data[0].lon });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLogs = async (email: string) => {
    try {
      const response = await fetch(`/api/log?pageOwner=${email}`);
      if (!response.ok) throw new Error('Error al cargar los logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showSession = () => {
    if (status === "authenticated") {
      return <></>
    } else if (status === "loading") {
      return <span className="text-[#888] text-sm mt-7">Loading...</span>
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded px-4 py-2 mb-8"
        >
          Inicia sesión para continuar.
        </Link>
      )
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {showSession()}

      {status === "authenticated" && location && (
        <>
          <h2 className="text-xl font-bold mb-4">
            {searchEmail ? `Marcadores de ${searchEmail}` : 'Tus marcadores'}
          </h2>
          <div className="w-full max-w-7xl mb-8">
            <Map location={location} eventos={markers} />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-8">
        {markers.map((marker) => (
          <div key={marker._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={marker.imagen} 
              alt={marker.nombre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">{marker.nombre}</h3>
              <p>{marker.lugar}</p>
            </div>
          </div>
        ))}
      </div>

      {status === "authenticated" && logs.length > 0 && (
        <div className="w-full max-w-7xl">
          <h2 className="text-xl font-bold mb-4">Registro de visitas</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Fecha y hora</th>
                  <th className="border p-2">Visitante</th>
                  <th className="border p-2">Token</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="border p-2">{log.visitante}</td>
                    <td className="border p-2">{log.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}