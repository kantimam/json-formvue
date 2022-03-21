import {getMaskPatternMapping, matchMaskPattern} from "./pattern";
import {compareDateTimes, currentIsoTime, parseISODateFromPattern} from "./time";
import {CallbackDefinition, ElementProperties, InputValidator} from "@/lib/FormDefinition";
import {CallbackMap, FormCallback} from "@/lib/callbacks";

export function createInputName(formName: string, inputName: string) {
    return `tx_form_formframework[${formName}][${inputName}]`;
}

/**
 *
 * @param properties
 * @returns {boolean}
 */
export function isRequired(properties: ElementProperties) {
    return properties.fluidAdditionalAttributes?.required === 'required';
}

/**
 *
 * @param {ElementProperties} properties
 * @returns {string} placeholder label
 */
export function getPlaceholder(properties: ElementProperties) {
    return properties.fluidAdditionalAttributes?.placeholder;
}

/**
 * @returns {string} error message for required validator
 */
export function createRequiredLabel(validators?: InputValidator[]) {
    if (!validators || !validators.length) return "required";
    const notEmptyValidator = validators.find(v => v.identifier === "NotEmpty");
    return (notEmptyValidator && notEmptyValidator.errorMessage) || "required";
}

/**
 *
 * @param {boolean} required
 * @param {InputValidator[]} validators
 * @param {ElementProperties} context
 * @param {boolean} overwriteRequiredRules - if true deletes the required and NotEmpty validator (you might want this for inputs that use createRequiredLabel for their required validation).
 * @param {object} componentsMap Custom validators.
 * @returns {*[]}
 */
export function createInputRules(required: boolean, validators: InputValidator[], context: ElementProperties, overwriteRequiredRules: boolean, componentsMap: ValidatorMap) {
    const rules = createValidatorsMap(validators, context, componentsMap);

    if (required && overwriteRequiredRules){
        if(rules.required) delete rules.required;
        if(rules.NotEmpty) delete rules.NotEmpty;
    }

    if (required) rules.required = (v) => !!v;

    const rulesArray = [];
    for (const key in rules) rulesArray.push(rules[key])

    return rulesArray;
}

export function createValidatorsMap(validators: InputValidator[], context: ElementProperties, componentsMap: ValidatorMap) {
    if (!validators || !validators.length) return {};
    const validatorsMap: ValidatorMap = {};

    for (let validator of validators) {
        const id = validator.identifier;
        const validatorArguments = validator.options;
        const errorMessage = validator.errorMessage;

        const validatorFunction = createValidatorByKey(id, validatorArguments || {}, errorMessage, context, componentsMap)
        if (validatorFunction)
            validatorsMap[id] = validatorFunction;
    }
    return validatorsMap;

}

export type InputValue = string | File | FileList;
export type TypedValidatorFunction<T> = (inputValue: T, errorMessage: string, vArgs?: Record<string, any>, ...other: any[]) => boolean | string;
export type ValidatorFunction = TypedValidatorFunction<InputValue>;
export type ValidatorMap = Record<string, ValidatorFunction | null>;
export type StringValidator = TypedValidatorFunction<string>;

function stringValidator(validator: StringValidator): ValidatorFunction {
    return typedValidator(validator, (inputValue => typeof inputValue === 'string') as TypePredicate<string>);
}

type TypePredicate<T extends InputValue> = (inputValue: InputValue) => inputValue is T;

function typedValidator<T extends InputValue>(validator: TypedValidatorFunction<T>, predicate: TypePredicate<T>): ValidatorFunction {
    return (inputValue: InputValue, errorMessage: string) => {
        if (!predicate(inputValue)) return true;  // can't validate, because of type mismatch
        return validator(inputValue, errorMessage);
    }
}

// create a function and wrap it inside the payload
export function createValidatorByKey(validatorKey: string, vArgs: Record<string, any>, errorMessage: string, context: ElementProperties, componentsMap: ValidatorMap = {}) {
    // inject payload and error message into the selected validation function
    const inputIntegerValidator: ValidatorFunction = stringValidator(
        (inputValue) => !inputValue.length || validatorInteger(inputValue, errorMessage || `positive integer required`)
    );

    const knownFunctions: ValidatorMap = {
        required: stringValidator(
            inputValue => validatorRequired(inputValue, errorMessage || `this field is required`)
        ),
        NotEmpty: stringValidator(
            inputValue => validatorRequired(inputValue, errorMessage || `this field is required`)
        ),
        StringLength: stringValidator(
            inputValue => !inputValue.length || validatorLength(inputValue, errorMessage || `input length must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs)
        ),
        Alphanumeric: stringValidator(
            inputValue => !inputValue.length || validatorAlphanumeric(inputValue, errorMessage || `this field must be alphanumeric (different alphabets need to be implemented)`)
        ),
        EmailAddress: stringValidator(
            (inputValue) => !inputValue.length || validatorEmail(inputValue, errorMessage || `invalid email`)
        ),
        Integer: inputIntegerValidator,
        Number: inputIntegerValidator,
        Float: stringValidator(
            (inputValue) => !inputValue.length || validatorFloat(inputValue, errorMessage || `positive float required`)
        ),
        Text: stringValidator(
            (inputValue) => validatorRequired(inputValue, errorMessage || `this field is required`)
        ),
        NumberRange: stringValidator(
            (inputValue) => !inputValue.length || validatorNumberRange(inputValue, errorMessage || `number must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs)
        ),
        RegularExpression: stringValidator(
            (inputValue) => !inputValue.length || validatorRegex(inputValue, errorMessage || `input must match following regular expression ${vArgs.regularExpression}`, vArgs)
        ),
        MinimumNumber: stringValidator(
            (inputValue) => !inputValue.length || validatorMinimumNumber(inputValue, errorMessage || `number must be greater than ${vArgs.minimum}`, vArgs)
        ),
        TimeFormat: stringValidator(
            (inputValue) => !inputValue.length || validatorTimeFormat(inputValue, errorMessage || `the datetime must be in this format: '${vArgs.format}'`, vArgs)
        ),
        MaskComplete: stringValidator(
            (inputValue) => !inputValue.length || validatorMaskComplete(inputValue, errorMessage || `please complete the input`, vArgs, context)
        ),
        FileSize: (inputValue) => validatorFileSize(inputValue, errorMessage, vArgs),
        DateInterval: stringValidator(
            (inputValue) => !inputValue.length || validatorDateInterval(inputValue, errorMessage, vArgs, context)
        ),
        ...componentsMap,  // TODO use this map alone in 2.0
        default: null
    };

    return knownFunctions[validatorKey] || knownFunctions.default;
}

export const validatorRequired: StringValidator = (string, invalidMessage) => !!string || invalidMessage;

export const validatorLength: StringValidator = (inputValue, invalidMessage, vArgs) => {
    if (!inputValue.length) return invalidMessage;

    if (!vArgs) return true;

    const trimmedString = inputValue.trim();
    return (trimmedString.length >= vArgs.minimum && trimmedString.length <= vArgs.maximum) || invalidMessage;
}

export const validatorAlphanumeric: StringValidator = (inputValue, invalidMessage) => {
    return /^[a-z0-9]+$/i.test(inputValue) || invalidMessage;
}

export const validatorEmail: StringValidator = (inputValue, invalidMessage) => {
    // Modified Regex which ensures at least 2 TLD chars
    // const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}|\[(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/
    return emailRegex.test(inputValue) || invalidMessage
}

export const validatorInteger: StringValidator = (inputValue, invalidMessage) => {
    return /^\d+$/.test(inputValue) || invalidMessage;
}

export const validatorFloat: StringValidator = (inputValue, invalidMessage) => {
    return /^([1-9]\d*([.,])\d*|0?([.,])\d*[1-9]\d*|[1-9]\d*)$/.test(inputValue) || invalidMessage;
}

export const validatorNumberRange: StringValidator = (inputValue, invalidMessage, vArgs) => {
    if (!vArgs) return true;  // can't validate

    const num = parseFloat(inputValue);
    if (isNaN(num)) return invalidMessage;

    return (num >= vArgs.minimum && num < vArgs.maximum) || invalidMessage;
}
export const validatorRegex: StringValidator = (inputValue, invalidMessage, vArgs) => {
    /* when no regex or a invalid regex was provided return true = valid so this does not break the form */
    if (!vArgs || !vArgs.regularExpression) return true;  // can't validate

    try {
        const regex = new RegExp(vArgs.regularExpression);
        return regex.test(inputValue) || invalidMessage
    } catch (error) {
        return true;
    }
}

export const validatorMinimumNumber: StringValidator = (inputValue, invalidMessage, vArgs) => {
    if (!vArgs) return true;  // can't validate

    const num = parseFloat(inputValue);
    if (isNaN(num)) return invalidMessage;

    return (num >= vArgs.minimum) || invalidMessage;
}

export const validatorTimeFormat: StringValidator = (inputValue, invalidMessage, vArgs) => {
    if (!vArgs) return true;

    const mapping = getMaskPatternMapping();

    const res = matchMaskPattern(inputValue, vArgs.format, mapping);
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

export const validatorMaskComplete: StringValidator = (inputValue, invalidMessage, _vArgs, context: ElementProperties) => {
    const maskPattern = context.pattern;
    if (!maskPattern) return true; // invalid validator for element

    const placeholder = '_'; // TODO substitute with context.placeholder, when implemented
    const pattern = `\\${placeholder}`;

    const patternPlaceholderOcurrences = (maskPattern.match(new RegExp(pattern, 'g')) || []).length;
    const inputPlaceholderOcurrences = (inputValue.match(new RegExp(pattern, 'g')) || []).length;

    return inputPlaceholderOcurrences - patternPlaceholderOcurrences <= 0 ? true : invalidMessage; // completed, when there are no placeholders left
}

export const validatorDateInterval: StringValidator = (inputValue, invalidMessage, vArgs, context) => {
    if (!vArgs) return true;

    let { minDate, maxDate } = vArgs;
    if ((!minDate || !minDate.length) && (!maxDate || !maxDate.length)) return true; // no validation required

    const parsed = parseISODateFromPattern(inputValue, context.pattern)
    if (!parsed) return invalidMessage; // invalid date

    // take 'today' into account
    minDate = minDate && minDate === 'today' ? currentIsoTime() : minDate;
    maxDate = maxDate && maxDate === 'today' ? currentIsoTime() : maxDate;

    return (minDate && compareDateTimes(parsed, minDate) < 0) || (maxDate && compareDateTimes(parsed, maxDate) > 0) ? invalidMessage : true;
}

export const validatorFileSize: ValidatorFunction = (fileInput, invalidMessage, vArgs) => {
    if (!vArgs) return true;

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
            }
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

export function typo3FileSizeToBytes(sizeString: string) {
    if (sizeString.length < 2) return sizeString;

    let str = sizeString.trim();
    const num = Number(str.slice(0, - 1));
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

export function createCallbackList(callbacks: CallbackDefinition<any>[]) {
    return callbacks.map(callback => createCallbackByKey(callback.action, callback.arguments));
}

export function createCallbackByKey(callbackKey: string, callbackArgs: any): FormCallback {
    // inject payload and error message into the selected validation function
    const knownCallbacks: CallbackMap = {
        default: () => Promise.resolve(callbackArgs)
    };

    return knownCallbacks[callbackKey] || knownCallbacks.default;
}

