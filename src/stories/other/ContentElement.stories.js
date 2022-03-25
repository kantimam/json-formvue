import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {ContentElement} from "@/main.ts";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

export default {
    title: 'Formvue/Other/ContentElement',
    component: ContentElement,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {ContentElement: ContentElement},
    template: '<content-element v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
    label: 'Arbitrary Content',
    identifier: 'content',
    properties: {
        content: `<div><h1>Hello World</h1><p>This can be any arbitrary <b>HTML</b> content.</p></div>`
    },
    name: 'content'
};
Default.storyName = 'Default'
