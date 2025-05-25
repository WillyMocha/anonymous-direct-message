import { NextResponse } from "next/server";
import { initInstagram } from "@/lib/InstagramSession";  // Import initInstagram

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
    
    // Use initInstagram() to initialize the Instagram client
    const ig = await initInstagram();
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

//for testing using powershell
// Invoke-RestMethod -Uri "http://localhost:3000/api/sendMessage" `
// -Method Post `
// -Headers @{"Content-Type"="application/json"} `
// -Body (@{recipientUsername="willy.mocha"; message="Hello!"} | ConvertTo-Json -Depth 3)
