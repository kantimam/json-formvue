import { createCallbackList } from '../lib/util';


/* look into splitting single step and multi step into different modules and conditionally adding them if needed */
const createStore = (Vuex, initialState) => {
  const debug = process.env.NODE_ENV !== 'production'


  return new Vuex.Store({
    state: initFormStateFromExtendedForm(initialState),
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
      }
    },

    mutations: {
      updateInputValue(state, payload) {
        const validIndex = state.currentStep ? state.currentStep - 1 : 0;
        const currentStep = state.steps[validIndex];
        if (!currentStep) return;

        const currentModel = currentStep.inputModel[payload.key];
        if (!currentModel) {
          currentStep.inputModel[payload.key] = {
            id: payload.key,
            value: payload.value,
            error: '',
            hasError: false
          }
        } else {
          currentModel.value = payload.value;
          currentModel.error = '';
          if (currentModel.hasError && state.errorCount > 0) {
            state.errorCount = state.errorCount - 1;
            currentModel.hasError = false;
          }
        }

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
      setFormStep(state, formConfig) {
        const formConfigStep = formConfig.api.page.current > 0 ? formConfig.api.page.current : 1;

        state.id = formConfig.id
        state.currentStep = formConfig.api.page.current || 1
        state.nextStep = formConfig.api.page.nextPage || 1
        state.previousStep = formConfig.api.page.previousPage || 1
        state.lastStep = formConfig.api.page.pages || 1
        state.formResponse = null

        state.steps[formConfigStep - 1] = createStepFromFormConfig(formConfig)
        state.loading = false;

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
            const inputModel = formModel[element.id];
            errorCount++;
            if (inputModel) {
              inputModel.hasError = true;
            } else {
              formModel[element.id] = {
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
        const isFormValid = vuetifyForm.validate();

        if (vuetifyForm.$el && isFormValid) { // check if form element exists and if it is valid
          context.commit('setLoading', true);
          context.commit('resetFormErrorCount');
          const formData = new FormData(vuetifyForm.$el); // parse formdata from underlying form element

          const currentModel = context.getters.getCurrentModel;
          // append entries to formdata
          formData.append(context.getters.getCurrentInputName('__currentPage'), currentModel['__currentPage'].value)
          formData.append('tx_form_formframework[__trustedProperties]', currentModel['__trustedProperties'].value)
          formData.append(context.getters.getCurrentInputName('__state'), currentModel['__state'].value)

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
              console.log("catche an error");
              console.log(error);
              context.commit(
                'setFormResponse',
                `<h1>request failed</h1>
                <h2>${error.message}</h2>`
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
        console.log("reached suc")
        if (!successJson) throw new Error('could not find valid json');
        console.log(successJson)
        // handle redirect on success
        if (successJson.status === 301 && successJson.redirectUri) {
          window.location = successJson.redirectUri;
          return;
        }

        // handle replace content with success message
        if (successJson.status === 200 && successJson.content) {
          if (successJson.callbacks && successJson.callbacks.length) {
            // if the response contains callbacks handle them before proceeding
            try {
              await context.dispatch('handleSuccessCallbacks', successJson.callbacks);
            } catch (error) {
              // if a callback fails return early
              return context.commit(
                'setFormResponse',
                `<h1>one of the form callbacks failed, check console for more info</h1>
                  <h2>${error}</h2>`
              );
            }
          }
          context.commit('setFormResponse', successJson.content);
          context.commit('setFormFinished');
          return;
        }

        // handle loading next page after finishing callbacks if needed
        if (successJson.api) {
          if (successJson.api.status = 'failure') {
            context.commit('setModelErrors', successJson.api.errors);
          }
          if (successJson.api.callbacks && successJson.api.callbacks.length) {
            try {
              await context.dispatch('handleSuccessCallbacks', successJson.api.callbacks);
            } catch (error) {
              return context.commit(
                'setFormResponse',
                `<h1>one of the step callbacks failed, check console for more info</h1>
                  <h2>${error}</h2>`
              );
            }
          }
          context.commit('setFormStep', successJson);
        }

      },


      async handleSuccessCallbacks(_context, callbackArray) {
        const createdCallbackList = createCallbackList(callbackArray);
        if (!createdCallbackList || !createdCallbackList.length) return;

        return Promise.all(createdCallbackList);

      }
    }

  })
}

/* should maybe generate error handlers and finishers once on start instead of in every input component */
/* try to flatten the data as much as possible. Repeating data is fine */

function initFormStateFromExtendedForm(formData) {
  const formConfig = formData.configuration;
  if (!formConfig) return {}

  const state = {
    id: formConfig.id,
    currentStep: formConfig.api.page.current || 1,
    loading: false,
    errorCount: 0,
    nextStep: formConfig.api.page.nextPage || 1,
    previousStep: formConfig.api.page.previousPage || 1,
    lastStep: formConfig.api.page.pages || 1,
    formResponse: null,
    formFinished: false,

    steps: [
      createStepFromFormConfig(formConfig)
    ]
  }
  return state;
}


function createStepFromFormConfig(formConfig) {
  return {
    schema: Object.freeze(formConfig), // the original shape of the form with all the nesting for reconstruction
    inputModel: createModelFromFormConfig(inputArrayFromSchema(formConfig.elements)),  // actually reactive form state

    formStepError: null,
    formId: formConfig.id,
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
      inputs.push(...inputArrayFromSchema(element.elements));
    }
    else inputs.push(element)
  })

  return inputs;
}


export default createStore;
