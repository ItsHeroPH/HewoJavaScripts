import { 
    collection, 
    addDoc, 
    doc,
    getDocs, 
    getDoc, 
    query, 
    where, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js"

/**
 * The Collection class is a wrapper around Firestore’s API that provides
 * a MongoDB-like interface for working with collections and documents. 
 * It simplifies common database operations such as creating, finding, 
 * updating, and deleting documents, while also enforcing schema validation 
 * and default values.
 */
class Collection {
    constructor(db, name, defaults) {
        this.db = db;
        this.collection = collection(db, name)
        this.defaults = defaults;
    }

    _validateAndApplyDefaults(data) {
        const validated = {};

        for (const [field, rules] of Object.entries(this.defaults)) {
            let value = data[field];

            if (rules.required && (value === undefined || value === null)) {
                throw new Error(`Field "${field}" is required`);
            }

            if (value === undefined && rules.default !== undefined) {
                value = typeof rules.default === "function" ? rules.default() : rules.default;
            }

            if (value !== undefined && rules.type) {
                const expectedType = rules.type.name.toLowerCase();
                if (typeof value !== expectedType) {
                    throw new Error(
                        `Field "${field}" should be of type ${expectedType}, got ${typeof value}`
                    );
                }
            }

            if (value !== undefined) validated[field] = value;
        }

        return validated;
    }

    /**
     * Creates a document to the collection and returns the created document.
     * @param {*} data The data that the created document will have.
     */
    async addOne(data = {}) {
        const validated = this._validateAndApplyDefaults(data);
        const docData = await addDoc(this.collection, validated);
        return docData;
    }

    /**
     * Find documents that matched in the specified queries and deletes all.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async deleteAll(queries = {}) {
        const docDatas = await this.find(queries);
        if(docDatas != null) {
            for(const docData of docDatas) {
                const docRef = doc(this.collection, docData.id)
                await deleteDoc(docRef)
            }
        }
    }

    /**
     * Find document that matched in the specified queries and deletes it. If
     * there is more that one document that matches the specified queries, it
     * will delete the first document it will find.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async deleteOne(queries = {}) {
        const docData = await this.findOne(queries);
        if(docData != null) {
            const docRef = doc(this.collection, docData.id)
            await deleteDoc(docRef)
        }
    }

    /**
     * Find document that matched in the specified queries. It returns an
     * array of documents that matches to the specified queries.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async find(queries = {}) {
        const q = query(this.collection, 
            ...Object.entries(queries).map(([key, value]) => where(key, "==", value))
        )

        const snapshot = await getDocs(q)
        if(snapshot.empty) return null;

        return snapshot.docs;
    }

    /**
     * Find document that matched in the specified queries. It returns a single
     * document that matches the specified queries. If there is a multiple document
     * that matched to the specified queries, it will return the first document.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async findOne(queries = {}) {
        const docs = await this.find(queries);
        if(docs === null) return null;
        return docs[0]
    }

    /**
     * Returns all the existing document from the collection.
     */
    async get() {
        return await getDocs(this.collection)
    }

    /**
     * Find document that matched in the specified queries and update the specified field.
     * If a multiple document matches the specified queries, it will update the first doccument.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async updateOne(queries = {}, update) {
        const docData = await this.findOne(queries);
        if(!docData) return null;
        const updatedData = {...docData.data(), ...update}
        const validated = this._validateAndApplyDefaults(updatedData);
        
        const docRef = await doc(this.collection, docData.id)
        await updateDoc(docRef, validated);
        const updatedDoc = await getDoc(docRef)
        return updatedDoc;
    }

}

export { Collection }