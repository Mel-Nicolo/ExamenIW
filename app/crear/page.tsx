'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

const CrearMarcador = () => {
  const [nombre, setNombre] = useState('');
  const [lugar, setLugar] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const session = await getSession();
      if (!session) {
        console.error('No hay sesión activa');
        setIsSubmitting(false);
        return;
      }

      // Obtener coordenadas del lugar
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(lugar)}&format=json&limit=1`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData || geocodeData.length === 0) {
        console.error('No se pudieron obtener las coordenadas del lugar');
        setIsSubmitting(false);
        return;
      }

      const { lat, lon } = geocodeData[0];

      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('lugar', lugar);
      formData.append('lat', lat);
      formData.append('lon', lon);
      if (session.user && session.user.email) {
        formData.append('creador', session.user.email);
      }
      if (imagen) {
        formData.append('imagen', imagen);
      }

      const res = await fetch('/api/marcador', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/');
      } else {
        console.error('Error al crear el marcador');
      }
    } catch (error) {
      console.error('Error al crear el marcador', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Crear Nuevo Marcador</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Lugar</label>
                    <input
                      type="text"
                      value={lugar}
                      onChange={(e) => setLugar(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Imagen</label>
                    <input
                      type="file"
                      onChange={(e) => setImagen(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Marcador'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMarcador;