import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "glass rounded-2xl p-6 text-white",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
