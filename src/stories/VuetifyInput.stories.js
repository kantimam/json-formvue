import {VTextField} from "vuetify/lib/components";


// More on default export: https://storybook.js.org/docs/vue/writing-stories/introduction#default-export
export default {
    title: 'Vuetify/VTextField',
    component: VTextField,
    // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
    argTypes: {

    },
};

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { VTextField },
    template: '<v-text-field v-bind="$props" />',
});

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/vue/writing-stories/args
Default.args = {
    label: 'Text Input',
};

export const Filled = Template.bind({});
Filled.args = {
    label: 'Text Input',
    filled: true
};
