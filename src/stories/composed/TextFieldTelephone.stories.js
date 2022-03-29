import {VTextField} from "vuetify/lib/components";
import OnTextFieldTelephone from '@/components/fields/composed/textfield_telephone'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextFieldTelephone',
    component: OnTextFieldTelephone,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldTelephone},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Telephone Input', 'tel-input', false, false);
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Telephone Input', 'tel-input', false, true);

export const Masked = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
const maskProps = defaultProps('Telephone Input', 'tel-input', false, true);
maskProps.properties.pattern = '+{49}(000)000-00-00';
maskProps.properties.placeholder = '_';
Masked.args = maskProps;
