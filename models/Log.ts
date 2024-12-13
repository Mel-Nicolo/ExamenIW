import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  expiryTimestamp: {
    type: Date,
    required: true
  },
  token: {
    type: String,
    required: true
  }
},{ versionKey: false });

const Log = mongoose.models?.Log || mongoose.model("Log", LogSchema);
export default Log;