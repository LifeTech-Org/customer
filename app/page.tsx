"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from 'sonner';


export default function HomePage() {
    const [waiting, setWaiting] = useState(false);
    const [minutes, setMinutes] = useState(3);
    const [seconds, setSeconds] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    setMinutes(3);
                    setSeconds(0);
                } else {
                    setMinutes(m => m - 1);
                    setSeconds(59);
                }
            } else {
                setSeconds(s => s - 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [minutes, seconds]);

    const handleStart = async () => {
        setWaiting(true);
        setTimeout(async () => {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Hi" }),
            });

            const data = await res.json();
            const sessionId = data.sessionId;

            if (sessionId) {
                setWaiting(false);
                router.push(`/${sessionId}`);
            } else {
                toast.error("Failed to start chat session. Please try again.", {
                    description: "If the issue persists, contact support.",
                });
                setWaiting(false);
            }
        }, 1);
    };

    return (
        <div className="min-h-svh sm:max-h-svh pb-8 sm:pb-0 bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-x-hidden">
            {/* Marquee */}
            <div className="banner flex items-center gap-12 px-4 select-none text-white bg-[var(--primary)] font-sm text-sm h-10 overflow-hidden relative whitespace-nowrap">
                {Array(12).fill(0).flatMap((_, i) => (
                    [
                        <div key={`resveratrol-${i}`}>#1 Resveratrol Formula on TikTok</div>,
                        <div key={`trusted-${i}`}>Trusted by 20,000+ customers — FDA-certified lab</div>
                    ]
                ))}
            </div>

            {/* Main content */}
            <div className="flex items-center justify-center px-4 flex-1 mt-6 sm:mt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-stretch max-w-5xl w-full gap-6">
                    {/* Hero Image */}
                    <div className="relative w-full sm:w-1/2 h-96 sm:h-auto">
                        <Image
                            src="/bg.png"
                            alt="Trans-Resveratrol Bottles"
                            fill
                            className="object-cover rounded-2xl shadow-xl"
                            priority
                            style={{ objectFit: "fill" }}
                        />
                    </div>

                    {/* CTA Panel */}
                    <div className="w-full sm:w-1/2 bg-[var(--secondary)] shadow-2xl rounded-2xl border border-gray-300 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-center border-b border-gray-300">
                            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
                                <Image src="/kali.avif" alt="Company Logo" width={150} height={100} className="rounded" />
                            </Link>
                        </div>

                        {/* Body Content */}
                        <div className="flex-1 p-6 space-y-6 flex flex-col justify-center items-center text-center">
                            <h1 className="text-xl font-bold text-[var(--primary)] underline">Longevity Pre-Qualification</h1>
                            <p className="text-sm text-gray-600 max-w-md">
                                Our Longevity Team Will Help You Qualify in Seconds. Only a handful of people qualify for this level
                                of anti-aging support. If you’re tired of feeling foggy, sluggish, or off your game — now’s your
                                moment. Answer 3 quick questions and see if your body qualifies. You’ll know in under a minute.
                            </p>

                            {/* Countdown Timer */}
                            <p className="text-sm text-red-600 font-semibold">
                                Agent slots are limited — next spot resets in [{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}]
                            </p>

                            <button
                                onClick={handleStart}
                                disabled={waiting}
                                className={`group relative px-6 py-2 rounded-full bg-[var(--primary)] text-white shadow-md transition-all duration-300 ease-in-out
                            ${waiting ? 'opacity-50 cursor-default' : 'hover:shadow-[0_0_12px_rgba(0,255,150,0.5)] cursor-pointer'}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {waiting ? (
                                        "The next available agent will connect with you shortly…"
                                    ) : (
                                        <>
                                            I’m Ready to Qualify Now
                                            <span className="inline-block ml-1 animate-[arrow-slide_1.2s_ease-in-out_infinite]">
                                                ➜
                                            </span>
                                        </>
                                    )}
                                </span>
                            </button>

                            {waiting && (
                                <div className="flex w-full justify-center">
                                    <div className="w-6 h-6 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
