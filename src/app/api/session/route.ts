
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

    const sessionShape = {
      id: true,
      sessionTime: true,
      sessionIndex: true,
      sessionType: true,
      sessionDuration: true
    }

    if (id) {
      // Fetch specific session by ID
      const result = await e.select(e.Session,  (session) => ({
        ...sessionShape,
        filter_single: e.op(session.id, '=', id)
      })).run(client)

      if (!result) {
        return NextResponse.json(
          { error: `Session with ID ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(result, { status: 200 });
    } else {
      // Fetch all entries (existing behavior)
      const result = await e.select(e.Session, (session) => (sessionShape)).run(client)
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
      sessionTime: parseTimeZoneBeforePOST(sessionTime),
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
