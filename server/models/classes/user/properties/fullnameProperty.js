// the fullname property is a value only

exports.UserFullnameProperty = class UserFullnameProperty extends ChangePropertyPrototype {
    constructor() {
        super('Fullname');
    }

    static clone() {
        return new UserFullnameProperty();
    }

    // concrete implementations
    async restoreFromJson(document) {
        // fullname must be non-empty and must be no more than 120 character

        if (document.fullname) {
            const FULLNAME_MAX_LENGTH=120;
            if (document.fullname.length > 0 &&
                document.fullname.length <= FULLNAME_MAX_LENGTH) {
                this.property = document.fullname;
            } else {
               this.property = null;
            }
        }
    }

    restorePropertyFromSequelize(document) {
        return document.FullNameValue;
    }
    savePropertyToSequelize() {
        return {
            FullNameValue: this.property
        };
    }

    isEqual(currentValue, newValue) {
        // fullname is a simple string
        return currentValue && newValue && currentValue === newValue;
    }

    toJSON(withHistory=false, showPropertyHistoryOnly=true) {
        if (!withHistory) {
            // simple form
            return {
                fullname: this.property
            };
        }
        
        return {
            fullname: {
                currentValue: this.property,
                ... this.changePropsToJSON(showPropertyHistoryOnly)
            }
        };
    }
};