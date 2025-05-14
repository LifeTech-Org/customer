"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IoSend } from "react-icons/io5";
import { useRouter, useParams } from "next/navigation";

type Chat = { type: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const sendMessageToAssistant = async (message: string) => {
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });
    const data = await res.json();
    setMessages((msgs) => [...msgs, { type: "assistant", text: data.reply }]);
    setLoading(false);
  };

  const sendMessage = (e: any, msgOverride?: string) => {
    e.preventDefault();
    if (!input && !msgOverride) return;
    const userMessage = msgOverride ?? input;
    setInput("");
    setMessages((current) => [...current, { type: "user", text: userMessage }]);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setLoading(false);
    };
    if (sessionId) fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.type === "user") {
      const timeout = setTimeout(() => {
        sendMessageToAssistant(last.text);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  const Avatar = ({ type }: { type: "user" | "assistant" }) => (
    <Image
      src={type === "user" ? "/mark.jpg" : "/elon.jpeg"}
      alt={`${type} avatar`}
      className="w-8 h-8 rounded-full object-cover shadow-md"
      height={80}
      width={80}
    />
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] items-center flex">
      <div className="w-full h-lvh sm:max-w-xl sm:h-[90vh] sm:mx-auto bg-[var(--secondary)] shadow-2xl sm:rounded-2xl overflow-hidden flex flex-col border border-gray-300">
        {/* Header with logo */}
        <div className="px-6 py-4 border-b border-gray-300">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <Image src="/elon.jpeg" alt="Company Logo" width={32} height={32} className="rounded" />
            <span className="font-semibold text-lg text-[var(--primary)]">Kali Supplements</span>
          </Link>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-[#ccc]">
          {!sessionId && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500 space-y-4">
              <p className="max-w-sm">
                👋 <strong>Welcome!</strong> We typically respond within{" "}
                <span className="text-[var(--primary)] font-medium">2 minutes</span>. Feel free to start the conversation — we’re here to help.
              </p>
              <button
                onClick={() => router.push("/")}
                className="cursor-pointer bg-[var(--primary)] hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm transition-colors shadow-md"
              >
                Back to Homepage
              </button>
            </div>
          )}

          {/* Loading spinner while fetching */}
          {loading && !messages.length && (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-end gap-3 ${msg.type === "user" ? "justify-end flex-row-reverse" : "justify-start"}`}
              >
                <Avatar type={msg.type} />
                <div
                  className={`px-4 py-3 text-sm max-w-xs rounded-2xl shadow-md ${msg.type === "user"
                    ? "bg-[var(--primary)] text-white rounded-br-none"
                    : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {loading && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 justify-start"
              >
                <Avatar type="assistant" />
                <div className="px-4 py-3 text-sm bg-[var(--card)] text-[var(--foreground)] rounded-2xl rounded-bl-none shadow-md">
                  Typing...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {sessionId && (
          <form className="flex items-center p-4 border-t border-gray-300 bg-[var(--secondary)]">
            <input
              value={input}
              required
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
              className="flex-1 px-4 py-2 rounded-full bg-[#f9f9f9] text-sm text-[var(--foreground)] placeholder-gray-500 border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Ask me anything..."
            />
            <button
              onClick={(e) => sendMessage(e)}
              className="ml-2 h-10 w-10 bg-[var(--primary)] hover:bg-green-700 text-white flex items-center justify-center cursor-pointer rounded-full text-sm transition-colors shadow-md"
            >
              <IoSend size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
