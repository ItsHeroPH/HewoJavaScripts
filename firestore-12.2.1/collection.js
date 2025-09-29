import { collection, addDoc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"
import Document from "./document.js";

class Collection {
    constructor(db, name, schema) {
        this.collection = collection(db, name);
        this.schema = schema;
    }

    async createOne(data = {}) {
        const validated = await this.schema.validateAndApplyDefaults(data, this);
        const docRef = await addDoc(this.collection, validated);
        const docData = await getDoc(docRef);
        return new Document(this, docData.id, docData.data());
    }

    async find(queries = {}) {
        const q = query(this.collection, 
            ...Object.entries(queries).map(([key, value]) => where(key, "==", value))
        )

        const snapshot = await getDocs(q)
        if(snapshot.empty) return null;

        return snapshot.docs.map((docData) => new Document(this ,docData.id, docData.data()));
    }

    async findOne(queries = {}) {
        const docs = await this.find(queries);
        if(!docs) return null;
        return docs[0];
    }

    async findAndDelete(queries = {}) {
        const docs = await this.find(queries);
        if(!docs) return;

        for(const docData of docs) {
            await docData.delete()
        }
    }

    async findAndDeleteOne(queries = {}) {
        const docData = await this.findOne(queries);
        if(!docData) return;
        await docData.delete()
    }

    async findAndUpdate(queries = {}, update = {}) {
        const docs = await this.find(queries);
        if(!docs) return;

        for(const docData of docs) {
            for(const [key, value] of Object.entries(update)) {
                docData[key] = value;
            }
            await docData.save()
        }
    }

    async findAndUpdateOne(queries = {}, update = {}) {
        const docData = await this.findOne(queries);
        if(!docData) return;

        for(const [key, value] of Object.entries(update)) {
            docData[key] = value;
        }
        await docData.save()
    }

}

export default (db, name, fields) => {
    if(!db || !name || !fields) throw new Error("Arguments in function `collection` is required!");
    if(db.constructor.name !== "Firestore") throw new TypeError("First argument in function `model` must be an instance of Firestore!");
    if(typeof name !== "string") throw new TypeError("Second argument in function `model` must be string. We got **" + (typeof name).name + "** expected type is a string.");

    if(fields.constructor.name !== "Schema") throw new TypeError("Third argument in function `model` must be an instance of Schema or Object. We got **" + (typeof fields).name + "** expected type is Schema or Object.");

    return new Collection(db, name, fields);
}