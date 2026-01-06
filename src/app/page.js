import Link from 'next/link';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserMenu } from '@/components/UserMenu';
import { Plus, Utensils } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  let events;
  let workspaceName = "Universal Workspace";

  if (user?.id) {
    workspaceName = `${user.name || "User"}'s Workspace`;
    const result = await db.execute({
      sql: 'SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC',
      args: [user.id]
    });
    events = result.rows;
  } else {
    // Universal
    const result = await db.execute('SELECT * FROM events WHERE user_id IS NULL ORDER BY created_at DESC');
    events = result.rows;
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-8 pb-20">
      <header className="relative text-center space-y-2 pt-8">
        <div className="absolute right-0 top-0">
          <UserMenu user={user} />
        </div>
        <div className="inline-flex p-4 rounded-full bg-white/5 mb-4 glass ring-1 ring-white/10">
          <Utensils className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
          Dinner Rater
        </h1>
        <p className="text-white/60">Rate meals with friends</p>
        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-violet-300 font-medium">
          {workspaceName}
        </div>
      </header>

      <section className="space-y-4">
        {events.length === 0 ? (
          <Card className="text-center py-12 space-y-4 bg-white/5 border-dashed border-white/20">
            <p className="text-white/50">No dinners recorded yet.</p>
            <Link href="/create">
              <Button>Start Your First Dinner</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            <Link href="/create" className="block">
              <Button className="w-full py-4 text-lg justify-center flex items-center gap-2 shadow-violet-500/20">
                <Plus className="w-5 h-5" />
                Start New Dinner
              </Button>
            </Link>

            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider pl-1 pt-4">Past Dinners</h2>

            {events.map(event => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="glass-hover transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.98]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-violet-300 transition-colors">{event.name}</h3>
                      <p className="text-sm text-white/50">{new Date(event.date || event.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      →
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
