
import TextField from "../components/fields/textfield.vue";
import Vue from "vue";
import {VTextField} from "vuetify/lib/components";
import Vuetify from 'vuetify/lib/framework';


Vue.use(Vuetify);
const vuetify=new Vuetify({})


Vue.component('v-text-field', VTextField)

// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
    title: 'Formvue/TextField',
    component: TextField,
    // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
    argTypes: {

    },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: { TextField },
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Default.args = {
    label: 'TextInput',
    id: 'test',
    properties: {},
    name: 'test',

};

export const WithName = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
WithName.args = {
    label: 'With Name',
    id: 'test',
    properties: {},
    name: 'test',

};

