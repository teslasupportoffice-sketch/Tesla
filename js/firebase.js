// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS9c8csNs1XiX9Rq4dxAYbUSiZhglUftI",
  authDomain: "tesla-e94e8.firebaseapp.com",
  databaseURL: "https://tesla-e94e8-default-rtdb.firebaseio.com",
  projectId: "tesla-e94e8",
  storageBucket: "tesla-e94e8.firebasestorage.app",
  messagingSenderId: "11032037901",
  appId: "1:11032037901:web:3013aabc7d710aea016344",
  measurementId: "G-Q2BCQV4YEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database and authentication instances for the rest of your app
export const db = getFirestore(app);
export const auth = getAuth(app);
