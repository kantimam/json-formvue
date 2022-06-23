import {VTextField,VDatePicker,VMenu} from "vuetify/lib/components";
import OnDatePicker from '@/components/fields/composed/datepicker.vue';
import Vue from "vue";
import Vuetify from 'vuetify/lib/framework';
import {defaultProps, createDummyValidator} from "@/stories/helper";
import {createDummyRequiredValidator} from "../helper";

Vue.use(Vuetify);
const vuetify = new Vuetify({});

Vue.component('v-text-field', VTextField)
Vue.component('v-date-picker', VDatePicker)
Vue.component('v-menu', VMenu)

export default {
    title: 'Formvue/Composed/DatePicker',
    component: OnDatePicker,
};

const Template = (args, {argTypes}) => ({
    props: Object.keys(argTypes),
    vuetify: vuetify,
    components: {DatePicker: OnDatePicker},
    template: '<date-picker v-bind="$props" />',
    provide() {
        return {
            validatorsMap: {}
        }
    }
});

export const Default = Template.bind({});

let defProps = defaultProps('DatePicker', 'datepicker', false, false);
defProps.properties.maskPattern = 'd.m.y'
defProps.properties.placeholder = '_'
defProps.properties.enableMask = true;

Default.args = defProps;
Default.storyName = 'Optional'

export const Required = Template.bind({});

let requiredProps = defaultProps('DatePicker', 'datepicker', false, true);
requiredProps.properties.maskPattern = 'd.m.y'
requiredProps.properties.placeholder = '_'
requiredProps.properties.enableMask = true;
requiredProps.validators = [createDummyRequiredValidator(), createDummyValidator('MaskComplete', 'Please complete your input')];

Required.args = requiredProps;

export const Max = Template.bind({});

let maxProps = defaultProps('DatePicker', 'datepicker', false, true);
maxProps.properties.maskPattern = 'd.m.y'
maxProps.properties.placeholder = '_'
maxProps.properties.enableMask = true;
maxProps.properties.fluidAdditionalAttributes = {
    ...(maxProps.properties.fluidAdditionalAttributes || {}),
    maxDate: 'today-18Y'
}
maxProps.validators = [...maxProps.validators, {
    ...createDummyValidator('DateInterval', 'You must be at least 18 years old'),
    options: {
        minDate: '',
        maxDate: 'today-18Y'
    }
}];

Max.args = maxProps;


