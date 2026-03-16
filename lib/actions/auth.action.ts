'use server';

import { auth, db } from "@/firebase/admin";
import {cookies} from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    try {
        // Generăm session cookie-ul folosind Firebase Admin
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: ONE_WEEK * 1000,
        });

        // Setăm cookie-ul
        cookieStore.set("session", sessionCookie, {
            maxAge: ONE_WEEK,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
        });

        return { success: true };
    } catch (error) {
        console.error("Session Cookie Error:", error);
        return { success: false };
    }
}

export async function signUp(params: SignUpParams) {
    const {uid, name, email, } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if(userRecord.exists){
            return {
                success: false,
                message: `User already exists. Sign in instead`,
            }
        }
        console.log("Încerc scriere în documentul:", uid);
        await db.collection('users').doc(uid).set({
            name, email
        })

        return {
            success: true,
            message: 'Account successfully registered'
        }
    } catch(err: any){
        console.error("Error creating a user", err);
        if(err.code === 'auth/email-already-exists'){
            return{
                success: false,
                message: 'This email is already in use.',
            }
        }

        return {
            success: false,
            message: 'Failed creating user',
        }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken} = params;

    try{
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return {
                success: false,
                message: `User does not exists. Create an account instead`,
            }
        }

        await setSessionCookie(idToken);
    }catch(err) {
        console.log(err);

        return {
            success: false,
            message: `Failed to log into an account`,
        }
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) return null;

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.
            collection('users')
            .doc(decodedClaims.uid)
            .get();

        if(!userRecord.exists) return null;

        return {
            ... userRecord.data(),
            id: userRecord.id
        } as User;
    } catch(err) {
        console.log(err);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;
}

export async function getInterviewsByUserId( userId: string
): Promise<Interview[] | null> {
    const interviews = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 10 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ... doc.data()
    })) as Interview[];
}

