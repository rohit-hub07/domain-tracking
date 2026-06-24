import mongoose, { trusted } from 'mongoose'
import { dbConnection } from '@/src/db/dbConnection';
import { Domain } from '@/src/model/domainmodel'
import { NextRequest, NextResponse } from 'next/server';
import { getDataFromJwt } from '@/src/utilities/getDataFromJwt';


await dbConnection();

export async function POST(request: NextRequest){
  try {

    //get user id
    if(!request.cookies.get("token")?.value){
      return NextResponse.json({
        message: "Please login first!",
        success: false
      },{status: 403})
    }
    const userData = await getDataFromJwt(request);
    // console.log("User data from jwt: ",userData)

    
    const reqBody = await request.json();
    const {domain} = reqBody;
    console.log("domain: ", domain);
    if(!domain){
      return NextResponse.json({
        message: "Domain name is required!",
        success: false,
      },{status: 400})
    }
    //call the fetch method to get the domain data
    const rawDomainDetails= await fetch(`https://rdap.org/domain/${domain}`);
    const parsedDomainDetails = await rawDomainDetails.json()
    // console.log("domaindetails: ", parsedDomainDetails?.events)
    // store the domain the db 
    const domainDetails = parsedDomainDetails.events;

    let registrationDate = ''
    let expiryDate = ''

    for(const details of domainDetails){
      if(details.eventAction == "registration"){
        // console.log("registration: ",details.eventDate);
        const regisdata = details.eventDate.split('T')[0]
        console.log("regisdate: ",regisdata);
        registrationDate = regisdata;
      }
      if(details.eventAction == "expiration"){
        // console.log("expiration: ",details.eventDate);
        const expiration = details.eventDate.split('T')[0]
        console.log("expiry: ",expiration);
        expiryDate = expiration;
      }
    }

    // console.log("expiry and registraton",expiryDate, registration)

    // save to db
    const newDomain = await Domain.create({
      name: domain,
      registration: registrationDate,
      expiry: expiryDate,
      userId: userData?.id,
    })
    return NextResponse.json({
      message: "Domain added successfully!",
      success: trusted,
      domainDetails: newDomain
    },{status: 201})

  } catch (error: any) {
    console.log("Error while adding domain ", error.message);
    return NextResponse.json({
      message: error.message,
      success: false,
    }, { status: 500 })
  }
}
