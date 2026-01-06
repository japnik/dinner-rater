import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const { userName, votes } = await request.json();
        // votes should be array of { dishId, rating }

        if (!userName || !votes || !Array.isArray(votes)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const statements = votes.map(vote => ({
            sql: 'INSERT INTO votes (dish_id, user_name, rating) VALUES (?, ?, ?)',
            args: [vote.dishId, userName, vote.rating]
        }));

        await db.batch(statements);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
