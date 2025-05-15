"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
    const [waiting, setWaiting] = useState(false);
    const router = useRouter();

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
                alert("Failed to start chat session");
                setWaiting(false);
            }
        }, 1)
    };

    return (
        <div className="min-h-svh bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch max-w-5xl w-full gap-6">

                {/* Hero Image */}
                <div className="relative w-full sm:w-1/2 h-64 sm:h-auto">
                    <Image
                        src="/transresveratol.jpeg" // Replace with your image in /public
                        alt="Trans-Resveratrol Bottles"
                        fill
                        className="object-cover rounded-2xl shadow-xl"
                        priority
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
                        <h1 className="text-xl font-bold text-[var(--primary)] underline">
                            Longevity Pre-Qualification
                        </h1>
                        <p className="text-sm text-gray-600 max-w-md">
                            Our Customer Care Team is Ready to Help You Qualify for Our Most Powerful Longevity Formula. Just answer a few quick questions — takes less than 60 seconds — and we'll match you with the best option.
                        </p>

                        <button
                            onClick={handleStart}
                            disabled={waiting}
                            className="px-6 py-2 rounded-full bg-[var(--primary)] cursor-pointer hover:bg-green-700 text-white shadow-md disabled:opacity-50 transition-colors"
                        >
                            {waiting ? "The next available agent will connect with you shortly…" : "Connect With a Live Agent Now"}
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
    );
}
