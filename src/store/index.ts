import {replaceFormatSpecifiers, replacePluralizationTokens} from '@/lib/substitution';
import Vue, {Component} from "vue";
import Vuex, {ActionContext} from "vuex";
import ResponseInterceptor from "./response_interceptor";
import type {CallbackMap} from "@/lib/callbacks";
import {
    CallbackDefinition,
    ElementDefinition,
    FormApi,
    FormDefinition,
    FormErrors,
    FormWrapper,
    isFormDefinition
} from "@/lib/FormDefinition";
import RequestModifier from "@/store/request_modifier";

export type StoreEntry = {
    id: string,
    value: string,
    error: string,
    hasError: boolean,
    default?: boolean
}

// the actual container of store entries
export type StoreImpl = Record<string, StoreEntry>;

export type FormResponse = {
    html?: string,
    title?: string,
    text?: string | null,
    error: boolean
}

export type FormStepConfig = {
    schema: Readonly<FormDefinition>,
    inputModel: StoreImpl,
    formStepError: unknown,
    formId: string,
    formElementId: string,
    formAction: string,
    wasSubmitted: boolean
}

// prototyping StoreImpl values
export type StoreState = {
    id: string,
    formElementId: string,
    currentStep: number,
    loading: boolean,
    formDisabled: boolean,
    errorCount: number;
    nextStep: number,
    lastStep: number;
    formResponse: FormResponse | null,
    formFinished: boolean,
    formErrors: FormErrors | string | null,
    steps: FormStepConfig[],
    callbacksMap: Readonly<CallbackMap>,
    [key: string]: any
}

/**
 * @param ctx
 * @param knownCallbacks
 * @param requestedCallbacks
 * @returns {Promise<unknown[]> | undefined}
 */
function generateCallbacksList(ctx: ActionContext<Partial<StoreState>, Partial<StoreState>>,
                               knownCallbacks: CallbackMap = {},
                               requestedCallbacks: CallbackDefinition<unknown>[] = []): Promise<void> {

    if (!knownCallbacks) return Promise.resolve();

    const callbacks = requestedCallbacks.map(cb => {
        const foundCallback = knownCallbacks[cb.action];

        if (foundCallback) {
            return foundCallback(cb.arguments, ctx);
        } else {
            console.warn(`[Callback] Unknown callback '${cb.action}'`);
            return Promise.resolve();
        }
    });

    const defaultCallback = knownCallbacks['defaultCallback'];
    if (defaultCallback)
        callbacks.push(defaultCallback(null, ctx));

    if (!callbacks || !callbacks.length)
        return Promise.resolve();

    return Promise.all(callbacks).then();
}

/**
 *
 * @param {Vuex} v The Vuex instance.
 * @param {FormStateInit} stateInit
 * @param {Object} stateInit.formData - object containing the form configuration.
 * @param {Object} [stateInit.callbacksMap={}] - object containing form submit callbacks.
 * @returns {Promise<unknown[]>|*}
 */
function createStore(v: typeof Vuex, stateInit: FormStateInit) {
    const debug = process.env.NODE_ENV !== 'production';

    return new v.Store({
        state: initState(stateInit),
        strict: debug,
        getters: {
            getCurrentStep(state) {
                const validIndex = state.currentStep ? state.currentStep - 1 : 0;
                return state.steps ? state.steps[validIndex] : undefined;
            },
            getIsSingleStep(state) {
                return state.lastStep === 1;
            },
            getIsLastStep(state) {
                return state.currentStep === state.lastStep
            },
            getCurrentSchema(_, getters) {
                const currentStep = getters.getCurrentStep as (FormStepConfig | undefined);
                return currentStep ? currentStep.schema : undefined;
            },
            getCurrentModel(_, getters) {
                return (getters.getCurrentStep as (FormStepConfig | undefined))?.inputModel
            },
            getCurrentInputValue(_, getters) {
                return (inputKey: string) => {
                    const model = getters.getCurrentModel as (Record<string, StoreEntry> | undefined);
                    if (!model) return "";

                    const inputModel = model[inputKey];
                    if (!inputModel || !inputModel.value) return "";

                    return inputModel.value;
                };
            },
            getCurrentInputError(_, getters) {
                return (inputKey: string) => {
                    const model = getters.getCurrentModel as (Record<string, StoreEntry> | undefined);
                    if (!model) return "";

                    const inputModel = model[inputKey];
                    if (!inputModel || !inputModel.error) return "";

                    return inputModel.error;
                };
            },
            getCurrentInputName(_, getters) {
                return (inputKey: string) => {
                    const step = getters.getCurrentStep as (FormStepConfig | undefined);
                    if (!step || !step.formId) return `tx_form_formframework[${inputKey}]`;

                    return `tx_form_formframework[${step.formId}][${inputKey}]`;
                };
            },
            getErrorLabel(state, getters) {
                const schema = getters.getCurrentSchema;
                const errorCount = state.errorCount;
                if (errorCount && errorCount > 0 && schema && schema.api && schema.api.page && schema.api.page.errorHint) {
                    const replArgs = [errorCount];
                    const pluralizedErrorHint = replacePluralizationTokens(schema.api.page.errorHint, ...replArgs);
                    return replaceFormatSpecifiers(pluralizedErrorHint, ...replArgs);
                }
                return null;
            },
            getPageSummaryText(_state, getters) {
                const schema = getters.getCurrentSchema as Readonly<FormDefinition> | undefined;
                const text = schema?.api.page.pageSummaryText;
                return text && schema ? replaceFormatSpecifiers(text, schema.api.page.current, schema.api.page.pages) : null;
            },
            getFormErrors(state): FormErrors {
                const formErrors = state.formErrors;
                if (typeof formErrors === 'string')
                    return [formErrors];
                else
                    return formErrors || [];
            }
        },

        mutations: {
            updateInputValue(state, payload) {
                const validIndex = state.currentStep ? state.currentStep - 1 : 0;
                if (!state.steps) return;

                const currentStep = state.steps[validIndex];
                if (!currentStep) return;

                const currentModel = currentStep.inputModel[payload.key] ? currentStep.inputModel[payload.key] : {
                    id: payload.key,
                    value: '',
                    error: '',
                    hasError: false,
                    default: true
                } as StoreEntry;

                currentModel.value = payload.value;
                currentModel.error = '';

                if (currentModel.hasError && state.errorCount && state.errorCount > 0) {
                    state.errorCount = state.errorCount - 1;
                    currentModel.hasError = false;
                }

                currentStep.inputModel[payload.key] = currentModel;

                state.steps = [...state.steps]; // need to re assign the array to trigger a re render

            },
            updateFormStep(state, newStep) {
                state.currentStep = newStep > 0 ? newStep : 1;
            },
            setFormResponse(state, response) {
                state.formResponse = response;
                state.loading = false;
            },
            setFormFinished(state) {
                state.formFinished = true;
                state.loading = false;
            },
            setFormDisabled(state, disabled) {
                state.formDisabled = disabled;
            },
            setFormStep(state, formConfig) {
                const formConfigStep = formConfig.api.page.current > 0 ? formConfig.api.page.current : 1;

                state.id = formConfig.id
                state.currentStep = formConfig.api.page.current || 1
                state.nextStep = formConfig.api.page.nextPage || 1
                state.previousStep = formConfig.api.page.previousPage || 1
                state.lastStep = formConfig.api.page.pages || 1
                state.formResponse = null

                const updatedSteps = state.steps;
                if (updatedSteps) {
                    updatedSteps[formConfigStep - 1] = createStepFromFormConfig(formConfig);
                    state.steps = updatedSteps;
                }

                state.loading = false;
            },
            setFormErrors(state, errorMessages) {
                state.formErrors = errorMessages;
            },
            setLoading(state, isLoading) {
                state.loading = Boolean(isLoading)
            },
            setModelErrors(state, model) {
                if (!model) return;

                const validIndex = state.currentStep ? state.currentStep - 1 : 0;

                if (!state.steps) return;

                const currentStep = state.steps[validIndex];
                if (!currentStep) return;

                const currentModel = currentStep.inputModel;
                if (!currentModel) return;

                for (const inputKey in model) {
                    const inputModel = currentModel[inputKey];
                    if (inputModel) {
                        inputModel.error = model[inputKey];
                        inputModel.hasError = true;
                    }
                }

                state.errorCount = Object.keys(model).length || 0;
            },
            calcFormErrorCount(state, vuetifyFormComponent: Component) {
                const validIndex = state.currentStep ? state.currentStep - 1 : 0;

                if (!state.steps) return;

                const currentStep = state.steps[validIndex];
                if (!currentStep) return;

                const formModel = currentStep.inputModel;
                if (!formModel) return;

                for (const inputKey in formModel) {
                    formModel[inputKey].hasError = false;
                }

                const inputs = (<any> vuetifyFormComponent).inputs as any[]; // actually it's Component[] TODO fix this later

                let errorCount = 0;
                inputs.forEach(element => {
                    if (!element.valid) {
                        // TODO: rework validation to native validation instead of vuetify bullshit
                        // Maybe parse input identifier from its name
                        const elementId = element?.$attrs?.identifier || element.id; // Identify the validated vue input by its identifier

                        const inputModel = formModel[elementId];
                        errorCount++;
                        if (inputModel) {
                            inputModel.hasError = true;
                        } else {
                            formModel[elementId] = {
                                id: element.id,
                                error: '',
                                hasError: true,
                                value: '',
                            }
                        }
                    }
                });

                state.errorCount = errorCount;
            },
            resetFormErrorCount(state) {
                const validIndex = state.currentStep ? state.currentStep - 1 : 0;
                if (!state.steps) return;

                const currentStep = state.steps[validIndex];
                if (!currentStep) return;

                const formModel = currentStep.inputModel;
                if (!formModel) return;

                for (const inputKey in formModel) {
                    formModel[inputKey].hasError = false;
                }

                state.errorCount = 0;
            },
        },

        actions: {
            submitStep(context, vuetifyForm) {
                vuetifyForm.$el.focus();
                const isFormValid = vuetifyForm.validate();
                context.commit('resetFormErrorCount');

                if (vuetifyForm.$el && isFormValid) { // check if form element exists and if it is valid
                    if (context.state.onSubmit) {
                        if (context.state.onSubmit()) return;  // submit event was cancelled
                    }

                    context.commit('setLoading', true);
                    context.commit('setFormErrors', []);
                    const formId = context.state.id;
                    const formData = new FormData(vuetifyForm.$el); // parse formdata from underlying form element

                    // quickfix - radio buttons SOMETIMES not getting put into form data?!
                    const model = context.getters.getCurrentModel as (Record<string, StoreEntry> | undefined);
                    model && Object.entries(model).forEach(([key, value]) => {
                        const mappedKey = `tx_form_formframework[${formId}][${key}]`;
                        if (value.hasError || key.startsWith('__') || value.value.length <= 0 || formData.has(mappedKey)) return;

                        formData.append(mappedKey, value.value);
                    });

                    // append all hidden fields to form data
                    const currentSchema = context.getters.getCurrentSchema as (Readonly<FormDefinition> | undefined);
                    const hiddenFields = currentSchema?.elements?.filter(element => element.type === 'Hidden');

                    hiddenFields && hiddenFields.forEach(field => {
                        if (field.identifier === '__trustedProperties') {
                            // trusted properties has a different naming convention for whatever reason, maybe fix that in the backend later...
                            formData.append('tx_form_formframework[__trustedProperties]', field.defaultValue)
                        } else {
                            formData.append(field.name, field.defaultValue);
                        }
                    })


                    const currentAction = (context.getters.getCurrentStep as FormStepConfig | undefined)?.formAction;
                    if (!currentAction) return;

                    RequestModifier.modifyRequest(context, formData);

                    fetch(currentAction, {
                        method: "POST",
                        body: formData
                    })
                        .then(response => {
                                if (response.status === 200 || response.status === 301) return response.json();
                                throw new Error('invalid status code. Only 200 and 301 allowed');
                            }
                        )
                        .then(json => context.dispatch('handleSuccessResponse', json))
                        .catch(error => { // does not catch handleSuccessResponse errors
                            const labels = context.getters.getCurrentSchema?.global?.labels;
                            context.commit(
                                'setFormResponse',
                                {
                                    title: labels?.error || 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut',
                                    text: Vue.config.devtools ? error.message : null,
                                    error: true
                                }
                            );
                            context.commit('setLoading', false);
                        })

                } else {
                    requestAnimationFrame(function () {
                        context.commit('calcFormErrorCount', vuetifyForm);
                    })
                }
            },


            async handleSuccessResponse(context, successJson) {
                if (!successJson) throw new Error('could not find valid json');

                if (await ResponseInterceptor.handleResponse(context, successJson)) return;

                if (successJson.error || (successJson.errors && successJson.errors.length > 0)) {
                    context.commit('setFormErrors', successJson.error ? [successJson.error] : successJson.errors);
                    return context.commit('setLoading', false);
                }
                // handle redirect on success
                if (successJson.status === 301 && successJson.redirectUri) {
                    await context.dispatch('handleResponseCallbacks', successJson);
                    window.location = successJson.redirectUri;
                    return;
                }

                // handle replace content with success message
                if (successJson.status === 200 && successJson.content) {
                    // if the response contains callbacks handle them before proceeding
                    await context.dispatch('handleResponseCallbacks', successJson);
                    context.commit('setFormResponse', {
                        error: 'success' in successJson ? !successJson.success : false,
                        html: successJson.content
                    });
                    return context.commit('setFormFinished');
                }

                // handle loading next page after finishing callbacks if needed
                if (successJson.api) {
                    if (successJson.api.status === 'failure') {
                        context.commit('setModelErrors', successJson.api.errors);
                        context.commit('setLoading', false);
                        return;
                    }

                    await context.dispatch('handleResponseCallbacks', successJson);
                    return context.commit('setFormStep', successJson);
                }

                context.commit('setLoading', false);

            },

            async handleResponseCallbacks(context, successJson: FormDefinition | FormApi) {
                try {
                    const requestedCallbacks = isFormDefinition(successJson) ? successJson.api.callbacks : successJson.callbacks;
                    if (requestedCallbacks) {
                        const callbacksList = generateCallbacksList(context, context.state.callbacksMap, requestedCallbacks);
                        if (callbacksList) {
                            await callbacksList;
                        }
                    }
                } catch (error) {
                    console.error(error)
                    context.commit(
                        'setFormResponse',
                        {
                            title: 'Ein Fehler ist aufgetreten, bitte versuchen Sie es später erneut',
                            text: Vue.config.devtools ? `Callback response error: ${error}` : null,
                            error: true
                        }
                    );
                }
            }

        }

    })
}

export type FormStateInit = {
    formData: FormWrapper,
    callbacksMap: CallbackMap,
    rest?: Record<string, any>
};

/**
 *
 * @param formData
 * @param callbacksMap
 * @param rest
 * @returns {(*&{currentStep: number, lastStep: ([]|*|number), callbacksMap: {}, previousStep: ((function(*=): *)|*|number), formDisabled: boolean, nextStep: number, formFinished: boolean, id, loading: boolean, steps: {schema: unknown[], formId, wasSubmitted: boolean, inputModel: {}, formAction: string, formStepError: null}[], errorCount: number, formResponse: null})|{}}
 */
function initState({formData, callbacksMap = {}, ...rest}: FormStateInit): Partial<StoreState> {
    const formConfig = formData.configuration;
    if (!formConfig) return {}

    return {
        id: formConfig.id,
        formElementId: formConfig.identifier || formConfig.id,
        currentStep: formConfig.api.page.current || 1,
        loading: false,
        formDisabled: false,
        errorCount: 0,
        nextStep: formConfig.api.page.nextPage || 1,
        lastStep: formConfig.api.page.pages || 1,
        formResponse: null,
        formFinished: false,
        formErrors: [],
        steps: [createStepFromFormConfig(formConfig)],
        callbacksMap: Object.freeze(callbacksMap),
        ...rest
    };
}

function createStepFromFormConfig(formConfig: FormDefinition): FormStepConfig {
    return {
        schema: Object.freeze(formConfig), // the original shape of the form with all the nesting for reconstruction
        inputModel: createModelFromFormConfig(flattenElements(formConfig.elements)),  // actually reactive form state
        formStepError: null,
        formId: formConfig.id,
        formElementId: formConfig.identifier || formConfig.id,
        formAction: formConfig.action || '',
        wasSubmitted: false
    }
}

function createModelFromFormConfig(elements: ElementDefinition[]): StoreImpl {
    const model: StoreImpl = {};
    if (!elements || !Array.isArray(elements)) return model;

    elements.forEach(element => {
        model[element.identifier] = {
            id: element.identifier,
            value: element.defaultValue || '',
            error: '',
            hasError: false,
        }
    });

    return model;
}


// recursive function that generates a flat array of only inputs from a nested form schema
function flattenElements(elements: ElementDefinition[]): ElementDefinition[] {
    const inputs: ElementDefinition[] = [];

    elements.forEach(element => {
        if (element.elements && element.elements.length) {
            // ConditionRadio and Checkbox are container elements but also inputs so this exception is needed
            if (element.type === 'ConditionRadio' || element.type === 'ConditionCheckbox') {
                inputs.push(element);
            }

            inputs.push(...flattenElements(element.elements));
        } else {
            inputs.push(element)
        }
    })

    return inputs;
}


export default createStore;
