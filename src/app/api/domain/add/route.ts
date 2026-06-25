import mongoose, { trusted } from 'mongoose'
import { dbConnection } from '@/src/db/dbConnection';
import { Domain } from '@/src/model/domainmodel'
import { NextRequest, NextResponse } from 'next/server';
import { getDataFromJwt } from '@/src/utilities/getDataFromJwt';


await dbConnection();

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;


export async function POST(request: NextRequest) {
  try {

    //get user id
    if (!request.cookies.get("token")?.value) {
      return NextResponse.json({
        message: "Please login first!",
        success: false
      }, { status: 403 })
    }
    const userData = await getDataFromJwt(request);
    // console.log("User data from jwt: ",userData)


    const reqBody = await request.json();
    const { domain } = reqBody;
    console.log("domain: ", domain);
    if (!domain) {
      return NextResponse.json({
        message: "Domain name is required!",
        success: false,
      }, { status: 400 })
    }

    if (!DOMAIN_REGEX.test(domain)) {
      return NextResponse.json({ message: "Syntax error: Invalid domain format!", success: false }, { status: 400 });
    }


    //call the fetch method to get the domain data
    const rawDomainDetails = await fetch(`https://rdap.org/domain/${domain}`);

    // check for invalid domain name
    if (!rawDomainDetails.ok) {
      const status = rawDomainDetails.status;
      const errorMsg = status === 404 ? "Domain name does not exist!" : "Error fetching domain details from RDAP.";
      return NextResponse.json({ message: errorMsg, success: false }, { status: status === 404 ? 404 : 400 });
    }

    const parsedDomainDetails = await rawDomainDetails.json()
    // console.log("domaindetails: ", parsedDomainDetails?.events)
    // store the domain the db 
    
    if (!parsedDomainDetails.events || parsedDomainDetails.events.length == 0) {
      return NextResponse.json({
        message: "Invalid Domain name",
        success: false,
      }, { status: 400 })
    }

    const domainDetails = parsedDomainDetails.events;

    let registrationDate = ''
    let expiryDate = ''

    for (const details of domainDetails) {
      if (details.eventAction == "registration") {
        // console.log("registration: ",details.eventDate);
        const regisdata = details.eventDate.split('T')[0]
        console.log("regisdate: ", regisdata);
        registrationDate = regisdata;
      }
      if (details.eventAction == "expiration") {
        // console.log("expiration: ",details.eventDate);
        const expiration = details.eventDate.split('T')[0]
        console.log("expiry: ", expiration);
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
    }, { status: 201 })

  } catch (error: any) {
    console.log("Error while adding domain ", error.message);
    return NextResponse.json({
      message: error.message,
      success: false,
    }, { status: 500 })
  }
}
