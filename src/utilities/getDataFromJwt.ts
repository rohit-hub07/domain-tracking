import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { NextRequest } from "next/server"
import { redis } from "../lib/redis"

interface CustomJWt{
  id: string,
}

export async function getDataFromJwt(request:NextRequest){
  try {
    
    const tokenData = request.cookies.get("token")?.value
    
    if(!tokenData){
      throw new Error("Please login!")
    }

    const cachedData = await redis.get(`user_session:${tokenData}`);
    if(cachedData){
      console.log("cacheddata: ",cachedData)
      return JSON.parse(cachedData) as CustomJWt;
    }

    const decodedData = jwt.verify(tokenData, process.env.JWT_SECRET as string) as CustomJWt

    if (!decodedData || !decodedData.id) {
      throw new Error("Invalid token payload structure");
    }

    await redis.set(`user_session:${tokenData}`,JSON.stringify(decodedData),"EX",3600);

    return decodedData
  } catch (error:any) {
    console.log("error inside of getDatafrom jwt: ",error.message)
    throw new Error(error.message);
  }
}