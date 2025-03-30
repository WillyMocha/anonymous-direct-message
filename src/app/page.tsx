"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IoIosSend } from "react-icons/io";

interface InstagramUser {
    username: string;
}

interface InstagramMessage {
    users: InstagramUser[];
    last_permanent_item?: { text?: string };
}

export default function Home() {
    const [recipientUsername, setRecipientUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [messages, setMessages] = useState<InstagramMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async () => {
        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch("/api/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientUsername, message }),
            });

            const data = await res.json();
            if (data.success) {
                setResponse("✅ Message sent successfully!");
            } else if (res.status === 404) {
                setResponse("❌ Recipient user not found. Check the username.");
            } else {
                setResponse(`❌ Failed: ${data.message}`);
            }
        } catch (error) {
            setResponse("❌ Error sending message");
        }

        setLoading(false);
    };

    useEffect(() => {
      async function fetchMessages() {
          setLoading(true);
          try {
              const response = await fetch('/api/loadMessage');
              if (!response.ok) throw new Error('Failed to fetch messages');
              const data = await response.json();
              setMessages(data.messages);
          } catch (err: any) {
              setError(err.message);
          }
          setLoading(false);
      }

      fetchMessages();
      // const interval = setInterval(fetchMessages, 30000); // Poll every 30s

      // return () => clearInterval(interval);
  },[]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by type recepient instagram id.
          </li>
          <li className="mb-2">
            Type your message.
          </li>
          <li>Send.</li>
        </ol>
        <div className="text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] w-full">
          <input
            type="text"
            id="instaid"
            name="instaid"
            className="rounded-lg border border-solid border-transparent transition-colors flex bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-5 px-4 sm:px-5 w-full"
            placeholder="Type recepient instagram id."
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
          ></input>
        </div>
        <div className="text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] w-full">
          <textarea
            id="message"
            name="message"
            className="rounded-lg border border-solid border-transparent transition-colors flex bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
            placeholder="Type your message here."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="w-full">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12"
            rel="noopener noreferrer"
            onClick={sendMessage}
            disabled={loading}
          >
            <IoIosSend className="w-5 h-5" />
            {loading ? "Sending..." : "Send Now !"}
          </button>
          {response && <p className="mt-2 text-sm">{response}</p>}
          {/* <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a> */}
        </div>
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Instagram Direct Messages</h1>
            {loading && <p>Loading messages...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            <ul>
                {messages.map((thread, index) => (
                    <li key={index} className="border-b p-2">
                        <strong>
                            {thread.users.map((u) => u.username).join(', ')}
                        </strong>
                        : {thread.last_permanent_item?.text ?? 'No message'}
                    </li>
                ))}
            </ul>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
