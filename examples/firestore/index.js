import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
import { initializeDatabase, Collection } from "https://cdn.jsdelivr.net/gh/ItsHeroPH/HewoJSscripts@v1.0.1/firestore-12.2.1.min.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const students = new Collection(db, "students", {
    id: { type: String, required: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
    grades: { type: Array, required: false, default: []}
});

const grades = [
    90, 92, 93
]


await students.updateOne({ id: "01234" }, { grades: grades })