import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const { email, name, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingInfo = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        if (existingInfo.rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        await db.execute({
            sql: 'INSERT INTO users (email, name, password, provider) VALUES (?, ?, ?, ?)',
            args: [email, name || '', hashedPassword, 'credentials']
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
