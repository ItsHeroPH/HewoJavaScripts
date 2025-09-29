# FIRESTORE Framework

A lightweight Framework for Firestore that inspired by Mongoose.

---

## Installation

You can import directly from CDN:

``
https://cdn.jsdelivr.net/gh/ItsHeroPH/HewoJavaScripts@v2.0.1/firestore-12.2.1/firestore.min.js
``


## Example Usage

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
import { Schema, collection } from "https://cdn.jsdelivr.net/gh/ItsHeroPH/HewoJavaScripts@v2.0.0/firestore-12.2.1/firestore.min.js";

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

const yourSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
})

const users = collection(db, "users", yourSchema);
```

---

```js
let user = await users.findOne({ email: "example@gmail.com" })

// if user doesn't exist, then create a new one
if(!user) user = await users.createOne({ email: "example@gmail.com", name: "John Doe", password: "1234" });
```

---

With the version <b>v2.0.0</b>, there are now multiple ways to update a document:
```js
// Using the v1 method:
await users.findAndUpdateOne({ email: "example@gmail.com" }, { name: "James" });

// The new way of updating the document
user.name = "James";
await user.save();
```