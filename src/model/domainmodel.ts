import mongoose, { Schema, Types } from 'mongoose'

interface domain {
  name: string;
  registrar: string;
  registration: string,
  expiry: string,
  userId: Types.ObjectId;
}

const domainSchema = new mongoose.Schema<domain>({
  name: {
     type: String, 
     required: true 
  },
  registrar:{
    type: String,
    default: "Can't find"
  },
  registration: {
    type: String,
    required: true,
  },
  expiry: {
    type: String,
    required: true,
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

export const Domain = mongoose.models.Domain || mongoose.model<domain>("Domain", domainSchema);