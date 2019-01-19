// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const DISABILITY_TYPE = ['Yes', 'No', 'Undisclosed', "Don't know"];
exports.WorkerDisabilityProperty = class WorkerDisabilityProperty extends ChangePropertyPrototype {
    constructor() {
        super('Disability');
    }

    static clone() {
        return new WorkerDisabilityProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        if (document.disability) {
            if (DISABILITY_TYPE.includes(document.disability)) {
                this.property = document.disability;
            } else {
                this.property = null;
            }
        }
    }
    async restoreFromSequelize(document) {
        if (document.disability) {
            this.property = document.disability;
            this.reset();
        }
    }

    get isEqual() {
        // TODO
        return true;
    }

    save() {
        return {
            disability: this.property
        }
    }

    toJSON() {
        return {
            disability: this.property
        }
    }
};