import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM events ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, dishes } = await request.json();

        if (!name || !dishes || !Array.isArray(dishes) || dishes.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const date = new Date().toISOString().split('T')[0];

        // We need to insert event first to get ID, then dishes.
        // Turso/libsql doesn't support returning ID from batch easily in one go if dependent.
        // So we do it in two steps. Transaction is ideal but batch is simple.
        // Actually, db.transaction() is available in newer libsql client but batch is safer for http.
        // Let's do it sequentially for now since we need the ID.

        const eventResult = await db.execute({
            sql: 'INSERT INTO events (name, date) VALUES (?, ?) RETURNING id',
            args: [name, date]
        });

        const eventId = eventResult.rows[0].id; // RETURNING id works in SQLite

        const dishStatements = dishes.map(dishName => ({
            sql: 'INSERT INTO dishes (event_id, name) VALUES (?, ?)',
            args: [eventId, dishName]
        }));

        await db.batch(dishStatements);

        return NextResponse.json({ id: eventId }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
