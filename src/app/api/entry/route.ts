import { client } from '@/app/lib/gel';
import { NextResponse } from 'next/server';
import e from "@/../dbschema/edgeql-js"

// Ensure the route runs in Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const entryShape = {
      id: true,
      entryTime: true,
      entryEfficiency: true,
      entryJournal: true,
      entryName: true
    }

    if (id) {
      // Fetch specific entry by ID
      const result = await e.select(e.Entry,  (entry) => ({
        ...entryShape,
        filter_single: e.op(entry.id, '=', id)
      })).run(client)

      if (!result) {
        return NextResponse.json(
          { error: `Entry with ID ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(result, { status: 200 });
    } else {
      // Fetch all entries (existing behavior)
      const result = await e.select(e.Entry, (entry) => (entryShape)).run(client)
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    console.error('Error querying GelDATA:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const { entryTime, entryName, entryJournal } = body;
    const entryEfficiency = 5
    // const entryEfficiency = body.entryEfficiency > 0 || body.entryEfficiency < 10 ? body.entryEfficiency : 5
    // Validate input
    if (!entryTime || !entryName || typeof entryEfficiency !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }



    // const result = await client.query(
    //   `
    //   INSERT INTO default::Entry (entryTime, entryName, entryEfficiency, entryJournal)
    //   VALUES ($1, $2, $3, $4)
    //   RETURNING id, entryTime, entryName, entryEfficiency, entryJournal
    //   `,
    //   [entryTime, entryName, entryEfficiency, entryJournal]
    // );
    const result = await e.insert(e.Entry, {
      entryName: entryName,
      entryTime: entryTime,
      entryJournal: 'Testing Journal',
      entryEfficiency: entryEfficiency
    }).run(client)


    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
