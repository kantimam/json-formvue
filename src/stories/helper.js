import {createInputRules} from "@/lib/util.ts";

export function createDummyEmailValidator() {
    return {
        "identifier": "EmailAddress",
        "code": 1221559976,
        "errorMessage": "Bitte geben Sie eine gültige E-Mail-Adresse ein"
    };
}

export function createDummyRequiredValidator() {
    return {
        identifier: 'NotEmpty',
        code: 1221560910,
        errorMessage: 'This field is required'
    };
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
        } else {
            props.optional = true;
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
    }

    return props;
}
