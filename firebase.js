import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzxcAE2EoLEdhG1VTrxGUc981RH-5TmWE",
  authDomain: "daily-voting-793ee.firebaseapp.com",
  projectId: "daily-voting-793ee",
  storageBucket: "daily-voting-793ee.firebasestorage.app",
  messagingSenderId: "1065830068376",
  appId: "1:1065830068376:web:9d3858939d07056a5fa0ed",
  measurementId: "G-7YP984SK8B"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
