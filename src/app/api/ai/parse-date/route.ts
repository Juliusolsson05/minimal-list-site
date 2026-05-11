import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJSON } from '@/lib/ai';

interface ParsedDate {
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      Convert this natural language date description to a specific date.

      Input: "${text}"
      Today's date: ${today}

      Rules:
      - "Early [month]" = around the 5th-8th of that month
      - "Mid [month]" = around the 15th of that month
      - "Late [month]" = around the 25th of that month
      - "Summer 2023" = July 15, 2023
      - "Last week" = 7 days before today
      - "Yesterday" = 1 day before today
      - If no year specified, assume the most recent occurrence
      - Always return a valid date in YYYY-MM-DD format

      Return JSON with a "date" field containing the date in YYYY-MM-DD format.
    `;

    const data = await generateJSON<ParsedDate>({
      prompt,
      schemaName: 'parsed_date',
      schema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
        },
        required: ['date'],
      },
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error parsing date:', error);
    return NextResponse.json(
      { error: 'Failed to parse date' },
      { status: 500 }
    );
  }
}
