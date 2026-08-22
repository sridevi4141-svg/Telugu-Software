import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyAvlafFAqeydgQCDKKTMRkqTf1eB8sXZJM",

    authDomain: "finance-software-2646b.firebaseapp.com",

    projectId: "finance-software-2646b",

    storageBucket: "finance-software-2646b.firebasestorage.app",

    messagingSenderId: "572169078163",

    appId: "1:572169078163:web:9a9c2696923da48b969466"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Authentication
const auth = getAuth(app);


// Firestore
const db = getFirestore(app);


// Storage
const storage = getStorage(app);


// Export
// Export
export {
    app,
    auth,
    db,
    storage
};
