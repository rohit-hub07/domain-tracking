import { User } from "@/src/model/usermodel";
import jwt  from "jsonwebtoken";
import { dbConnection } from "@/src/db/dbConnection";
import { NextRequest, NextResponse } from "next/server";

dbConnection(); 

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { username,  email, password } = data;

    if (!username || !email || !password) {
      return NextResponse.json({
        message: "All fields are required!",
        success: false,
      }, { status: 400 })
    }

    // check for existing user
    const existingUser = await User.findOne({ email: email })

    if (existingUser) {
      return NextResponse.json({
        message: "User already exists!",
        success: false,
      }, { status: 400 })
    }


    // for new user
    const newUser = await User.create({
      username, email, password
    })
    if (!newUser) {
      return NextResponse.json({
        message: "Error while creating admin",
        success: false,
      }, { status: 500 })
    }
    const tokenData = {
      id: newUser._id,
    }

    const token = jwt.sign(tokenData, process.env.JWT_SECRET as string, {expiresIn:'1d'})

    const userObj = newUser.toObject();
    
    const { password: _, ...userDataWithoutPassword } = userObj;

    console.log("newUser after removing pas: ",userDataWithoutPassword)

    const response = NextResponse.json({
      message: "User signed up successfully!",
      userData: userDataWithoutPassword,
      success: true,
    }, { status: 201 });
    
    response.cookies.set("token",token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 3
    })
    return response

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false
    },{status: 500})
  }
}