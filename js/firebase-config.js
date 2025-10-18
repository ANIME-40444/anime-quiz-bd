// assets/js/firebase-config.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJ5XnhKIM9isFqqlhZ0kAdG8DLUsR1TTY",
  authDomain: "anime-quiz-bd.firebaseapp.com",
  projectId: "anime-quiz-bd",
  storageBucket: "anime-quiz-bd.appspot.com",
  messagingSenderId: "888165764863",
  appId: "1:888165764863:web:33a9d7d14a26bc7c4b46ca",
  measurementId: "G-STX5S01SS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
