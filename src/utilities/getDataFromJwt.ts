import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { NextRequest } from "next/server"

interface CustomJWt{
  id: string,
}

export async function getDataFromJwt(request:NextRequest){
  try {
    const tokenData = request.cookies.get("token")?.value

    if(!tokenData){
      throw new Error("Token not found!")
    }

    const decodedData = jwt.verify(tokenData, process.env.JWT_SECRET as string) as CustomJWt

    if (!decodedData || !decodedData.id) {
      throw new Error("Invalid token payload structure");
    }

    return decodedData
  } catch (error:any) {
    throw new Error(error.message);
  }
}