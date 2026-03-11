import {generateText} from "ai";
import {google} from "@ai-sdk/google";
import {getRandomInterviewCover} from "@/lib/utils";
import {db} from "@/firebase/admin";
import {NextResponse} from "next/server";
import {createOpenAI} from "@ai-sdk/openai";

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
    return Response.json({ success: true, data: "THANK YOU!"}, { status: 200});
}

export async function POST(request: Request) {
    console.log("🔵 Cerere primita la /api/livekit/webhook");

    try {
        const body = await request.json();
        console.log("Body primit:", body);

        const { type, role, level, techstack, amount, userid } = body;

        console.log("Pornim AI-ul...");
        const { text: questions } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            maxRetries: 0,
            prompt: `Prepare questions for a job interview.
                    The job role is ${role}.
                    The job experience level is ${level}.
                    The tech stack used in the job is: ${techstack}.
                    The focus between behavioural and technical questions should lean towards: ${type}.
                    The amount of questions required is: ${amount}.
                    Please return only the questions, without any additional text.
                    The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                    Return the questions formatted like this:
                    ["Question 1", "Question 2", "Question 3"]
                    
                    Thank you! <3`,
        });
        console.log("AI a raspuns!");

        const clearedQuestions = questions.replace(/```json|```/g,"").trim();
        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(clearedQuestions);
        } catch (e) {
            console.error("AI a returnat JSON invalid:", questions);
            // Fallback: transformă textul brut în array dacă parsing-ul eșuează
            parsedQuestions = [questions];
        }
        const interview = {
            role, type, level,
            techstack: techstack ? techstack.split(',') : [],
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        }

        await db.collection("interviews").add(interview);

        return Response.json({success: true}, {status: 200});
    } catch(err) {
        console.error("Error in POST", err);
        return Response.json({ success: false, error: err }, { status: 500});
    }
}