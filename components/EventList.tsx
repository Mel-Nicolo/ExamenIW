import Link from 'next/link';
import { EventDocument } from '@/models/Event';

export default function EventList({ events }: { events: EventDocument[] }) {
  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <div key={event._id} className="border p-4 rounded">
          <h2 className="text-xl font-bold">{event.nombre}</h2>
          <p>Organizado por: {event.organizador}</p>
          <p>Fecha: {new Date(event.timestamp).toLocaleString()}</p>
          <p>Lugar: {event.lugar}</p>
          <img 
            src={event.imagen} 
            alt={event.nombre}
            className="w-full h-48 object-cover mt-2 rounded"
          />
          <Link
            href={`/event/${event._id}`}
            className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ver detalles
          </Link>
        </div>
      ))}
    </div>
  );
}