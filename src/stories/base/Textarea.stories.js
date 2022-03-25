import {VTextarea} from "vuetify/lib/components";
import OnTextareaBase from '@/components/fields/base/textarea/textarea';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-textarea', VTextarea)

export default {
    title: 'Formvue/Base/Textarea',
    component: OnTextareaBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnTextarea: OnTextareaBase},
    template: '<on-textarea v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = defaultProps('Textarea', 'textarea', true, false);
Default.storyName = 'Default (optional)'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = defaultProps('Textarea', 'textarea', true, true);

export const Counting = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Counting.args = {
    ...defaultProps('Textarea', 'textarea', true, true),
    maxLength: 200
};
