import {VCheckbox} from "vuetify/lib/components";
import OnCheckboxBase from '@/components/fields/base/checkbox/checkbox';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-checkbox', VCheckbox)

export default {
    title: 'Formvue/Base/Checkbox',
    component: OnCheckboxBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnCheckbox: OnCheckboxBase},
    template: '<on-checkbox v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Checkbox',
    identifier: 'checkbox',
    filled: true,
    properties: {},
    name: 'checkbox',
    optional: true
};
Default.storyName = 'Optional'
