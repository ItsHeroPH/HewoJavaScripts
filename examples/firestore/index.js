import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
import { Schema, collection } from "https://cdn.jsdelivr.net/gh/ItsHeroPH/HewoJavaScripts@v2.0.3/firestore-12.2.1/firestore.min.js";

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

const schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
})

const students = collection(db, "students", schema);

const student = students.createOne({ id: "123", name: "Hewo", section: "101" })
student.section = "202"
student.save()