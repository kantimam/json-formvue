import {VSelect} from "vuetify/lib/components";
import OnSelectBase from '@/components/fields/base/select/select';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {createInputRules} from "@/lib/util.ts";
import '../_global.scss'; // global storybook styles

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-select', VSelect)

export default {
    title: 'Formvue/Base/Select',
    component: OnSelectBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnSelect: OnSelectBase},
    template: '<on-select v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Select',
    identifier: 'select',
    filled: true,
    properties: {
        options: {
            apple: 'Apple',
            banana: 'Banana'
        },
    },
    name: 'select',
    optional: true
};
Default.storyName = 'Default (optional)'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = {
    label: 'Select',
    identifier: 'select',
    filled: true,
    properties: {
        options: {
            apple: 'Apple',
            banana: 'Banana'
        },
    },
    name: 'select',
    required: true,
    rules: createInputRules(true, [createDummyRequiredValidator()], {}, true, []),
    requiredLabel: 'This field is required',
};

function createDummyRequiredValidator() {
    return {
        identifier: 'NotEmpty',
        code: 1221560910,
        errorMessage: 'This field is required'
    };
}
