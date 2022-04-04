import {getMaskPatternMapping, matchMaskPattern} from "./pattern";
import {compareDateTimes, interpretTime, parseISODateFromPattern} from "./time";

export const createInputName = (formName, inputName) => `tx_form_formframework[${formName}][${inputName}]`;

/**
 *
 * @param properties
 * @returns {boolean}
 */
export function isRequired(properties) {
    return properties?.fluidAdditionalAttributes?.required === 'required';
}

/**
 *
 * @param {ElementProperties} properties
 * @returns {string} placeholder label
 */
export function getPlaceholder(properties) {
    return properties?.fluidAdditionalAttributes?.placeholder;
}

/**
 *
 * @param {ElementValidators} validators
 * @returns {string} error message for required validator
 */
export const createRequiredLabel = (validators) => {
    if (!validators || !validators.length) return "required";
    const notEmptyValidator = validators.find(
        (v) => v.identifier === "NotEmpty"
    );
    return (
        (notEmptyValidator && notEmptyValidator.errorMessage) || "required"
    );
}

/**
 *
 * @param {boolean} required
 * @param {ElementValidators} validators
 * @param {ElementProperties} context
 * @param {boolean} overwriteRequiredRules - if true deletes the required and NotEmpty validator (you might want this for inputs that use createRequiredLabel for their required validation).
 * @param {object} componentsMap Custom validators.
 * @returns {*[]}
 */
export const createInputRules = (required, validators, context, overwriteRequiredRules, componentsMap) => {
    const rules = createValidatorsMap(validators, context, componentsMap);
    if(required && overwriteRequiredRules){
        if(rules.required) delete rules.required;
        if(rules.NotEmpty) delete rules.NotEmpty;
    }
    if (!!required) rules.required = (v) => !!v
    const rulesArray = [];
    for (const key in rules) rulesArray.push(rules[key])
    return rulesArray;
}

export const createValidatorsMap = (validators, context, componentsMap) => {
    if (!validators || !validators.length) return {}
    const validatorsMap = {};

    for (let validator of validators) {
        const id = validator.identifier;
        const validatorArguments = validator.options;
        const errorMessage = validator.errorMessage;
        const validatorFunction = createValidatorByKey(id, validatorArguments, errorMessage, context, componentsMap)
        if (validatorFunction) validatorsMap[id] = validatorFunction;
    }
    return validatorsMap;

}
// create a function and wrap it inside the payload
export const createValidatorByKey = (validatorKey, vArgs, errorMessage, context, componentsMap = {}) => {
    // inject payload and error message into the selected validation function
    const inputIntegerValidator = (inputValue) => !inputValue.length || validatorInteger(inputValue, errorMessage || `positive integer required`)
    const knownFunctions = {
        required: (inputValue) => validatorRequired(inputValue, errorMessage || `this field is required`),
        NotEmpty: (inputValue) => validatorRequired(inputValue, errorMessage || `this field is required`),
        StringLength: (inputValue) => !inputValue.length || validatorLength(inputValue, errorMessage || `input length must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs),
        Alphanumeric: (inputValue) => !inputValue.length || validatorAlphanumeric(inputValue, errorMessage || `this field must be alphanumeric (different alphabets need to be implemented)`),
        EmailAddress: (inputValue) => !inputValue.length || validatorEmail(inputValue, errorMessage || `invalid email`),
        Integer: inputIntegerValidator,
        Number: inputIntegerValidator,
        Float: (inputValue) => !inputValue.length || validatorFloat(inputValue, errorMessage || `positive float required`),
        Text: (inputValue) => validatorRequired(inputValue, errorMessage || `this field is required`),
        NumberRange: (inputValue) => !inputValue.length || validatorNumberRange(inputValue, errorMessage || `number must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs),
        RegularExpression: (inputValue) => !inputValue.length || validatorRegex(inputValue, errorMessage || `input must match following regular expression ${vArgs.regularExpression}`, vArgs),
        MinimumNumber: (inputValue) => !inputValue.length || validatorMinimumNumber(inputValue, errorMessage || `number must be greater than ${vArgs.minimum}`, vArgs),
        TimeFormat: (inputValue) => !inputValue.length || validatorTimeFormat(inputValue, errorMessage || `the datetime must be in this format: '${vArgs.format}'`, vArgs),
        MaskComplete: (inputValue) => !inputValue.length || validatorMaskComplete(inputValue, errorMessage || `please complete the input`, vArgs, context),
        FileSize: (inputValue) => validatorFileSize(inputValue, errorMessage, vArgs),
        DateInterval: (inputValue) => !inputValue.length || validatorDateInterval(inputValue, errorMessage, vArgs, context),
        ...componentsMap,  // TODO use this map alone in 2.0
        default: null
    }
    return knownFunctions[validatorKey] || knownFunctions.default;
}

export const validatorRequired = (string, invalidMessage) => !!string || invalidMessage;
export const validatorLength = (string, invalidMessage, vArgs) => {
    if (!string.length) return invalidMessage;
    const trimmedString = string.trim();
    return (trimmedString.length >= vArgs.minimum && trimmedString.length <= vArgs.maximum) || invalidMessage;
};
export const validatorAlphanumeric = (string, invalidMessage) => /^[a-z0-9]+$/i.test(string) || invalidMessage
export const validatorEmail = (string, invalidMessage) => {
    // Modified Regex which ensures at least 2 TLD chars
    // const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}|\[(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return emailRegex.test(string) || invalidMessage
}
export const validatorInteger = (string, invalidMessage) => {
    return /^\d+$/.test(string) || invalidMessage
};
export const validatorFloat = (string, invalidMessage) => /^([1-9]\d*(\.|\,)\d*|0?(\.|\,)\d*[1-9]\d*|[1-9]\d*)$/.test(string) || invalidMessage;
export const validatorNumberRange = (string, invalidMessage, vArgs) => {
    if (isNaN(string)) return invalidMessage;
    const num = parseFloat(string);
    return (num >= vArgs.minimum && num < vArgs.maximum) || invalidMessage;
}
export const validatorRegex = (string, invalidMessage, vArgs) => {
    /* when no regex or a invalid regex was provided return true = valid so this does not break the form */
    if (!vArgs.regularExpression) return true;
    try {
        const regex = new RegExp(vArgs.regularExpression);
        return regex.test(string) || invalidMessage
    } catch (error) {
        return true;
    }
}
export const validatorMinimumNumber = (string, invalidMessage, vArgs) => {
    if (isNaN(string)) return invalidMessage;
    const num = parseFloat(string);
    return (num >= vArgs.minimum) || invalidMessage;
}

export const validatorTimeFormat = (string, invalidMessage, vArgs) => {
    const mapping = getMaskPatternMapping();

    const res = matchMaskPattern(string, vArgs.format, mapping);
    if (!res) return invalidMessage;

    const [match, order] = res;

    // validate each pattern group
    for (let i = 1; i < match.length; i++) {
        const num = Number(match[i]);
        const [min, max] = mapping[order[i - 1]];
        if (num < min || (max !== undefined && num > max)) return invalidMessage;
    }
    return true;
}

export const validatorMaskComplete = (string, invalidMessage, _vArgs, context) => {
    const maskPattern = context.pattern;
    if (!maskPattern) return true; // invalid validator for element

    const placeholder = '_'; // TODO substitute with context.placeholder, when implemented
    const pattern = `\\${placeholder}`;

    const patternPlaceholderOcurrences = (maskPattern.match(new RegExp(pattern, 'g')) || []).length;
    const inputPlaceholderOcurrences = (string.match(new RegExp(pattern, 'g')) || []).length;

    return inputPlaceholderOcurrences - patternPlaceholderOcurrences <= 0 ? true : invalidMessage; // completed, when there are no placeholders left
}

export const validatorDateInterval = (string, invalidMessage, vArgs, context) => {
    let { minDate, maxDate } = vArgs;
    if ((!minDate || !minDate.length) && (!maxDate || !maxDate.length)) return true; // no validation required

    const parsed = parseISODateFromPattern(string, context.pattern)
    if (!parsed) return invalidMessage; // invalid date

    // take 'today' into account
    minDate = interpretTime(minDate);
    maxDate = interpretTime(minDate);

    return (minDate && compareDateTimes(parsed, minDate) < 0) || (maxDate && compareDateTimes(parsed, maxDate) > 0) ? invalidMessage : true;
}

export const validatorFileSize = (fileInput, invalidMessage, vArgs) => {
    let valid = true;
    if (!fileInput) return valid // if fileList is empty this is valid
    const minSize = typo3FileSizeToBytes(vArgs.minimum);
    const maxSize = typo3FileSizeToBytes(vArgs.maximum);
    let totalSize = 0;
    if (fileInput instanceof FileList) {
        let fileCount = fileInput.length;
        let index = 0;
        for (; index < fileCount; index++) {
            const file = fileInput[index];
            if (file instanceof File) {
                const size = file.size;
                if (isNaN(size)) continue;
                totalSize += size;
            } else continue;
        }
    } else if (fileInput instanceof File) {
        const size = fileInput.size;
        if (isNaN(size)) valid = false;
        else {
            totalSize += size;
        }
    }
    if (totalSize > maxSize || totalSize < minSize) valid = false;

    return valid || invalidMessage || `combined size of all files needs to be between ${vArgs.minimum} (${minSize} bytes) and ${vArgs.maximum} (${maxSize} bytes) but was ${totalSize} bytes.`

}

export const typo3FileSizeToBytes = (sizeString) => {
    if (sizeString.length < 2) return sizeString;
    let str = sizeString.trim();
    const num = str.slice(0, - 1);
    const modifier = str[str.length - 1]
    switch (modifier) {
        case "B":
            return num;
        case "K":
            return num * 1024;
        case "M":
            return num * 1024 * 1024;
        case "G":
            return num * 1024 * 1024 * 1024;
    }
    return num;
}

export const createCallbackList = (callbacks) => {
    return callbacks.map(callback => (
        createCallbackByKey(callback.action, callback.arguments)
    ))
}

export const createCallbackByKey = (callbackKey, callbackArgs) => {
    // inject payload and error message into the selected validation function
    const knownCallbacks = {
        default: Promise.resolve(callbackArgs)
    }
    return knownCallbacks[callbackKey] || knownCallbacks.default;
}

