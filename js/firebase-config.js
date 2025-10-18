// Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ5XnhKIM9isFqqlhZ0kAdG8DLUsR1TTY",
  authDomain: "anime-quiz-bd.firebaseapp.com",
  projectId: "anime-quiz-bd",
  storageBucket: "anime-quiz-bd.firebasestorage.app",
  messagingSenderId: "888165764863",
  appId: "1:888165764863:web:33a9d7d14a26bc7c4b46ca",
  measurementId: "G-STX5S01SS0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
