import type { NextApiRequest, NextApiResponse } from 'next';
import { IgApiClient } from 'instagram-private-api';

const ig = new IgApiClient();

async function loginInstagram() {
    ig.state.generateDevice(process.env.IG_USERNAME as string);
    try {
        await ig.account.login(process.env.IG_USERNAME as string, process.env.IG_PASSWORD as string);
    } catch (error: any) {
        if (error.name === 'IgCheckpointError') {
            console.log('Instagram is asking for verification.');
            console.log('Please check your Instagram account for a security challenge.');
        } else {
            throw error;
        }
    }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { recipientUsername, message } = req.body;

    if (!recipientUsername || !message) {
        return res.status(400).json({ message: 'Missing recipientUsername or message' });
    }

    try {
        console.log('Logging into Instagram...');
        await loginInstagram();
        console.log('Logged in successfully.');

        // Get user ID from username
        console.log(`Searching for recipient: ${recipientUsername}`);
        const recipientUser = await ig.user.searchExact(recipientUsername);
        const recipientId = recipientUser?.pk; // Instagram user ID

        if (!recipientId) {
            console.log('Recipient not found.');
            return res.status(404).json({ success: false, message: 'Recipient user not found' });
        }

        console.log(`Sending message to ${recipientUsername} (ID: ${recipientId})`);
        await ig.entity.directThread([recipientId.toString()]).broadcastText(message);

        console.log('Message sent successfully.');
        return res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
}

//for testing using powershell
// Invoke-RestMethod -Uri "http://localhost:3000/api/sendMessage" `
// -Method Post `
// -Headers @{"Content-Type"="application/json"} `
// -Body (@{recipientUsername="willy.mocha"; message="Hello!"} | ConvertTo-Json -Depth 3)
