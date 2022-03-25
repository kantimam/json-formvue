import {VSelect} from "vuetify/lib/components";
import OnSelectBase from '@/components/fields/base/select/select';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import '../_global.scss';
import {defaultProps} from "@/stories/helper"; // global storybook styles

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-select', VSelect)

export default {
    title: 'Formvue/Base/Select',
    component: OnSelectBase,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {OnSelect: OnSelectBase},
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
    ...defaultProps('Select', 'select', true, false),
    properties: selectProps
};
Default.storyName = 'Optional'

export const Required = Template.bind({});
Required.args  = {
    ...defaultProps('Select', 'select', true, true),
    properties: selectProps
};
