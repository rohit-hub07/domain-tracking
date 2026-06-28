import { dbConnection } from "@/src/db/dbConnection";
import { redis } from "@/src/lib/redis";
import { getDataFromJwt } from "@/src/utilities/getDataFromJwt";
import dotenv from "dotenv"
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

export async function GET(request: NextRequest) {
  try {
    await dbConnection()
    const response = NextResponse.json({
      message: "User logged out successfully!",
      success: true,
    }, { status: 200 })

    const tokenData = request.cookies.get("token")?.value

    response.cookies.delete("token")
    
    if (tokenData) {
      await redis.del(`user_session:${tokenData}`)
    }

    return response;

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false
    }, { status: 500 })
  }
}