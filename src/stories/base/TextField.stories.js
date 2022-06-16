import {VTextField} from "vuetify/lib/components";
import OnTextFieldBase from "../../components/fields/base/textfield/textfield.vue";
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)

export default {
    title: 'Formvue/Base/TextField',
    component: OnTextFieldBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {TextField: OnTextFieldBase},
    template: '<text-field v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Text Input', 'text-input', true, false);
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Text Input', 'text-input', true, true);

export const Counting = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Counting.args = {
    ...defaultProps('Text Input', 'text-input', true, true),
    counter: 64
};
