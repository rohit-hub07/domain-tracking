import { dbConnection } from "@/src/db/dbConnection";
import { Domain } from "@/src/model/domainmodel";
import { User } from "@/src/model/usermodel";
import { getDataFromJwt } from "@/src/utilities/getDataFromJwt";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/src/lib/redis";


export async function GET(request: NextRequest) {
  try {

    if (!request.cookies.get("token")?.value) {
      return NextResponse.json({
        message: "Please login!",
        success: false,
      }, { status: 403 })
    }

    const userData = await getDataFromJwt(request);

    // cache the response to redis
    let cached = await redis.get(`user:${userData.id}:domain`)

    if (cached) {
      const data = JSON.parse(cached);
      return NextResponse.json({
        message: "Domains Fecthed successfully!",
        redis: "Data is triggered from redis",
        success: true,
        domains: data,
      }, { status: 200 })
    }

    await dbConnection();
    // find all the domain details for the loggedIn user
    const domains = await Domain.find({ userId: userData.id })
    // console.log("Domain of the user: ", domains);

    await redis.set(`user:${userData.id}:domain`, JSON.stringify(domains), "EX", 3600)

    return NextResponse.json({
      message: "Domains Fecthed successfully!",
      success: true,
      domains: domains,
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false
    }, { status: 500 })
  }
}