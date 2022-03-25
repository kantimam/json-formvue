import {VCheckbox} from "vuetify/lib/components";
import OnCheckbox from '@/components/fields/composed/extended_checkbox/checkbox';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-checkbox', VCheckbox)

export default {
    title: 'Formvue/Composed/Checkbox',
    component: OnCheckbox,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnCheckbox: OnCheckbox},
    template: '<on-checkbox v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Checkbox', 'checkbox', false, false);
Default.storyName = 'Optional'
