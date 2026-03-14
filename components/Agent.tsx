"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Room,
    RoomEvent,
    Participant,
    TranscriptionSegment
} from "livekit-client";
import { RoomAudioRenderer } from "@livekit/components-react";

import { cn } from "@/lib/utils";
//import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
               }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");

    // Referință stabilă pentru instanța de LiveKit Room
    const roomInstanceRef = useRef<Room | null>(null);

    // Inițializare Room și Evenimente
    useEffect(() => {
        const room = new Room();
        roomInstanceRef.current = room;

        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onTranscription = (segments: TranscriptionSegment[], participant?: Participant) => {
            segments.forEach((segment) => {
                if (segment.final) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: participant?.isAgent ? "assistant" : "user",
                            content: segment.text
                        }
                    ]);
                }
            });
        };

        const setupParticipantSpeech = (participant: Participant) => {
            participant.on("isSpeakingChanged", (speaking: boolean) => {
                // Dacă agentul vorbește, activăm animația la avatarul AI
                if (!participant.isLocal) {
                    setIsSpeaking(speaking);
                }
            });
        };

        room.on(RoomEvent.Connected, onCallStart);
        room.on(RoomEvent.Disconnected, onCallEnd);
        room.on(RoomEvent.TranscriptionReceived, onTranscription);
        room.on(RoomEvent.ParticipantConnected, setupParticipantSpeech);

        return () => {
            room.disconnect();
            room.removeAllListeners();
            roomInstanceRef.current = null;
        };
    }, []);

    // Logică Feedback și Afișare mesaje
    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async (messages: SavedMessage[]) => {
            const { success, feedbackId: id } = await createFeedback({
                interviewId: interviewId!,
                userId: userId!,
                transcript: messages,
                feedbackId,
            });

            if (success && id) {
                router.push(`/interview/${interviewId}/feedback`);
            } else {
                router.push("/");
            }
        };

        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                router.push("/");
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

    const handleCall = async () => {
        if (!roomInstanceRef.current) return;

        setCallStatus(CallStatus.CONNECTING);

        try {
            // Pasul 1: Obținere Token de la serverul tău
            const response = await fetch("/api/livekit/token", {
                method: "POST",
                body: JSON.stringify({
                    roomName: `interview-${userId}`,
                    participantName: userName
                }),
            });

            const data = await response.json();
            const livekitUrl = "wss://interviewaichatbot-p28xa6ge.livekit.cloud";

            // Pasul 2: Conectare la Room
            await roomInstanceRef.current.connect(livekitUrl, data.token);

            // Pasul 3: Pornire microfon local
            await roomInstanceRef.current.localParticipant.setMicrophoneEnabled(true);

        } catch (error) {
            console.error("Connection failed:", error);
            setCallStatus(CallStatus.FINISHED);
        }
    };

    const handleDisconnect = () => {
        if (roomInstanceRef.current) {
            roomInstanceRef.current.disconnect();
        }
        setCallStatus(CallStatus.FINISHED);
    };

    return (
        <>
            {/* Esențial pentru a auzi sunetul agentului */}
            {roomInstanceRef.current && (
                <RoomAudioRenderer room={roomInstanceRef.current} />
            )}

            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="User"
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75",
                                callStatus !== CallStatus.CONNECTING && "hidden"
                            )}
                        />
                        <span className="relative">
                          {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                              ? "Call"
                              : ". . ."}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;