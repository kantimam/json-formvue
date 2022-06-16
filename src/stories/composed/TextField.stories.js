import {VTextField} from "vuetify/lib/components";
import OnTextField from '@/components/fields/composed/textfield'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/TextField',
    component: OnTextField,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextField},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Text Input', 'text-input', false, false);
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Text Input', 'text-input', false, true);

export const Counter = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Counter.args = {
    ...defaultProps('Text Input', 'text-input', false, true),
    counter: 64
}
