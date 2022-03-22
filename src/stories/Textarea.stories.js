import {VTextarea} from "vuetify/lib/components";
import OnTextarea from '@/components/fields/textarea/textarea';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {createInputRules} from "../lib/util";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-textarea', VTextarea)

export default {
    title: 'Formvue/Textarea',
    component: OnTextarea,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnTextarea: OnTextarea},
    template: '<on-textarea v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Textarea',
    identifier: 'textarea',
    filled: true,
    properties: {},
    name: 'textarea',
    optional: true
};
Default.storyName = 'Default (optional)'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = {
    label: 'Textarea',
    identifier: 'textarea',
    filled: true,
    properties: {},
    name: 'textarea',
    required: true,
    rules: createInputRules(true, [createDummyRequiredValidator()], {}, true, []),
    requiredLabel: 'This field is required'
};

export const Counting = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Counting.args = {
    label: 'Textarea',
    identifier: 'textarea',
    filled: true,
    properties: {},
    name: 'textarea',
    maxLength: 200
};

function createDummyRequiredValidator() {
    return {
        identifier: 'NotEmpty',
        code: 1221560910,
        errorMessage: 'This field is required'
    };
}
