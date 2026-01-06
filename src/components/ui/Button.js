import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }) {
    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/30",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
        outline: "border border-white/20 hover:bg-white/10 text-white",
        ghost: "hover:bg-white/10 text-white",
    };

    return (
        <button
            className={cn(
                "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
