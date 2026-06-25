import { dbConnection } from "@/src/db/dbConnection";
import { getDataFromJwt } from "@/src/utilities/getDataFromJwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
  try {
    await dbConnection()

    const data = await getDataFromJwt(request);
    const userId = (typeof data === "object" && data ? data.id: undefined);
    console.log("userId: ", userId); 
    return NextResponse.json({
      message: "User fetched successfully!",
      success: true,
      id: userId
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      success: false
    },{status: 500})
  }
}