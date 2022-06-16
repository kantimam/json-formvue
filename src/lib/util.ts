import {ElementProperties, InputValidator} from "@/lib/FormDefinition";
import {ValidatorMap, Validators} from "@/lib/validators";

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
 * @param {ElementProperties} properties
 * @param {boolean} overwriteRequiredRules - if true deletes the required and NotEmpty validator (you might want this for inputs that use createRequiredLabel for their required validation).
 * @param {object} validatorMap Custom validators.
 * @returns {*[]}
 */
export function createInputRules(required: boolean, validators: InputValidator[], properties: ElementProperties, overwriteRequiredRules = false, validatorMap: ValidatorMap = {}) {
    const rules = createValidatorsMap(validators, properties, validatorMap);

    if (required && overwriteRequiredRules){
        if(rules.required) delete rules.required;
        if(rules.NotEmpty) delete rules.NotEmpty;
    }

    if (required) rules.required = (v) => !!v;

    const rulesArray = [];
    for (const key in rules) rulesArray.push(rules[key])

    return rulesArray;
}

export function createValidatorsMap(validators: InputValidator[], properties: ElementProperties, validatorMap: ValidatorMap) {
    if (!validators || !validators.length) return {};
    const validatorsMap: ValidatorMap = {};

    for (let validator of validators) {
        const id = validator.identifier;
        const validatorArguments = validator.options;
        const errorMessage = validator.errorMessage;

        const validatorFunction = createValidatorByKey(id, validatorArguments || {}, errorMessage, properties, validatorMap)
        if (validatorFunction)
            validatorsMap[id] = validatorFunction;
    }

    return validatorsMap;
}

// create a function and wrap it inside the payload
export function createValidatorByKey(validatorKey: string, vArgs: Record<string, any>, errorMessage: string, properties: ElementProperties, validatorMap: ValidatorMap = {}) {
    // inject payload and error message into the selected validation function
    const required = Validators.required(errorMessage);
    const integer = Validators.integer(errorMessage);

    const knownFunctions: ValidatorMap = {
        required: required,
        NotEmpty: required,
        Text: required,
        StringLength: Validators.stringLength(vArgs.minimum, vArgs.maximum, errorMessage),
        Alphanumeric: Validators.alphanumeric(errorMessage),
        EmailAddress: Validators.email(errorMessage),
        Integer: integer,
        Number: integer,
        Float: Validators.float(errorMessage),
        NumberRange: Validators.numberRange(vArgs.minimum, vArgs.maximum, errorMessage),
        RegularExpression: Validators.regex(vArgs.regularExpression, errorMessage),
        MinimumNumber: Validators.min(vArgs.minimum, errorMessage),
        TimeFormat: Validators.timeFormat(vArgs.format, errorMessage),
        MaskComplete: Validators.maskComplete(properties.pattern, errorMessage),
        FileSize: Validators.fileSize(vArgs.minimum, vArgs.maximum, errorMessage),
        DateInterval: Validators.dateInterval(vArgs.minDate, vArgs.maxDate, properties.pattern, errorMessage),
        Url: Validators.url(errorMessage),
        ...validatorMap,  // TODO use this map alone in 2.0
        default: null
    };

    return knownFunctions[validatorKey] || knownFunctions.default;
}
