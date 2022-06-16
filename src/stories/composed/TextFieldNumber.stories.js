import {VTextField} from "vuetify/lib/components";
import OnTextFieldNumber from '@/components/fields/composed/textfield_number'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextFieldNumber',
    component: OnTextFieldNumber,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldNumber},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Number Input', 'number-input', false, false);
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Number Input', 'number-input', false, true);

