import ComponentsMapping from "./ComponentsMapping";

import OnTextfieldText from "../components/fields/textfield_text.vue";
import OnTextfieldEmail from "../components/fields/textfield_email.vue";
import OnTextfieldNumber from "../components/fields/textfield_number.vue";
import OnTextfieldPassword from "../components/fields/textfield_password.vue";
import HiddenfieldHoneypot from "../components/fields/hiddenfield_honeypot.vue";
import FormGridRow from "../components/layout/form_grid_row.vue";
import OnTextArea from '../components/fields/textarea.vue'
import OnCheckBox from '../components/fields/checkbox.vue'
import OnRadioGroup from '../components/fields/radio_group.vue'
import OnSelect from '../components/fields/select.vue'


export default new ComponentsMapping({
    Text: OnTextfieldText,
    Email: OnTextfieldEmail,
    Number: OnTextfieldNumber,
    Password: OnTextfieldPassword,
    Honeypot: HiddenfieldHoneypot,
    GridRow: FormGridRow,
    Textarea: OnTextArea,
    Checkbox: OnCheckBox,
    RadioButton: OnRadioGroup,
    SingleSelect: OnSelect,
    form: 'form',
    message: 'div',
    default: 'input'
});