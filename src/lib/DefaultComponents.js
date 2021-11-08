import ComponentsMapping from "./ComponentsMapping";

import OnTextfieldText from "../components/fields/textfield_text.vue";
import OnTextfieldEmail from "../components/fields/textfield_email.vue";
import OnTextfieldNumber from "../components/fields/textfield_number.vue";
import OnTextfieldPassword from "../components/fields/textfield_password.vue";
import HiddenfieldHoneypot from "../components/fields/hiddenfield_honeypot.vue";
import FormGridRow from "../components/layout/form_grid_row.vue";
import OnTextArea from '../components/fields/extended_textarea.vue'
import OnCheckBox from '../components/fields/checkbox.vue'
import OnRadioGroup from '../components/fields/radio_group.vue'
//import OnSelect from '../components/fields/select.vue'
import OnSelect from '../components/fields/extended_select.vue'
import OnLinkedText  from '../components/fields/LinkedText.vue';
import OnCaptcha from "../components/fields/onCaptcha.vue";
import DatePicker from "../components/fields/datepicker.vue";
import MaskedText from "../components/fields/textfield_masked.vue";
import ConditionRadio from "../components/layout/condition_radio.vue";
import ConditionCheckbox from "../components/layout/condition_checkbox.vue";
import ConditionalContent from "../components/layout/conditional_content.vue";

//import OnSelect from '../components/fields/extended_select_full.vue'

export const componentRenames = {
    'Honeypot': 'HP'
};

export default new ComponentsMapping({
    Text: OnTextfieldText,
    Email: OnTextfieldEmail,
    Number: OnTextfieldNumber,
    Password: OnTextfieldPassword,
    Honeypot: HiddenfieldHoneypot,
    GridRow: FormGridRow,
    Textarea: OnTextArea,
    Checkbox: OnCheckBox,
    LinkedCheckbox: OnCheckBox,
    RadioButton: OnRadioGroup,
    SingleSelect: OnSelect,
    EmailSingleSelect: OnSelect,
    Oncaptcha: OnCaptcha,
    LinkedText: OnLinkedText,
    DatePicker: DatePicker,
    MaskedText: MaskedText,
    ConditionRadio: ConditionRadio,
    ConditionCheckbox: ConditionCheckbox,
    ConditionalContent: ConditionalContent,
    form: 'form',
    message: 'div',
    default: 'input'
});