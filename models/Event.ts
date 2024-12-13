import mongoose from "mongoose";

export interface EventDocument {
  _id: string;
  nombre: string;
  timestamp: Date;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    organizador: {
      type: String,
      required: true,
    },
    imagen: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Event = mongoose.models?.Event || mongoose.model<EventDocument>("Event", EventSchema);
export default Event;