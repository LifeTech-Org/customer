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
        }, Math.floor(Math.random() * 15000) + 20000)
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] items-center flex">
            <div className="w-full h-lvh sm:max-w-xl sm:h-auto sm:mx-auto bg-[var(--secondary)] shadow-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-gray-300">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-300">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
                        <Image src="/kali.avif" alt="Company Logo" width={32} height={32} className="rounded" />
                        <span className="font-semibold text-lg text-[var(--primary)]">Kali Supplements</span>
                    </Link>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-6 space-y-6 flex flex-col justify-center items-center text-center">
                    <h1 className="text-xl font-semibold text-[var(--primary)]">
                        👋 Welcome to Kali Supplements
                    </h1>
                    <p className="text-sm text-gray-600 max-w-sm">
                        We typically respond within{" "}
                        <span className="text-[var(--primary)] font-medium">2 minutes</span>. Click below to start chatting with us!
                    </p>

                    <button
                        onClick={handleStart}
                        disabled={waiting}
                        className="px-6 py-2 rounded-full bg-[var(--primary)] cursor-pointer hover:bg-green-700 text-white shadow-md disabled:opacity-50 transition-colors"
                    >
                        {waiting ? "Please wait…" : "Send Hi"}
                    </button>

                    {waiting && (
                        <p className="text-xs text-gray-500 italic mt-2">
                            Waiting for customer support...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
