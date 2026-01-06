import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
    try {
        // The params promise needs to be awaited in newer Next.js versions if accessing directly,
        // but here params is the second argument object. 
        // In Next.js 15+, params is a Promise. Let's handle both or check version.
        // For safety in creating new apps, we should await it if it's a promise, but it's passed as context.
        // Actually, in standard route handlers for App Router: `export async function GET(request, context)`
        // `context.params` is the params.

        // NOTE: Next.js 15 changes async params access. To be safe, let's treat it as potentially async or sync 
        // but usually in `context.params`.
        // Wait, let's just await it to be safe for Next.js 15.
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const eventResult = await db.execute({
            sql: 'SELECT * FROM events WHERE id = ?',
            args: [id]
        });
        const event = eventResult.rows[0];

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const dishesResult = await db.execute({
            sql: 'SELECT * FROM dishes WHERE event_id = ?',
            args: [id]
        });
        const dishes = dishesResult.rows;

        // Get votes for each dish to calculate averages
        const votesResult = await db.execute({
            sql: `
      SELECT dish_id, rating, user_name 
      FROM votes 
      WHERE dish_id IN (SELECT id FROM dishes WHERE event_id = ?)
    `,
            args: [id]
        });
        const votes = votesResult.rows;

        // Calculate averages and rankings
        const dishStats = dishes.map(dish => {
            const dishVotes = votes.filter(v => v.dish_id === dish.id);
            const totalRating = dishVotes.reduce((sum, v) => sum + v.rating, 0);
            const averageRating = dishVotes.length > 0 ? totalRating / dishVotes.length : 0;

            // Calculate min and max for controversy
            let minRating = 10;
            let maxRating = 0;

            if (dishVotes.length > 0) {
                dishVotes.forEach(v => {
                    if (v.rating < minRating) minRating = v.rating;
                    if (v.rating > maxRating) maxRating = v.rating;
                });
            } else {
                minRating = 0;
            }

            return {
                ...dish,
                averageRating,
                voteCount: dishVotes.length,
                minRating,
                maxRating,
                ratingRange: maxRating - minRating,
                votes: dishVotes // Include individual votes if needed
            };
        });

        // Sort by rating desc
        dishStats.sort((a, b) => b.averageRating - a.averageRating);

        return NextResponse.json({
            event,
            dishes: dishStats
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
