
import InternalTextField from "../components/fields/extended_text_field";
import Vue from "vue";
import {VTextField} from "vuetify/lib/components";

Vue.component('v-text-field', VTextField)

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
    title: 'Formvue/TextField',
    component: InternalTextField,
    // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
    argTypes: {

    },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { InternalTextField },
    template: '<internal-text-field v-bind="$props" />',
});

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Default.args = {
    label: 'TextInput',
    id: 'test',
    properties: {},
    name: 'test',


};



