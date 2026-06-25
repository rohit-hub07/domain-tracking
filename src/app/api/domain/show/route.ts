import { dbConnection } from "@/src/db/dbConnection";
import { Domain } from "@/src/model/domainmodel";
import { User } from "@/src/model/usermodel";
import { getDataFromJwt } from "@/src/utilities/getDataFromJwt";
import { NextRequest, NextResponse } from "next/server";

dbConnection();

export async function GET(request: NextRequest){
  try {
    if(!request.cookies.get("token")?.value){
      return NextResponse.json({
        message: "Please login!",
        success: false,
      },{status: 403})
    }

    const userData = await getDataFromJwt(request);
    // get the current logged in user
    const currentUser = await User.findById(userData.id);
    console.log("Current user inside of show api:", currentUser)
    if(!currentUser){
      return NextResponse.json({
        message: "Please login!",
        success: false,
      },{status: 403})
    }

    // find all the domain details for the loggedIn user
    const domains = await Domain.findOne({userId: currentUser._id})
    console.log("Domain of the user: ", domains);
    
    return NextResponse.json({
      message: "Domains Fecthed successfully!",
      success: true,
      domains: domains,
    },{status: 200})

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      success: false
    },{status: 500})    
  }
}