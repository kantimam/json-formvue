import {VTextField} from "vuetify/lib/components";
import OnTextFieldPassword from '@/components/fields/composed/textfield_password'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextFieldPassword',
    component: OnTextFieldPassword,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldPassword},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Password Input', 'password-input', false, false);
Default.storyName = 'Default (optional)'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Password Input', 'password-input', false, true);

