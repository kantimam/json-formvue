export const createInputName=(formName, inputName)=>`tx_form_formframework[${formName}][${inputName}]`

export function isRequired(properties) {
    return properties?.fluidAdditionalAttributes?.required === 'required';
}

export function getPlaceholder(properties) {
    return properties?.fluidAdditionalAttributes?.placeholder;
}

export const createValidatorList=(validators, errors, context)=>{
    if(!validators || !validators.length) return {}
    const validatorsMap={};

    for(let validator of validators){
        const id=validator.identifier;
        const validatorArguments=validator.options;
        const errorMessage=validator.errorMessage;
        const validatorFunction=createValidatorByKey(id, validatorArguments, errorMessage, context)
        if(validatorFunction) validatorsMap[id]=validatorFunction;
    }
    return validatorsMap;
    
}
// create a function and wrap it inside the payload
export const createValidatorByKey=(validatorKey, vArgs, errorMessage, context)=>{
    // inject payload and error message into the selected validation function
    const knownFunctions={
        required: (inputValue)=>validatorRequired(inputValue,  errorMessage || `this field is required`),
        NotEmpty: (inputValue)=>validatorRequired(inputValue, errorMessage || `this field is required`),
        StringLength: (inputValue)=>!inputValue.length || validatorLength(inputValue, errorMessage || `input length must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs),
        Alphanumeric: (inputValue)=>!inputValue.length || validatorAlphanumeric(inputValue, errorMessage || `this field must be alphanumeric (different alphabets need to be implemented)`),
        EmailAddress: (inputValue)=>!inputValue.length || validatorEmail(inputValue, errorMessage || `invalid email`),
        Integer: (inputValue)=>!inputValue.length || validatorInteger(inputValue, errorMessage || `positive integer required`),
        Float: (inputValue)=>!inputValue.length || validatorFloat(inputValue, errorMessage || `positive float required`),
        Text: (inputValue)=>validatorRequired(inputValue, errorMessage || `this field is required`),
        NumberRange: (inputValue)=>!inputValue.length || validatorNumberRange(inputValue, errorMessage || `number must be between ${vArgs.minimum} and ${vArgs.maximum}`, vArgs),
        RegularExpression: (inputValue)=>!inputValue.length || validatorRegex(inputValue, errorMessage || `input must match following regular expression ${vArgs.regularExpression}`, vArgs),
        MinimumNumber: (inputValue) => !inputValue.length || validatorMinimumNumber(inputValue, errorMessage || `number must be greater thant ${vArgs.minimum}`, vArgs),
        TimeFormat: (inputValue) => !inputValue.length || validatorTimeFormat(inputValue, errorMessage || `the datetime must be in this format: '${vArgs.format}'`, vArgs),
        MaskComplete: (inputValue) => !inputValue.length || validatorMaskComplete(inputValue, errorMessage || `please complete the input`, vArgs, context),
        default: null
    }
    return knownFunctions[validatorKey] || knownFunctions.default;
}


export const validatorRequired=(string, invalidMessage)=>!!string || invalidMessage;
export const validatorLength=(string, invalidMessage, vArgs)=>{
    if(!string.length) return invalidMessage;
    const trimmedString=string.trim();
    return (trimmedString.length>=vArgs.minimum && trimmedString.length<=vArgs.maximum) || invalidMessage;
};
export const validatorAlphanumeric=(string, invalidMessage)=>/^[a-z0-9]+$/i.test(string) || invalidMessage
export const validatorEmail=(string, invalidMessage)=>{
    const emailRegex=/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return emailRegex.test(string) || invalidMessage
}
export const validatorInteger=(string, invalidMessage)=>/^\d+$/.test(string) || invalidMessage;
export const validatorFloat=(string, invalidMessage)=>/^([1-9]\d*(\.|\,)\d*|0?(\.|\,)\d*[1-9]\d*|[1-9]\d*)$/.test(string) || invalidMessage;
export const validatorNumberRange=(string, invalidMessage, vArgs)=>{
    if(isNaN(string)) return invalidMessage;
    const num=parseFloat(string);
    return (num>=vArgs.minimum && num<vArgs.maximum) || invalidMessage;
}
export const validatorRegex=(string, invalidMessage, vArgs)=>{
    /* when no regex or a invalid regex was provided return true = valid so this does not break the form */
    if(!vArgs.regularExpression) return true;
    try {
        const regex=new RegExp(vArgs.regularExpression);
        return regex.test(string) || invalidMessage
    } catch (error) {
        return true;
    }
}
export const validatorMinimumNumber=(string, invalidMessage, vArgs)=>{
    if(isNaN(string)) return invalidMessage;
    const num=parseFloat(string);
    return (num>=vArgs.minimum) || invalidMessage;
}

export const validatorTimeFormat = (string, invalidMessage, vArgs) => {
    const mapping = {
        'H': [0, 23, 1], // min_value, max_value, min_digits
        'i': [0, 59, 1],
        'd': [0, 31, 1],
        'm': [1, 12, 1],
        'Y': [0, undefined] // omit min_digits to set to max_digits (derived by given format)
    };

    const [pattern, order] = convertTimeFormatToPattern(vArgs.format, mapping);
    const regex = new RegExp(pattern);

    const match = string.match(regex);
    if (!match) return invalidMessage;

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

    let placeholder = context.placeholder ? context.placeholder.trim() : '';
    if (!placeholder || placeholder.length <= 0) return true; // disabled
    placeholder = placeholder.substring(0, 1); // in case someone put more than one character

    const pattern = `\\${placeholder}`;

    const patternPlaceholderOcurrences = (maskPattern.match(new RegExp(pattern, 'g')) || []).length;
    const inputPlaceholderOcurrences = (string.match(new RegExp(pattern, 'g')) || []).length;

    return inputPlaceholderOcurrences - patternPlaceholderOcurrences <= 0 ? true : invalidMessage; // completed, when there are no placeholders left
}

export const createCallbackList=(callbacks)=>{
    return callbacks.map(callback=>(
        createCallbackByKey(callback.action, callback.arguments)
    ))
}


export const createCallbackByKey=(callbackKey, callbackArgs)=>{
    // inject payload and error message into the selected validation function
    const knownCallbacks={
        default: testCallback(callbackArgs)
    }
    return knownCallbacks[callbackKey] || knownCallbacks.default;
} 


export const testCallback=(callbackArgs)=>(
    new Promise((res, rej)=>{
        setTimeout(()=>{
            if(Math.random()<0) return rej(`failed testCallback with the arguments ${JSON.stringify(callbackArgs)}`)
            res(callbackArgs)
        }, 1200);
    })
)

const convertTimeFormatToPattern = (format, mapping) => {
    const intermediaryPattern = Object.keys(mapping)
        .map(c => c.concat('+'))
        .join('|');
    const intermediaryRegex = new RegExp(intermediaryPattern, 'g');
    const matches = Array.from(format.matchAll(intermediaryRegex));

    let cursor = 0;
    const patternSegments = [];
    const groupOrder = [];

    matches.forEach(match => {
        const str = match[0];
        const len = str.length;
        const firstChar = str[0];
        const [_min, _max, minDigits] = mapping[firstChar];
        groupOrder.push(firstChar);

        const group = `([0-9]{${minDigits || len},${len}})`;
        patternSegments.push(format.slice(cursor, match.index), group);
        cursor = match.index + len;
    });

    if (cursor < format.length) patternSegments.push(format.slice(cursor, format.length));

    return [patternSegments.join(''), groupOrder];
}


/* export const scrollToFirstFormError=(formElement)=>{
    console.log(formElement)
    const firstInputWithError=formElement.querySelector(".v-input.error--text");
    if(firstInputWithError){
        firstInputWithError.scrollIntoView({
            behavior: "smooth",
            block: "end"
        })
    }
} */