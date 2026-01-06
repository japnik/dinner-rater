import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();
        let result;

        if (session?.user?.id) {
            // Private Workspace
            result = await db.execute({
                sql: 'SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC',
                args: [session.user.id]
            });
        } else {
            // Universal Workspace
            result = await db.execute('SELECT * FROM events WHERE user_id IS NULL ORDER BY created_at DESC');
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        const { name, dishes } = await request.json();

        if (!name || !dishes || !Array.isArray(dishes) || dishes.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const date = new Date().toISOString().split('T')[0];
        const userId = session?.user?.id || null;

        const eventResult = await db.execute({
            sql: 'INSERT INTO events (name, date, user_id) VALUES (?, ?, ?) RETURNING id',
            args: [name, date, userId]
        });

        const eventId = eventResult.rows[0].id;

        const dishStatements = dishes.map(dishName => ({
            sql: 'INSERT INTO dishes (event_id, name) VALUES (?, ?)',
            args: [eventId, dishName]
        }));

        await db.batch(dishStatements);

        return NextResponse.json({ id: eventId }, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
