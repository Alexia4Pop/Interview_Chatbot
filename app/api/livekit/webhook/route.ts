import { NextResponse } from "next/server";
import { db } from "@/firebase/admin"; // Folosim admin pentru server-side
import { WebhookReceiver } from "livekit-server-sdk";

const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
);

export async function POST(request: Request) {
    console.log("🟢 Webhook de la LiveKit primit!");

    try {
        const body = await request.text(); // LiveKit are nevoie de text brut pentru validare
        const header = request.headers.get("Authorization");

        if (!header) return NextResponse.json({ error: "No auth" }, { status: 401 });

        // Verificăm dacă cererea e reală de la LiveKit
        const event = await receiver.receive(body, header);
        console.log("Eveniment detectat:", event.event);

        // Când camera se închide sau primim rezumatul
        if (event.event === "room_finished" || event.event === "participant_left") {
            const roomName = event.room?.name;

            // Aceasta este variabila care vine din setările tale de "Call Summary"
            const summaryData = (event as any).room?.summary || "Rezumat indisponibil";

            // Căutăm interviul în Firebase după Room Name și îl actualizăm
            // (Presupunem că Room Name-ul tău este ID-ul interviului)
            const interviewRef = db.collection("interviews").doc(roomName!);

            await interviewRef.update({
                finalized: true,
                aiSummary: summaryData,
                finishedAt: new Date().toISOString()
            });

            console.log("✅ Rezumat salvat cu succes în Firebase!");
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("❌ Eroare Webhook LiveKit:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}