import {VSelect} from "vuetify/lib/components";
import OnSelect from '@/components/fields/composed/select'
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps} from "@/stories/helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-select', VSelect)

export default {
    title: 'Formvue/Composed/Select',
    component: OnSelect,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnSelect: OnSelect},
    template: '<on-select v-bind="$props" />',
});

const selectProps = {
    options: {
        apple: 'Apple',
        banana: 'Banana'
    },
}

export const Default = Template.bind({});
Default.args = {
    ...defaultProps('Select', 'select', false, false),
    properties: selectProps
};
Default.storyName = 'Optional'

export const Required = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Required.args = {
    ...defaultProps('Select', 'select', false, true),
    properties: selectProps
};
