import {VSelect} from "vuetify/lib/components";

export default {
    title: 'Vuetify/VSelect',
    component: VSelect
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { VSelect },
    template: '<v-select v-bind="$props" />',
});

export const Filled = Template.bind({});
Filled.args = {
    label: 'Select',
    items: [
        'Apple',
        'Banana'
    ],
    filled: true
};
