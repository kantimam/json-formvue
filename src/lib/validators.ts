import {CallbackDefinition} from "@/lib/FormDefinition";
import {getMaskPatternMapping, matchMaskPattern} from "@/lib/pattern";
import {compareDateTimes, interpretTime, parseISODateFromPattern} from "@/lib/time";
import {CallbackMap, FormCallback} from "@/lib/callbacks";

export type InputValue = string | File | FileList;
export type TypedValidatorFunction<T extends InputValue> = (inputValue: T) => boolean | string;
export type ValidatorFunction = TypedValidatorFunction<InputValue>;
export type ValidatorMap = Record<string, ValidatorFunction | null>;
export type StringValidator = TypedValidatorFunction<string>;

export namespace Validators {

    type TypePredicate<T extends InputValue> = (inputValue: InputValue) => inputValue is T;

    function stringValidator(validator: StringValidator): ValidatorFunction {
        return typedValidator(validator, (inputValue => typeof inputValue === 'string') as TypePredicate<string>);
    }

    function typedValidator<T extends InputValue>(validator: TypedValidatorFunction<T>, predicate: TypePredicate<T>): ValidatorFunction {
        return inputValue => {
            if (!predicate(inputValue)) return true;  // can't validate, because of type mismatch
            return validator(inputValue);
        }
    }

    export function required(errorMessage = 'this field is required') {
        return stringValidator(inputValue => !!inputValue || errorMessage);
    }

    export function stringLength(minimum: number, maximum: number, errorMessage?: string) {
        minimum = Math.floor(minimum);
        maximum = Math.floor(maximum);

        if (!errorMessage)
            errorMessage = `input length must be between ${minimum} and ${maximum}`;

        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            const trimmedString = inputValue.trim();
            return (trimmedString.length >= minimum && trimmedString.length <= maximum) || errorMessage!;
        })
    }

    export function alphanumeric(errorMessage = 'this field must be alphanumeric (different alphabets need to be implemented)') {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            return /^[a-z\d]+$/i.test(inputValue) || errorMessage
        });
    }

    export function email(errorMessage = 'invalid email') {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            // Modified Regex which ensures at least 2 TLD chars
            // const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}|\[(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/
            const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/
            return emailRegex.test(inputValue) || errorMessage;
        })
    }

    export function integer(errorMessage = 'positive integer required') {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            return /^\d+$/.test(inputValue) || errorMessage;
        });
    }

    export function float(errorMessage = 'positive float required') {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            return /^([1-9]\d*([.,])\d*|0?([.,])\d*[1-9]\d*|[1-9]\d*)$/.test(inputValue) || errorMessage;
        })
    }

    export function numberRange(minimum: number, maximum: number, errorMessage?: string) {
        if (!errorMessage)
            errorMessage = `number must be between ${minimum} and ${maximum}`;

        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            const num = parseFloat(inputValue);
            if (isNaN(num)) return errorMessage!;

            return (num >= minimum && num < maximum) || errorMessage!;
        })
    }

    export function regex(pattern: string, errorMessage?: string) {
        if (!errorMessage)
            errorMessage = `input must match following regular expression ${pattern}`

        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            try {
                const regex = new RegExp(pattern);
                return regex.test(inputValue) || errorMessage!
            } catch (error) {
                return true;  // Could not compile pattern
            }
        })
    }

    export function min(minimum: number, errorMessage?: string) {
        if (!errorMessage)
            errorMessage = `number must be greater than ${minimum}`;

        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            const num = parseFloat(inputValue);
            if (isNaN(num)) return errorMessage!;

            return (num >= minimum) || errorMessage!;
        })
    }

    export function timeFormat(format: string, errorMessage?: string) {
        if (!errorMessage)
            errorMessage = `the datetime must be in this format: '${format}'`;

        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            const mapping = getMaskPatternMapping();

            const res = matchMaskPattern(inputValue, format, mapping);
            if (!res) return errorMessage!;

            const [match, order] = res;

            // validate each pattern group
            for (let i = 1; i < match.length; i++) {
                const num = Number(match[i]);
                const [min, max] = mapping[order[i - 1]];
                if (num < min || (max !== undefined && num > max)) return errorMessage!;
            }

            return true;
        })
    }

    export function maskComplete(maskPattern: string, errorMessage = 'please complete the input') {
        return stringValidator(inputValue => {
            if (!inputValue.length || !maskPattern) return true;

            const placeholder = '_'; // TODO substitute with context.placeholder, when implemented
            const pattern = `\\${placeholder}`;

            const patternPlaceholderOcurrences = (maskPattern.match(new RegExp(pattern, 'g')) || []).length;
            const inputPlaceholderOcurrences = (inputValue.match(new RegExp(pattern, 'g')) || []).length;

            return inputPlaceholderOcurrences - patternPlaceholderOcurrences <= 0 ? true : errorMessage; // completed, when there are no placeholders left
        });
    }

    export function dateInterval(minDate: string, maxDate: string, pattern: string, errorMessage?: string) {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            if ((!minDate || !minDate.length) && (!maxDate || !maxDate.length)) return true; // no validation required

            const parsed = parseISODateFromPattern(inputValue, pattern)
            if (!parsed) return errorMessage || 'invalid date'; // invalid date

            // take 'today' into account
            minDate = interpretTime(minDate);
            maxDate = interpretTime(maxDate);

            if (minDate && (compareDateTimes(parsed, minDate) < 0)) {
                return errorMessage || `please enter a date after ${minDate}`;
            }

            if (maxDate && (compareDateTimes(parsed, maxDate) > 0)) {
                return errorMessage || `please enter a date before ${maxDate}`;
            }

            return true;
        });
    }

    /**
     * @param minimum Minimum filesize with unit. E.g. '20M' or '800K'
     * @param maximum Maximum filesize with unit. E.g. '20M' or '800K'
     * @param errorMessage Error message.
     */
    export function fileSize(minimum: string, maximum: string, errorMessage?: string): ValidatorFunction {
        return inputValue => {
            if (!inputValue) return true; // if fileList is empty this is valid

            const minSize = typo3FileSizeToBytes(minimum);
            const maxSize = typo3FileSizeToBytes(maximum);
            let totalSize = 0;
            let valid = true;

            if (inputValue instanceof FileList) {
                let fileCount = inputValue.length;
                let index = 0;
                for (; index < fileCount; index++) {
                    const file = inputValue[index];
                    if (file instanceof File) {
                        const size = file.size;
                        if (isNaN(size)) continue;
                        totalSize += size;
                    }
                }
            } else if (inputValue instanceof File) {
                const size = inputValue.size;
                if (isNaN(size)) {
                    valid = false;
                } else {
                    totalSize += size;
                }
            }

            if (totalSize > maxSize || totalSize < minSize)
                valid = false;

            return valid || errorMessage || `combined size of all files needs to be between ${minimum} (${minSize} bytes) and ${maximum} (${maxSize} bytes) but was ${totalSize} bytes.\``;
        };
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

    export function url(errorMessage = 'Invalid URL') {
        return stringValidator(inputValue => {
            if (!inputValue.length) return true;

            const pattern = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%\/.\w-_]*)?\??[-+=&;%@.\w_]*#?[\w]*)?)$/;
            return pattern.test(inputValue) || errorMessage;
        });
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
}
