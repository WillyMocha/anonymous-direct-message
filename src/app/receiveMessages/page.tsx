'use client';

import { useEffect, useState } from 'react';

interface InstagramUser {
    username: string;
}

interface InstagramMessage {
    users: InstagramUser[];
    last_permanent_item?: { text?: string };
}

export default function InstagramDM() {
    const [messages, setMessages] = useState<InstagramMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMessages() {
            setLoading(true);
            try {
                const response = await fetch('/api/loadMessages');
                if (!response.ok) throw new Error('Failed to fetch messages');
                const data = await response.json();
                setMessages(data.messages);
            } catch (err: any) {
                setError(err.message);
            }
            setLoading(false);
        }

        fetchMessages();
        const interval = setInterval(fetchMessages, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, []);

    return (
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
    );
}
