import {VCheckbox} from "vuetify/lib/components";
import OnCheckboxBase from '@/components/fields/base/checkbox/checkbox';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

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
Default.args = defaultProps('Checkbox', 'checkbox', true, false);;

Default.storyName = 'Optional'
