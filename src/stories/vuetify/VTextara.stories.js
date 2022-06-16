import {VTextarea} from "vuetify/lib/components";

export default {
    title: 'Vuetify/VTextarea',
    component: VTextarea
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { VTextarea },
    template: '<v-textarea v-bind="$props" />',
});

export const Filled = Template.bind({});
Filled.args = {
    label: 'Textarea',
    filled: true
};

export const Counting = Template.bind({});
Counting.args = {
    label: 'Textarea',
    filled: true,
    counter: 200
};
