import * as admin from 'firebase-admin';
import {initializeApp, getApps, cert} from "firebase-admin/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const initFirebaseAdmin = () => {
    const apps = getApps();

    if(!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }


    return {
        auth: admin.auth(),
        db: admin.firestore(),
    };
}

export const { auth, db } = initFirebaseAdmin();