import { dbConnection } from "@/src/db/dbConnection";
import { User } from "@/src/model/usermodel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

dbConnection();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password } = data;
    // console.log("email, password", email, password)
    if (!email || !password) {
      return NextResponse.json({
        message: "All fields are required!",
        success: false
      }, { status: 400 })
    }

    // find the user if exist or not
    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      return NextResponse.json({
        message: "User doesn't exists!",
        success: false
      }, { status: 404 })
    }

    //check pass
    const isMatched = await bcrypt.compare(password, userExists.password)

    if (!isMatched) {
      return NextResponse.json({
        message: "Email or password is incorrect!",
        success: false,
      }, { status: 400 })
    }

    // remove password from user
    const userObj = userExists.toObject();

    const tokenData = {
      id: userExists._id,
    }
    const token = jwt.sign(tokenData, process.env.JWT_SECRET as string, { expiresIn: '1d' })

    const { password: _, ...userDataWithoutPassword } = userObj;

    const response = NextResponse.json({
      message: "User logged in successfully!",
      user: userDataWithoutPassword,
      success: true,
    }, { status: 200 })

    response.cookies.set("token",token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 1000
    })
    return response
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false,
    },{status: 500})
  }
}
