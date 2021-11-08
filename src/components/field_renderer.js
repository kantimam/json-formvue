import { componentRenames } from "../lib/DefaultComponents";

export default {
    props: {
        fieldData: {
            type: Object
        },
        formName: {
            type: String,
            required: true
        }
    },
    render: function(h){
        const componentsMap=this.$componentsDictionary;
        const globalProps=this.$globalDefaultProps;
        const element=componentsMap.get(this.fieldData.type);

        const propsAndAttributes={
            ...globalProps,
            ...this.fieldData,
            id: this.fieldData.identifier,
            formName: this.formName,  // this really needs to go
        }

        if (propsAndAttributes.type in componentRenames) propsAndAttributes.type = componentRenames[propsAndAttributes.type];

        if(element){
            return h(element, {
                attrs: propsAndAttributes, // to allow for HOC that do not specifically declare all props pass down everything as attrs too
                props: propsAndAttributes
            })
        }
       
    },
    
};