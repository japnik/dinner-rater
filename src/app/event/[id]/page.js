'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Star, Trophy, Loader2, BarChart2, ThumbsDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function EventPage({ params }) {
    // params is a promise in Next 15, let's unwrap it if it is one, or just use it.
    // The 'use' hook is standard for unwrapping promises in components now if needed, 
    // but let's stick to standard async pattern or useEffect unwrapping.
    // Actually in Client Components, params is passed as prop, but let's just use it carefully.
    // Next 15 defines params as Promise for async compat.
    // Use `use` hook if available (React 19/Next 15) or plain wait if async.
    // Since I don't know the exact version, I will assume it might be a promise or object.
    // Safest valid React way is useEffect or use() hook.

    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const router = useRouter();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [ratings, setRatings] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (!res.ok) throw new Error('Event not found');
            const data = await res.json();
            setEventData(data);

            // Initialize ratings
            const initialRatings = {};
            data.dishes.forEach(d => initialRatings[d.id] = 5); // Default 5
            setRatings(initialRatings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (dishId, value) => {
        setRatings(prev => ({ ...prev, [dishId]: parseInt(value) }));
    };

    const submitVotes = async () => {
        if (!userName.trim()) {
            alert('Please enter your name');
            return;
        }

        setSubmitting(true);
        const votes = Object.entries(ratings).map(([dishId, rating]) => ({
            dishId: parseInt(dishId),
            rating
        }));

        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, votes })
            });

            if (!res.ok) throw new Error('Failed to vote');

            setShowResults(true);
            fetchEvent(); // Refresh results
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (error) {
            alert('Error submitting votes');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!eventData) return <div className="text-center p-10 text-white">Event not found</div>;

    return (
        <main className="max-w-md mx-auto p-6 pb-20 space-y-6 min-h-screen">
            <header className="flex items-center gap-4 pt-4">
                <Link href="/" className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/80">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-white">{eventData.event.name}</h1>
                    <p className="text-sm text-white/50">{new Date(eventData.event.date).toLocaleDateString()}</p>
                </div>
            </header>

            {!showResults ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-white/80">Who are you?</label>
                            <Input
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="text-lg bg-white/10 border-white/20"
                            />
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white/90">Rate the Dishes</h2>
                        {eventData.dishes.map((dish) => (
                            <Card key={dish.id} className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg">{dish.name}</h3>
                                    <span className="font-mono text-2xl font-bold text-violet-400">{ratings[dish.id]}<span className="text-sm text-white/40">/10</span></span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={ratings[dish.id] || 5}
                                    onChange={(e) => handleRatingChange(dish.id, e.target.value)}
                                    className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-white/30 uppercase tracking-wider">
                                    <span>Worst</span>
                                    <span>Best</span>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Button
                        onClick={submitVotes}
                        disabled={submitting}
                        className="w-full py-4 text-lg shadow-xl shadow-violet-500/20 mb-4"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : 'Submit Votes'}
                    </Button>

                    <button
                        onClick={() => setShowResults(true)}
                        className="w-full py-3 text-white/50 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <BarChart2 className="w-4 h-4" />
                        Skip directly to results
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border-white/10 text-center py-8">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                            {eventData.dishes[0]?.name || 'No Dishes'}
                        </h2>
                        <p className="text-white/60 text-sm mt-1">Winner</p>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        {eventData.dishes.length > 1 && (() => {
                            const loser = [...eventData.dishes].sort((a, b) => a.averageRating - b.averageRating)[0];
                            return (
                                <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 text-center py-6 flex flex-col items-center justify-center">
                                    <ThumbsDown className="w-8 h-8 text-red-400 mb-2" />
                                    <h3 className="font-bold text-red-200 line-clamp-1 px-2 mb-1">{loser.name}</h3>
                                    <p className="text-[10px] text-red-400/60 uppercase tracking-widest">Loser</p>
                                </Card>
                            );
                        })()}

                        {eventData.dishes.length > 1 && (() => {
                            const controversial = [...eventData.dishes].sort((a, b) => b.ratingRange - a.ratingRange || b.voteCount - a.voteCount)[0];
                            // Only show if there is some controversy (range > 0)
                            if (controversial && controversial.ratingRange > 0) {
                                return (
                                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-center py-6 flex flex-col items-center justify-center">
                                        <Zap className="w-8 h-8 text-blue-400 mb-2" />
                                        <h3 className="font-bold text-blue-200 line-clamp-1 px-2 mb-1">{controversial.name}</h3>
                                        <p className="text-[10px] text-blue-400/60 uppercase tracking-widest">Divisive</p>
                                    </Card>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider pl-1">Full Rankings</h3>
                        {eventData.dishes.map((dish, idx) => (
                            <div key={dish.id} className="relative">
                                <Card className={cn(
                                    "flex items-center gap-4 transition-all",
                                    idx === 0 ? "border-yellow-500/30 bg-yellow-500/5" : "hover:bg-white/5"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                        idx === 0 ? "bg-yellow-500 text-black" :
                                            idx === 1 ? "bg-slate-300 text-black" :
                                                idx === 2 ? "bg-amber-700 text-black" : "bg-white/10 text-white"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{dish.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-white/50">
                                            <span>{dish.voteCount} votes</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{dish.averageRating.toFixed(1)}</div>
                                        <div className="text-[10px] text-white/30 uppercase">Average</div>
                                    </div>
                                </Card>
                                {/* Progress Bar background could be cool here */}
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setShowResults(false)}
                        className="w-full mt-8"
                    >
                        Vote Again
                    </Button>
                </div>
            )}
        </main>
    );
}
