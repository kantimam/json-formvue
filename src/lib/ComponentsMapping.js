

export default class ComponentsMapping {
    constructor(initialComponents={}){
        this._components=initialComponents;
    }

    set(kind, component){
        this._components[kind]=component;
    }


    get(kind){
        return this._components[kind]
    }
}