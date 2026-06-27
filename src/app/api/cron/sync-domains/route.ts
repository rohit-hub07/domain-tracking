export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensures older Next.js versions don't cache this route

import { NextRequest, NextResponse } from "next/server";
import { dbConnection } from "@/src/db/dbConnection";
import { Domain } from "@/src/model/domainmodel";
import { User } from "@/src/model/usermodel";
import { sendEmail } from "@/src/lib/mail";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: "Unauthorized execution" },
        { status: 401 }
      );
    }

    await dbConnection();
    console.log(User);

    await sendEmail(
      "rohitsingh986491@gmail.com",
      "Cron Test",
      `
    <h2>🎉 Cron Job is Working!</h2>
    <p>If you received this email, your cron route executed successfully.</p>
    <p>Time: ${new Date().toLocaleString()}</p>
  `
    );

    console.log("✅ Cron job started");

    const domainsToSync = await Domain.find({})
      .populate("userId", "email username")

    const syncResults = {
      updated: 0,
      failed: 0,
      emailsSent: 0,
      logs: [] as string[],
    };

    const reminderDays =[30,15,7,3,1];

    const emailMap = new Map<
      string,
      {
        username: string;
        domains: {
          name: string;
          remainingDays: number;
        }[];
      }
    >();

    // This now processes all domains concurrently in parallel
    await Promise.all(
      domainsToSync.map(async (doc) => {
        try {
          const response = await fetch(
            `https://rdap.org/domain/${doc.name}`,
            {
              headers: {
                "User-Agent": "NextJs-Domain-Monitor/1.0",
              },
              cache: "no-store",
            }
          );

          if (!response.ok) {
            syncResults.failed++;
            return;
          }

          const data = await response.json();

          let registrationDate = doc.registration;
          let expiryDate = doc.expiry;

          for (const event of data.events ?? []) {
            if (
              event.eventAction === "registration" &&
              event.eventDate
            ) {
              registrationDate = event.eventDate.split("T")[0];
            }

            if (
              event.eventAction === "expiration" &&
              event.eventDate
            ) {
              expiryDate = event.eventDate.split("T")[0];
            }
          }

          await Domain.updateOne(
            { _id: doc._id },
            {
              $set: {
                registration: registrationDate,
                expiry: expiryDate,
              },
            }
          );

          syncResults.updated++;

          // Remaining days calculation
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiry = new Date(expiryDate);
          expiry.setHours(0, 0, 0, 0);

          const remainingDays = Math.ceil(
            (expiry.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
          );

          if (reminderDays.includes(remainingDays)) {
            const user: any = doc.userId;

            if (!emailMap.has(user.email)) {
              emailMap.set(user.email, {
                username: user.username || "User",
                domains: [],
              });
            }

            emailMap.get(user.email)?.domains.push({
              name: doc.name,
              remainingDays,
            });
          }
        } catch (error: any) {
          syncResults.failed++;
          syncResults.logs.push(
            `${doc.name}: ${error.message}`
          );
        }
      })
    );
    // THIS LINE WAS THE STRAY BRACE THAT IS NOW REMOVED SUCCESSFULLY!

    // Send one email per user
    for (const [email, userData] of emailMap) {
      const html = `
      <div style="font-family:Arial,sans-serif">
      <h2>Domain Expiry Reminder</h2>
      <p>Hello <b>${userData.username}</b>,</p>
      <p>The following domains are approaching their expiration date.</p>
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse">
        <tr>
          <th>Domain</th>
          <th>Remaining Days</th>
        </tr>
        ${userData.domains
          .map(
            (domain) => `
            <tr>
              <td>${domain.name}</td>
              <td>${domain.remainingDays}</td>
            </tr>
          `
          )
          .join("")}
      </table>
      <br/>
      <p>Please renew these domains before they expire.</p>
      <p>Regards,<br/>Domain Tracker</p>
      </div>
      `;

      await sendEmail(email, "Domain Expiry Reminder", html);
      syncResults.emailsSent++;
    }

    return NextResponse.json(
      { message: "Sync completed successfully.", stats: syncResults },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
