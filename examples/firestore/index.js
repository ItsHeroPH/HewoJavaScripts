import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
import { Collection } from "https://cdn.jsdelivr.net/gh/ItsHeroPH/HewoJavaScripts@v1.0.2/firestore-12.2.1.min.ts";

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

const schema = {
    id: { type: String, required: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
    subjects: { type: Array, required: false, default: [] },
    grades: { type: Array, required: false, default: [] }
}

const students = new Collection(db, "students", schema);

const grades = [
    90, 92, 93
]


await students.updateOne({ id: "01234" }, { grades: grades })