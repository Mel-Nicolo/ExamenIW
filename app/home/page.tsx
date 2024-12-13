'use client'
import { useState, useEffect } from 'react';
import EventList from '../../components/EventList';

export default function Home() {
  const [address, setAddress] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar todos los eventos al inicio
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/event');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError('Error al cargar eventos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const searchEvents = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (!address.trim()) {
        const response = await fetch('/api/event');
        const data = await response.json();
        setEvents(data);
        return;
      }

      // Convertir dirección a coordenadas usando geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const eventsResponse = await fetch(`/api/event/search?lat=${lat}&lon=${lon}`);
        if (!eventsResponse.ok) throw new Error('Error en la búsqueda');
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      } else {
        setError('No se encontró la ubicación');
      }
    } catch (err) {
      setError('Error al buscar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Eventos</h1>
      
      <form onSubmit={searchEvents} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Introduce una dirección"
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar eventos cercanos'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Cargando eventos...</div>
      ) : events.length > 0 ? (
        <EventList events={events} />
      ) : (
        <div className="text-center text-gray-500">
          No se encontraron eventos
        </div>
      )}
    </main>
  );
}