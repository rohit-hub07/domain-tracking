import mongoose,{models, model} from "mongoose";
// import { dbConnection } from "../db/dbConnection";
import bcrypt from "bcryptjs";

interface IUser {
  username: string,
  email: string,
  password: string,
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
}, { timestamps: true })

userSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;

    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  } catch (error) {
    throw error;
  }
})



export const User = models.User || model<IUser>("User", userSchema);