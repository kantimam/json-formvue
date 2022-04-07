import {replaceFormatSpecifiers} from '../lib/substitution';
import Vue from "vue";
import * as ResponseInterceptor from "../store/response_interceptor";


/**
 *
 * @param knownCallbacks
 * @param requestedCallbacks
 * @returns {Promise<unknown[]> | undefined}
 */
function generateCallbacksList(knownCallbacks = {}, requestedCallbacks = []) {
  if (!knownCallbacks) return;
  const callbacks = requestedCallbacks.map(callbackDescription => {
    const foundCallback = knownCallbacks[callbackDescription.action];
    if (foundCallback) return foundCallback(callbackDescription.arguments);
  })
  const defaultCallback = knownCallbacks['defaultCallback'];
  if (defaultCallback) {
    callbacks.push(defaultCallback());
  }
  if (!callbacks || !callbacks.length) return;

  return Promise.all(callbacks);

}


/**
 *
 * @param Vuex
 * @param {Object} initialState
 * @param {Object} initialState.formData - object containing the form configuration.
 * @param {Object} [initialState.callbacksMap={}] - object containing form submit callbacks.
 * @returns {Promise<unknown[]>|*}
 */
const createStore = (Vuex, initialState) => {
  const debug = process.env.NODE_ENV !== 'production'


  return new Vuex.Store({
    state: initState(initialState),
    strict: debug,

    getters: {
      getCurrentStep: state => {
        const validIndex = state.currentStep ? state.currentStep - 1 : 0;
        return state.steps[validIndex];
      },
      getIsSingleStep: state => {
        return state.lastStep === 1
      },
      getIsLastStep: state => {
        return state.currentStep === state.lastStep
      },
      getCurrentSchema: (_, getters) => {
        return getters.getCurrentStep.schema
      },
      getCurrentModel: (_, getters) => {
        return getters.getCurrentStep.inputModel
      },
      getCurrentInputValue: (_, getters) => inputKey => {
        const model = getters.getCurrentModel;
        if (!model) return ""
        const inputModel = model[inputKey];
        if (!inputModel || !inputModel.value) return ""
        return inputModel.value;
      },
      getCurrentInputError: (_, getters) => inputKey => {
        const model = getters.getCurrentModel;
        if (!model) return ""
        const inputModel = model[inputKey];
        if (!inputModel || !inputModel.error) return ""
        return inputModel.error;
      },
      getCurrentInputName: (_, getters) => inputKey => {
        const step = getters.getCurrentStep;
        if (!step || !step.formId) return `tx_form_formframework[${inputKey}]`
        return `tx_form_formframework[${step.formId}][${inputKey}]`
      },
      getErrorLabel: (state, getters) => {
        const schema = getters.getCurrentSchema;
        const errorCount = state.errorCount;
        if (errorCount > 0 && schema && schema.api && schema.api.page && schema.api.page.errorHint) {
          const errorHintWithCount = schema.api.page.errorHint.replace("%s", errorCount);
          return errorHintWithCount;
        }
        return null;
      },
      getPageSummaryText: (_state, getters) => {
        const schema = getters.getCurrentSchema;
        const text = schema?.api?.page?.pageSummaryText;
        return text ? replaceFormatSpecifiers(text, schema.api.page.current, schema.api.page.pages) : null;
      },
      getFormErrors: (state) =>{
        if (!Array.isArray(state.formErrors)) return [state.formErrors];
        return state.formErrors || [];
      }
    },

    mutations: {
      updateInputValue(state, payload) {
        const validIndex = state.currentStep ? state.currentStep - 1 : 0;
        const currentStep = state.steps[validIndex];
        if (!currentStep) return;

        const currentModel = currentStep.inputModel[payload.key] ? currentStep.inputModel[payload.key] : {
          id: payload.key,
          hasError: false,
          default: true
        };

        currentModel.value = payload.value;
        currentModel.error = '';
        if (currentModel.hasError && state.errorCount > 0) {
          state.errorCount = state.errorCount - 1;
          currentModel.hasError = false;
        }

        currentStep.inputModel[payload.key] = currentModel;

        state.steps=[...state.steps]; // need to re assign the array to trigger a re render

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

        const updatedSteps=state.steps;
        updatedSteps[formConfigStep - 1]=createStepFromFormConfig(formConfig);
        state.steps = updatedSteps;
        state.loading = false;

      },
      setFormErrors(state, errorMessages){
        state.formErrors=errorMessages;
      },
      setLoading(state, isLoading) {
        state.loading = Boolean(isLoading)
      },
      setModelErrors(state, model) {
        if (!model) return;
        const validIndex = state.currentStep ? state.currentStep - 1 : 0;
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
      calcFormErrorCount(state, vuetifyFormComponent) {
        const validIndex = state.currentStep ? state.currentStep - 1 : 0;
        const currentStep = state.steps[validIndex];
        if (!currentStep) return;

        const formModel = currentStep.inputModel;
        if (!formModel) return;

        for (const inputKey in formModel) {
          formModel[inputKey].hasError = false;
        }

        const inputs = vuetifyFormComponent.inputs;

        let errorCount = 0;
        inputs.forEach(element => {
          if (!element.valid) {
            // TODO: rework validation to native validation instead of vuetify bullshit
            // Maybe parse input identifier from its name
            const elementId=element?.$attrs?.identifier || element.id; // Identify the validated vue input by its identifier

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
          context.commit('setLoading', true);
          context.commit('setFormErrors', []);
          const formId = context.state.formElementId;
          const formData = new FormData(vuetifyForm.$el); // parse formdata from underlying form element

          // quickfix - radio buttons SOMETIMES not getting put into form data?!
          const modelSupplier = context.getters.getCurrentModel;
          if (modelSupplier) {
            Object.entries(modelSupplier).forEach(([key, value]) => {
              const mappedKey = `tx_form_formframework[${formId}][${key}]`;
              if (!!value.hasError || key.startsWith('__') || value.value.length <= 0 || formData.has(mappedKey)) return;
              formData.append(mappedKey, value.value);
            });
          }

          // append all hidden fields to form data
          const hiddenFields=context.getters.getCurrentSchema?.elements.filter(element=>element.type==='Hidden');
          hiddenFields.forEach(field=>{
            if(field.identifier==='__trustedProperties'){
              // trusted properties has a different naming convention for whatever reason, maybe fix that in the backend later...
              formData.append('tx_form_formframework[__trustedProperties]', field.defaultValue)
            }else{
              formData.append(field.name, field.defaultValue);
            }
          })

          const currentAction = context.getters.getCurrentStep.formAction;
          if (!currentAction) return;

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

        if(successJson.error || (successJson.errors && successJson.errors.length > 0)){
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

      async handleResponseCallbacks(context, successJson) {
        try {
          const requestedCallbacks = successJson?.api?.callbacks || successJson?.callbacks;
          if (requestedCallbacks) {
            const callbacksList = generateCallbacksList(context.state.callbacksMap, requestedCallbacks);
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

/**
 *
 * @param formData
 * @param callbacksMap
 * @param rest
 * @returns {(*&{currentStep: number, lastStep: ([]|*|number), callbacksMap: {}, previousStep: ((function(*=): *)|*|number), formDisabled: boolean, nextStep: number, formFinished: boolean, id, loading: boolean, steps: {schema: unknown[], formId, wasSubmitted: boolean, inputModel: {}, formAction: string, formStepError: null}[], errorCount: number, formResponse: null})|{}}
 */
function initState({formData, callbacksMap = {}, ...rest}) {
  const formConfig = formData.configuration;
  if (!formConfig) return {}

  const state = {
    id: formConfig.id,
    formElementId: formConfig.identifier || formConfig.id,
    currentStep: formConfig.api.page.current || 1,
    loading: false,
    formDisabled: false,
    errorCount: 0,
    nextStep: formConfig.api.page.nextPage || 1,
    previousStep: formConfig.api.page.previousPage || 1,
    lastStep: formConfig.api.page.pages || 1,
    formResponse: null,
    formFinished: false,
    formErrors: [],

    steps: [
      createStepFromFormConfig(formConfig)
    ],
    callbacksMap: Object.freeze(callbacksMap),
    ...rest

  }
  return state;
}


function createStepFromFormConfig(formConfig) {
  return {
    schema: Object.freeze(formConfig), // the original shape of the form with all the nesting for reconstruction
    inputModel: createModelFromFormConfig(inputArrayFromSchema(formConfig.elements)),  // actually reactive form state

    formStepError: null,
    formId: formConfig.id,
    formElementId: formConfig.identifier || formConfig.id,
    formAction: formConfig.action || '',
    wasSubmitted: false
  }
}

function createModelFromFormConfig(elements) {
  const model = {};
  if (!elements || !Array.isArray(elements)) return model;

  elements.forEach(element => {
    model[element.identifier] = {
      id: element.identifier,
      value: element.defaultValue || '',
      error: '',
      hasError: false,
    }
  })
  return model;
}


// recursive function that generates a flat array of only inputs from a nested form schema
function inputArrayFromSchema(elements) {
  const inputs = [];

  elements.forEach(element => {
    if (element.elements && element.elements.length) {
      // ConditionRadio and Checkbox are container elements but also inputs so this exception is needed
      if(element.type==='ConditionRadio' || element.type==='ConditionCheckbox'){
        inputs.push(element);
      }
      inputs.push(...inputArrayFromSchema(element.elements));
    } else inputs.push(element)
  })

  return inputs;
}


export default createStore;
