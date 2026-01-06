import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all",
                className
            )}
            {...props}
        />
    );
}
