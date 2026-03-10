// Import the functions you need from the SDKs you need

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBcOZ3Dc7dm4Z1_r7rykRlfOKqbCxKvVZE",
    authDomain: "chatbot-tool-e4fcc.firebaseapp.com",
    projectId: "chatbot-tool-e4fcc",
    storageBucket: "chatbot-tool-e4fcc.firebasestorage.app",
    messagingSenderId: "391843624395",
    appId: "1:391843624395:web:aeabe855c3bd22db15724e",
    measurementId: "G-8MRG0823NN"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);