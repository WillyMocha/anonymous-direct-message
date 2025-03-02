"use client";

import { useState } from "react";

export default function SendMessage() {
    const [recipientUsername, setRecipientUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

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

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Send Instagram DM</h2>
            <input
                type="text"
                placeholder="Recipient Username"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="border p-2 rounded w-full mb-2"
            />
            <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 rounded w-full mb-2"
            />
            <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded w-full"
            >
                {loading ? "Sending..." : "Send Message"}
            </button>
            {response && <p className="mt-2 text-sm">{response}</p>}
        </div>
    );
}
