export const createInputName=(formName, inputName)=>`tx_form_formframework[${formName}][${inputName}]`


export const isRequired=(properties)=>!!properties && properties.fluidAdditionalAttributes && properties.fluidAdditionalAttributes.required && properties.fluidAdditionalAttributes.required === 'required';


export const createValidatorList=(validators, errors)=>{
    if(!validators || !validators.length) return {}
    const validatorsMap={};

    for(let validator of validators){
        const id=validator.identifier;
        const validatorArguments=validator.options;
        const errorMessage=validator.errorMessage;
        const validatorFunction=createValidatorByKey(id, validatorArguments, errorMessage)
        if(validatorFunction) validatorsMap[id]=validatorFunction;
    }
    return validatorsMap;
    
}
// create a function and wrap it inside the payload
export const createValidatorByKey=(validatorKey, vArgs, errorMessage)=>{
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
            
            console.log(`successfully executed testCallback with the arguments`)
            console.log(callbackArgs)
            res(callbackArgs)
        }, 1200);
    })
)