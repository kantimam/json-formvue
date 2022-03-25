import {VCheckbox} from "vuetify/lib/components";
import OnCheckbox from '@/components/fields/base/checkbox/checkbox';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-checkbox', VCheckbox)

export default {
    title: 'Formvue/Base/Checkbox',
    component: OnCheckbox,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnCheckbox: OnCheckbox},
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
Default.storyName = 'Default (optional)'
