import {VTextField} from "vuetify/lib/components";

export default {
    title: 'Vuetify/VTextField',
    component: VTextField
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { VTextField },
    template: '<v-text-field v-bind="$props" />',
});

export const Filled = Template.bind({});
Filled.args = {
    label: 'Text Input',
    filled: true
};
