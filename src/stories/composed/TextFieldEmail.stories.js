import {VTextField} from "vuetify/lib/components";
import OnTextFieldEmail from '@/components/fields/composed/textfield_email'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {createDummyEmailValidator, defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextFieldEmail',
    component: OnTextFieldEmail,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldEmail},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    ...defaultProps('Email Input', 'email-input', false, false),
    validators: [createDummyEmailValidator()]
};
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
const requiredArgs = defaultProps('Email Input', 'email-input', false, true);
requiredArgs.validators = [...requiredArgs.validators, createDummyEmailValidator()]
Required.args = requiredArgs;

