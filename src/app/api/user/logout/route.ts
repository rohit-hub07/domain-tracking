import { dbConnection } from "@/src/db/dbConnection";
import dotenv from "dotenv"
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

export async function GET(request: NextRequest){
  try {
    await dbConnection()
    const response = NextResponse.json({
      message: "User logged out successfully!",
      success: true,
    },{status: 200})

    response.cookies.delete("token")

    return response;

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false
    },{status: 500})
  }
}