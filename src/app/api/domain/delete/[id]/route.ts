import { dbConnection } from "@/src/db/dbConnection";
import { redis } from "@/src/lib/redis";
import { Domain } from "@/src/model/domainmodel";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(request: NextRequest,{params} : {params: Promise<{id: string}>}){
  try {
    await dbConnection();

    const resolveParam = await params;
    // find domain if it exists or not
    console.log('resolvedParam: ',resolveParam)
    const id = resolveParam.id;
    const domain = await Domain.findById(id);
    if(!domain){
      return NextResponse.json({
        message:"Requested domain doesn't exists!",
        success: false,
      },{status: 404})
    }

    await Domain.findByIdAndDelete(id);

    // removed the cache from redis
    await redis.del(`user:${domain.userId}:domain`)

    return NextResponse.json({
      message: "Domain deleted successfully!",
      success: true,
    },{status: 200})

  } catch (error: any) {
    console.log("Error while deleting domain:", error.message);
    return NextResponse.json({
      message: error.message,
      success: false
    },{status: 500})
  }
}