'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CreateEvent() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [dishes, setDishes] = useState(['', '']); // Start with 2 empty slots
    const [loading, setLoading] = useState(false);

    const addDish = () => {
        setDishes([...dishes, '']);
    };

    const removeDish = (index) => {
        if (dishes.length <= 1) return;
        const newDishes = [...dishes];
        newDishes.splice(index, 1);
        setDishes(newDishes);
    };

    const updateDish = (index, value) => {
        const newDishes = [...dishes];
        newDishes[index] = value;
        setDishes(newDishes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const validDishes = dishes.filter(d => d.trim() !== '');
        if (!name.trim() || validDishes.length === 0) {
            alert('Please enter an event name and at least one dish.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    dishes: validDishes,
                }),
            });

            if (!res.ok) throw new Error('Failed to create event');

            const data = await res.json();
            router.push(`/event/${data.id}`);
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="max-w-md mx-auto p-6 pb-20 space-y-8 min-h-screen flex flex-col">
            <header className="flex items-center gap-4 pt-4">
                <Link href="/" className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/80">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">New Dinner</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60 ml-1">Event Name</label>
                        <Input
                            placeholder="e.g. Taco Tuesday 🌮"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-lg py-3"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-medium text-white/60">Dishes to Rate</label>
                        </div>

                        {dishes.map((dish, index) => (
                            <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Input
                                    placeholder={`Dish ${index + 1}`}
                                    value={dish}
                                    onChange={(e) => updateDish(index, e.target.value)}
                                />
                                {dishes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDish(index)}
                                        className="p-3 rounded-xl glass hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addDish}
                        className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40"
                    >
                        <Plus className="w-4 h-4 mr-2 inline" />
                        Add Another Dish
                    </Button>
                </div>

                <div className="mt-auto pt-8">
                    <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full py-4 text-lg shadow-xl shadow-violet-500/20"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            "Start Dinner Event"
                        )}
                    </Button>
                </div>
            </form>
        </main>
    );
}
