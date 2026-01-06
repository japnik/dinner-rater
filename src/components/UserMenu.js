'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { LogOut, User } from 'lucide-react';

export function UserMenu({ user }) {
    if (!user) {
        return (
            <Link href="/login">
                <Button className="bg-white/10 hover:bg-white/20 border-0 text-sm py-2 px-4 h-auto">
                    Login
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 pl-3 pr-2 py-1.5 rounded-full">
                {user.image ? (
                    <img src={user.image} alt={user.name} className="w-5 h-5 rounded-full" />
                ) : (
                    <User className="w-4 h-4" />
                )}
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
