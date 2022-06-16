export type FormWrapper = {
    configuration: FormDefinition;
}

export type FormDefinition = {
    action: string;
    api: FormApi;
    elements: ElementDefinition[];
    i18n: string;
    id: string;
    identifier: string;
}

export type FormErrors = string[];

export type FormApi = {
    status: 'success' | 'failure' | null;
    errors: FormErrors | string | null;
    callbacks: CallbackDefinition<Record<string, any>>[];
    preprocess: string[] | null;
    actionAfterSuccess: unknown;
    page: PageDefinition;
    pageDefinitions: PageReference[]
}

export type CallbackDefinition<Args> = {
    action: string,
    arguments?: Args
};

export type PageReference = {
    identifier: string,
    index: number,
    label: string
};

export type PageDefinition = {
    /** Current page number */
    current: number;
    errorHint: string;
    /** Number of the next page, if there is any */
    nextPage: number | null;
    /** Total number of pages */
    pages: number;
    label: string,
    labels: Record<string, string>,
    pageSummaryText: string | null,
    submitButtonAlignment?: 'left' | 'right';
}

export type ElementDefinition = {
    defaultValue?: any,
    elements?: ElementDefinition[]
    identifier: string
    label: string
    name: string
    renderingOptions?: ElementRenderingOptions
    properties: ElementProperties
    validators?: InputValidator[]
    type: string
}

export type ElementRenderingOptions = Record<string, any>;
export type ElementProperties = Record<string, any> & CommonElementProperties;

export type CommonElementProperties = {
    fluidAdditionalAttributes?: FluidAdditionalProperties
}

export type FluidAdditionalProperties = {
    required?: 'required',
    minlength?: string | number,
    maxlength?: string | number,
    placeholder?: string
}

export type InputValidator = {
    code: number
    errorMessage: string
    identifier: string
    options?: Record<string, any>
}

export function isFormDefinition(obj: any): obj is FormDefinition {
    return 'api' in obj;
}
