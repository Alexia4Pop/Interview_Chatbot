import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // CITIM roomName trimis de client, nu generăm unul nou aici!
        const { participantName, roomName } = await request.json();

        if (!participantName || !roomName) {
            return NextResponse.json({ error: "Missing data (name or room)" }, { status: 400 });
        }

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                // Identitate unică pentru tine
                identity: `${participantName}-${Math.floor(Math.random() * 10000)}`,
            }
        );

        at.addGrant({
            roomJoin: true,
            room: roomName, // Camera primită de la client
            canPublish: true,
            canSubscribe: true,
            agent: true,
        });

        at.metadata = JSON.stringify({
            agent_id: "CA_nzWTMQNbHNmk",
            should_dispatch: true
        });

        return NextResponse.json({ token: await at.toJwt() });
    } catch (error) {
        console.error("Token Error:", error);
        return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
    }
}