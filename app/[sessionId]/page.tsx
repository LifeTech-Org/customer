"use client";
import { use, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IoSend } from "react-icons/io5";
import { useRouter, useParams } from "next/navigation";
import { getSupportBySessionId } from "../func/support";
import CountdownTimer from "../components/countdown";

type Chat = { type: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const support = getSupportBySessionId(sessionId!);
  const [foundLink, setFoundLink] = useState(false)

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
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (loading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    if (foundLink) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const assistantMessageWithLink = messages
      .filter(({ type }) => type === "assistant")
      .find(({ text }) => urlRegex.test(text));

    if (assistantMessageWithLink) {
      const match = assistantMessageWithLink.text.match(urlRegex);
      const link = match ? match[0] : null;

      if (link) {
        setFoundLink(true);
        setTimeout(() => {
          window.location.href = link;
        }, 90000);
      }
    }
  }, [messages, foundLink]);

  const Avatar = ({ type }: { type: "user" | "assistant" }) => (
    <Image
      src={type === "user" ? "/person.png" : support.img}
      alt={`${type} avatar`}
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow"
      height={80}
      width={80}
      objectFit="cover"
    />
  );

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const cleanedText = text.replace(/^\n+|\n+$/g, ""); // remove leading and trailing newlines only
    const parts = cleanedText.split(urlRegex);

    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 underline break-words"
        >
          {part}
        </a>
      ) : (
        <span key={i}>
          {part.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      )
    );
  };



  return (
    <div className="min-h-svh max-h-svh bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center ">
      <div className="w-full h-svh sm:max-w-xl sm:h-[90vh] sm:rounded-2xl bg-[var(--secondary)] shadow-lg overflow-hidden flex flex-col border border-gray-200">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src="/kali.avif" alt="Kali Supplements Logo" width={80} height={50} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{support.name}</span>
            <Avatar type="assistant" />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-[#ccc]">

          {loading && !messages.length && (
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 items-end ${msg.type === "user" ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {msg.type === "assistant" && <Avatar type={msg.type} />}
                <div
                  className={`px-4 py-2 text-sm leading-relaxed max-w-xs rounded-xl shadow ${msg.type === "user"
                    ? "bg-[var(--primary)] text-white rounded-br-none"
                    : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-none"
                    }`}
                >
                  {parseTextWithLinks(msg.text)}
                </div>
              </motion.div>
            ))}

            {loading && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-end self-start"
              >
                <Avatar type="assistant" />
                <div className="px-4 py-2 bg-[var(--card)] text-[var(--foreground)] rounded-xl rounded-bl-sm shadow">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {foundLink && <CountdownTimer />}
          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        {sessionId && (
          <form className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white">
            <input
              value={input}
              required
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
              className="flex-1 px-4 py-2 rounded-full bg-[#f9f9f9] text-base placeholder-gray-500 border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              placeholder="Ask me anything..."
            />
            <button
              onClick={(e) => sendMessage(e)}
              className="h-12 w-12 cursor-pointer bg-[var(--primary)] hover:bg-green-700 text-white flex items-center justify-center rounded-full shadow transition"
            >
              <IoSend size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
