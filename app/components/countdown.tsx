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
        <div className="w-full flex justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white font-mono text-lg px-6 py-2 rounded-full shadow-lg border border-gray-700 backdrop-blur-sm">
                <span className="tracking-widest">{formatTime(timeLeft)}</span>
            </div>
        </div>
    );
}
