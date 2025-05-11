
import { client } from '@/app/lib/gel';
import { NextResponse } from 'next/server';
import e from "@/../dbschema/edgeql-js"
import { parseTimeZoneBeforePOST } from '@/app/lib/utils';

// Ensure the route runs in Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reqTime:string[] = searchParams.get('sessionTime')!.split('-')

    const queryKeys = Array.from(searchParams.keys()).map((item) => {
      return {[item]: searchParams.get(item)}
    })

    // function deepMerge(target:any, source:any) {
    //   const output = { ...target };
    //   for (const key in source) {
    //     if (Object.prototype.hasOwnProperty.call(source, key)) {
    //       if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
    //         output[key] = deepMerge(output[key] || {}, source[key]);
    //       } else {
    //         output[key] = source[key];
    //       }
    //     }
    //   }
    //   return output;
    // }

    // const mergedObject = queryKeys.reduce((acc, curr) => deepMerge(acc, curr), {});

    const sessionShape = {
      id: true,
      sessionTime: true,
      sessionIndex: true,
      sessionType: true,
      sessionDuration: true
    }

    if (id) {
      const result = await e.select(e.Session,  (session) => ({
        ...sessionShape,
        filter_single: {id: id}
      })).run(client)

      if (!result) {
        return NextResponse.json(
          { error: `Session with ID ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(result, { status: 200 });
    } else if (reqTime) {
      console.log(`ROUTE session reached, requesting Time for ==> `, reqTime)
      const query = `
        select Session {
          id,
          sessionType,
          sessionTime,
          sessionDuration
        }
        filter std::datetime_get(.sessionTime, 'year') = <int64>$year
          and std::datetime_get(.sessionTime, 'month') = <int64>$month
          and std::datetime_get(.sessionTime, 'day') = <int64>$day;
        `;

      const result = await client.query(query, {
        year: Number(reqTime[0]),
        month: Number(reqTime[1]),
        day: Number(reqTime[2]),
      });

      console.log(`Result reached ==> `, result)

      return NextResponse.json(result, { status: 200 });
    } else {
      // Fetch all entries (existing behavior)
      const result = await e.select(e.Session, (session) => (sessionShape)).run(client)
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    console.error('Error querying GelDATA:', error);
    return NextResponse.json(
      { error: `Failed to fetch entry(ies) ${error} as per: ${JSON.stringify(request)}` },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionTime, sessionDuration, sessionIndex, sessionType, sessionEntry } = body;

    // Validate input
    if (!sessionTime || !sessionDuration || typeof sessionIndex !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const result = await e.insert(e.Session, {
      sessionTime: sessionTime,
      sessionDuration: sessionDuration,
      sessionIndex: sessionIndex,
      sessionType: sessionType,
      entry: e.select(e.Entry, () => ({
        filter_single: {id: e.uuid(sessionEntry.id)}
      }))
    }).run(client)

    return NextResponse.json(result.id, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
