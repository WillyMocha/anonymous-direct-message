import { NextResponse } from "next/server";
import { IgApiClient, IgCheckpointError } from "instagram-private-api";
import { readFileSync, writeFileSync, existsSync } from "fs";
import readline from "readline"; // Allows user input in the terminal

const ig = new IgApiClient();

async function loginInstagram() {
    ig.state.generateDevice(process.env.IG_USERNAME as string);

    if (existsSync("session.json")) {
        console.log("Loading Instagram session...");
        const savedSession = JSON.parse(readFileSync("session.json", "utf-8"));
        await ig.state.deserialize(savedSession);
        console.log("Session loaded successfully.");
    } else {
        try {
            console.log("Attempting Instagram login...");
            await ig.account.login(process.env.IG_USERNAME as string, process.env.IG_PASSWORD as string);

            console.log("Login successful. Saving session...");
            const sessionData = await ig.state.serialize();
            writeFileSync("session.json", JSON.stringify(sessionData));
        } catch (error) {
            if (error instanceof IgCheckpointError) {
                console.log("🔴 Instagram is asking for verification. Handling challenge...");
    
                // Request Instagram to send a verification code
                await ig.challenge.auto(true);
                console.log("Instagram has sent a verification code. Check your email or SMS.");
    
                // Prompt the user to enter the verification code manually
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
    
                rl.question("Enter the verification code received from Instagram: ", async (code) => {
                    await ig.challenge.sendSecurityCode(code);
                    console.log("✅ Verification completed.");
                    rl.close();
                });
    
                return;
            }
    
            console.error("Instagram login failed:", error);
            throw error;
        }
    }
}

export async function POST(req: Request) {
    try {
        console.log("Received API request...");

        const body = await req.json();
        console.log("Request body:", body);

        const { recipientUsername, message } = body;

        if (!recipientUsername || !message) {
            console.error("Missing recipientUsername or message.");
            return NextResponse.json({ success: false, message: "Missing recipientUsername or message" }, { status: 400 });
        }

        console.log("Logging into Instagram...");
        await loginInstagram();
        console.log("Logged in successfully.");

        console.log(`Searching for recipient: ${recipientUsername}`);
        let recipientUser;

        try {
            recipientUser = await ig.user.searchExact(recipientUsername);
        } catch (error: any) {
            console.error(`Recipient '${recipientUsername}' not found.`, error);
            return NextResponse.json({ success: false, message: "Recipient user not found", error: error.message }, { status: 404 });
        }

        const recipientId = recipientUser?.pk;
        if (!recipientId) {
            console.error(`Invalid recipient ID for username: ${recipientUsername}`);
            return NextResponse.json({ success: false, message: "Invalid recipient ID" }, { status: 404 });
        }

        console.log(`Sending message to ${recipientUsername} (ID: ${recipientId})`);
        await ig.entity.directThread([recipientId.toString()]).broadcastText(message);

        console.log("Message sent successfully.");
        return NextResponse.json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
        console.error("Error in API handler:", error);
        return NextResponse.json({ success: false, message: "Failed to send message", error: error.message }, { status: 500 });
    }
}