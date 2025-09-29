export default class Schema {
    constructor(fields) {
        this.fields = fields;
    }

    async validateAndApplyDefaults(data = {}, collection) {
        const validated = {};

        for (const [field, rules] of Object.entries(this.fields)) {
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

            if(value !== undefined && rules.unique) {
                const doc = await collection.findOne({ [field]: value });
                if(doc) throw new Error(`Field "${field}" must be unique. "${value}" is already exists.`)
            }

            if (value !== undefined) validated[field] = value;
        }

        return validated;
    }
}