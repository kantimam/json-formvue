import {VTextField} from "vuetify/lib/components";
import OnTextarea from '@/components/fields/composed/textarea'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Composed/Textarea',
    component: OnTextarea,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextArea: OnTextarea},
    template: '<text-area v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Textarea', 'textarea', false, false);
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Textarea', 'textarea', false, true);

export const Counting = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Counting.args = {
    ...defaultProps('Textarea', 'textarea', false, true),
    counter: 200
};
