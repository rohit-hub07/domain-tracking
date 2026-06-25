import { NextRequest, NextResponse } from 'next/server';
import { dbConnection } from '@/src/db/dbConnection';
import { Domain } from '@/src/model/domainmodel';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Secret Security Token to protect endpoint from public invocation
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized execution' }, { status: 401 });
    }

    // 2. Initialise Database Connection
    await dbConnection();

    // 3. Retrieve Domains to check (Limit chunk sizes to prevent timeouts)
    const domainsToSync = await Domain.find({}).limit(50); 
    const syncResults = { updated: 0, failed: 0, logs: [] as string[] };

    // 4. Batch Process RDAP Queries
    for (const doc of domainsToSync) {
      try {
        const response = await fetch(`https://rdap.org{doc.name}`, {
          headers: { 'User-Agent': 'NextJs-Domain-Monitor/1.0' },
          next: { revalidate: 0 } // Bypass Next.js cache layer
        });

        if (!response.ok) {
          syncResults.failed++;
          continue;
        }

        const data = await response.json();
        if (!data.events) continue;

        let registrationDate = doc.registration;
        let expiryDate = doc.expiry;

        for (const item of data.events) {
          if (item.eventAction === 'registration' && item.eventDate) {
            registrationDate = item.eventDate.split('T')[0];
          }
          if (item.eventAction === 'expiration' && item.eventDate) {
            expiryDate = item.eventDate.split('T')[0];
          }
        }

        // 5. Atomic database update
        await Domain.updateOne(
          { _id: doc._id },
          { $set: { registration: registrationDate, expiry: expiryDate } }
        );
        syncResults.updated++;

      } catch (innerError: any) {
        syncResults.failed++;
        syncResults.logs.push(`Error updating ${doc.name}: ${innerError.message}`);
      }
    }

    return NextResponse.json({ message: 'Sync complete', stats: syncResults }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
