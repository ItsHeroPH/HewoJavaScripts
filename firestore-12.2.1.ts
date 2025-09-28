import {
    FireStore,
    CollectionReference,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    QuerySnapshot,
    collection, 
    addDoc, 
    doc,
    getDocs, 
    getDoc, 
    query, 
    where, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export type FieldRule<T = any> = {
    type: { new (...args: any[]): T},
    required?: boolean,
    default?: T | (() => T);
}

export type Schema = Record<string, FieldRule>;

/**
 * The Collection class is a wrapper around Firestore’s API that provides
 * a MongoDB-like interface for working with collections and documents. 
 * It simplifies common database operations such as creating, finding, 
 * updating, and deleting documents, while also enforcing schema validation 
 * and default values.
 */
export class Collection<T extends DocumentData = DocumentData> {
    private db: FireStore;
    public collection: CollectionReference;
    private defaults: Schema;

    constructor(db: FireStore, name: string, defaults: Schema) {
        this.db = db;
        this.collection = collection(db, name)
        this.defaults = defaults;
    }

    private _validateAndApplyDefaults(data: Partial<T>): T {
        const validated: any = {};

        for (const [field, rules] of Object.entries(this.defaults)) {
            let value = data[field];

            if (value === undefined && rules.default !== undefined) {
                value = typeof rules.default === "function" ? rules.default() : rules.default;
            }

            if (rules.required && (value === undefined || value === null)) {
                throw new Error(`Field "${field}" is required`);
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
    public async addOne(data: Partial<T> = {}): Promise<DocumentReference<T>> {
        const validated = this._validateAndApplyDefaults(data);
        const docData = await addDoc(this.collection, validated);
        return docData;
    }

    /**
     * Find documents that matched in the specified queries and deletes all.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async deleteAll(queries: Partial<T> = {}): Promise<void> {
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
    async deleteOne(queries: Partial<T> = {}): Promise<void> {
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
    async find(queries: Partial<T> = {}): Promise<QueryDocumentSnapshot<T>[] | null> {
        const q = query(this.collection, 
            ...Object.entries(queries).map(([key, value]) => where(key, "==", value))
        )

        const snapshot: QuerySnapshot<T> = await getDocs(q)
        if(snapshot.empty) return null;

        return snapshot.docs;
    }

    /**
     * Find document that matched in the specified queries. It returns a single
     * document that matches the specified queries. If there is a multiple document
     * that matched to the specified queries, it will return the first document.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async findOne(queries: Partial<T> = {}): Promise<QueryDocumentSnapshot<T>> {
        const docs = await this.find(queries);
        if(docs === null) return null;
        return docs[0]
    }

    /**
     * Returns all the existing document from the collection.
     */
    async get(): Promise<QueryDocumentSnapshot<T>[] | null> {
        const docs: QuerySnapshot<T> = await getDocs(this.collection);
        if(docs.empty) return null;
        return docs.docs
    }

    /**
     * Find document that matched in the specified queries and update the specified field.
     * If a multiple document matches the specified queries, it will update the first doccument.
     * @param {*} queries Parameters that will be used to find the document.
     */
    async updateOne(queries: Partial<T> = {}, update: Partial<T> = {}): Promise<DocumentSnapshot<T> | null> {
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