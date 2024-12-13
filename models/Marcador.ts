import mongoose from "mongoose";

const MarcadorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
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
    creador: {
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

const Marcador =
  mongoose.models?.Marcador || mongoose.model("Marcador", MarcadorSchema);

export default Marcador;
