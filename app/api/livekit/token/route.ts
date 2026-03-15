import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

// route.ts
export async function POST(req: Request) {
    const { roomName, participantName } = await req.json();

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: `user_${Math.floor(Math.random() * 1000)}`, // Identitate simplă
    });

    at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true });

    const dispatchClient = new AgentDispatchClient(
        process.env.LIVEKIT_URL!.replace('wss://', 'https://'),
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
    );

    try {
        // IMPORTANT: Folosim fix roomName-ul primit
        await dispatchClient.createDispatch(roomName, 'CA_nzWTMQNbHNmk');
        console.log(`🚀 Dispatch trimis în camera: ${roomName}`);
    } catch (e) {
        console.error("❌ Eroare API LiveKit:", e);
    }

    const token = await at.toJwt();
    return NextResponse.json({ token });
}