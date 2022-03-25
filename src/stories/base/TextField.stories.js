import {VTextField} from "vuetify/lib/components";
import OnTextFieldBase from "../../components/fields/base/textfield/textfield.vue";
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {createInputRules} from "@/lib/util.ts";
import {createDummyRequiredValidator} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Base/TextField',
    component: OnTextFieldBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldBase},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Text Input',
    identifier: 'text-input',
    filled: true,
    properties: {},
    name: 'text-input',
    optional: true
};
Default.storyName = 'Default (optional)'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = {
    label: 'Text Input',
    identifier: 'text-input',
    filled: true,
    properties: {},
    name: 'text-input',
    required: true,
    rules: createInputRules(true, [createDummyRequiredValidator()], {}, true, []),
    requiredLabel: 'This field is required'
};
