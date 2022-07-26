import 'core-js/stable';
import 'regenerator-runtime/runtime';

// CORE
import createStore from './store'
import FormVue from './FormVue.vue';

// OPTIONAL ELEMENTS
import BaseInput from './components/fields/base_input.vue';
import OnTextfieldText from "./components/fields/composed/textfield.vue";
import OnTextfieldEmail from "./components/fields/composed/textfield_email.vue";
import OnTextfieldNumber from "./components/fields/composed/textfield_number.vue";
import OnTextfieldPassword from "./components/fields/composed/textfield_password.vue";
import HiddenfieldHoneypot from "./components/fields/hiddenfield_honeypot.vue";
import FormGridRow from "./components/containers/form_grid_row.vue";
import OnTextArea from './components/fields/composed/textarea.vue'
import OnCheckBox from './components/fields/composed/extended_checkbox/checkbox.vue'
import OnRadioGroup from './components/fields/radio_group.vue'
import OnSelect from './components/fields/extended_select.vue'
import SelectWithRelatedData from './components/fields/select_with_related_data.vue'
import AdvancedPassword from "./components/fields/advanced_password.vue";
import FileUpload from "./components/fields/file_upload.vue";
import StaticText from "./components/fields/other/static_text/static_text.vue";
import OnCaptcha from "./components/fields/onCaptcha/onCaptcha.vue";
import DatePicker from "./components/fields/composed/datepicker.vue";
import MaskedText from "./components/fields/composed/textfield_masked.vue";
import ConditionRadio from "./components/containers/condition_radio.vue";
import ConditionCheckbox from "./components/containers/condition_checkbox.vue";
import ConditionalContent from "./components/containers/conditional_content.vue";
import Telephone from './components/fields/composed/textfield_telephone.vue';
import Url from './components/fields/composed/textfield_url.vue';
import MultiSelect from './components/fields/extended_multiselect.vue';
import MultiCheckbox from './components/fields/multi_checkbox.vue';
import ContentElement from './components/fields/other/content_element/content_element.vue';

// INTERNAL ELEMENTS
import DynamicElement from './components/dynamic_element.vue';

// PUBLIC OPTIONAL FUNCTIONS AND HELPERS
import {createInputName, createInputRules, createRequiredLabel, getPlaceholder, isRequired} from "./lib/util";
import ResponseInterceptor from "@/store/response_interceptor";
import Handler = ResponseInterceptor.Handler;


// re export all public modules
export {
    // core modules that are required to init FormVue
    FormVue,
    createStore,
    // utility functions that can be used to create your own elements
    createInputName,
    isRequired,
    getPlaceholder,
    createRequiredLabel,
    createInputRules,
    // list of optional default elements that can be used
    BaseInput,
    DynamicElement,
    OnTextfieldText,
    OnTextfieldEmail,
    OnTextfieldNumber,
    OnTextfieldPassword,
    HiddenfieldHoneypot,
    FormGridRow,
    OnTextArea,
    OnCheckBox,
    OnRadioGroup,
    OnSelect,
    SelectWithRelatedData,
    OnCaptcha,
    AdvancedPassword,
    FileUpload,
    StaticText,
    MaskedText,
    ConditionRadio,
    ConditionCheckbox,
    ConditionalContent,
    Telephone,
    Url,
    MultiSelect,
    MultiCheckbox,
    DatePicker,
    ContentElement
}

export { registerResponseInterceptor } from '@/store/response_interceptor';
export { registerRequestModifier } from '@/store/request_modifier';

