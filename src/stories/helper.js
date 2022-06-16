import {createInputRules} from "@/lib/util.ts";

export function createDummyEmailValidator() {
    return {
        "identifier": "EmailAddress",
        "code": 1221559976,
        "errorMessage": "Bitte geben Sie eine gültige E-Mail-Adresse ein"
    };
}

export function createDummyValidator(identifier, errorMessage, code = 0) {
    return {
        identifier: identifier,
        code: code,
        errorMessage: errorMessage
    };
}

export function createDummyRequiredValidator() {
    return createDummyValidator('NotEmpty', 'This field is required', 1221560910);
}

export function defaultProps(label, identifier, primitive = false, required = false) {
    const props = {
        label: label,
        identifier: identifier,
        filled: true,
        properties: {},
        name: identifier,
    };

    if (primitive) {
        if (required) {
            props.required = true;
            props.requiredLabel = 'This field is required'
            props.rules = createInputRules(true, [createDummyRequiredValidator()], {}, true, []);
        }

        return props;
    }

    if (required) {
        props.properties = {
            fluidAdditionalAttributes: {
                required: 'required'
            }
        };
        props.validators = [createDummyRequiredValidator()];
    } else {
        props.optional = true;
    }

    return props;
}
