import { doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"

export default class Document {
    collectionRef;
    uid;
    deleted;

    constructor(collectionRef, id, data) {
        this.collectionRef = collectionRef;
        this.uid = id;
        this.deleted = false;
        Object.assign(this, data);
    }

    async save() {
        const { collectionRef, uid, deleted, ...data } = this;
        if(deleted) return;

        const validated = await collectionRef.schema.validateAndApplyDefaults(uid, data, collectionRef);
        const docRef = await doc(collectionRef.collection, uid);
        await updateDoc(docRef, validated)
    }

    async delete() {
        if(this.deleted) return;

        const docRef = await doc(this.collectionRef.collection, this.uid);
        await deleteDoc(docRef)
        this.deleted = true;
    }
}