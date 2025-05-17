"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer({ seconds = 900 }: { seconds?: number }) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, "0");
        const secs = (s % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    if (timeLeft <= 0) return null;

    return (
        <div className="w-full flex flex-col items-center z-50 pointer-events-none space-y-2">
            <div className="text-sm text-red-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                Due to high demand, your recommendation is reserved for a limited time.
            </div>
            <div className="text-gray-800 font-mono text-lg px-5 py-1.5 rounded-full shadow-sm border border-gray-300 bg-white/90 backdrop-blur-sm">
                <span className="tracking-widest">{formatTime(timeLeft)}</span>
            </div>
        </div>
    );
}
