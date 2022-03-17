import {VTextField} from "vuetify/lib/components";
import TextField from "../components/fields/textfield/textfield.vue";
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/TextField',
    component: TextField,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Text Input',
    identifier: 'text-input',
    filled: true,
    properties: {},
    name: 'text-input'
};

export const WithName = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
WithName.args = {
    label: 'With Name',
    id: 'test',
    properties: {},
    name: 'test',

};

