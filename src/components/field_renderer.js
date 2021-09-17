



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
        const element=componentsMap.get(this.fieldData.type);

        const propsAndAttributes={
            ...this.fieldData,
            id: this.fieldData.identifier,
            formName: this.formName,  // this really needs to go
        }

        if(element){
            return h(element, {
                attrs: propsAndAttributes, // to allow for HOC that do not specifically declare all props pass down everything as attrs too
                props: propsAndAttributes
            })
        }
       
    },
    
};