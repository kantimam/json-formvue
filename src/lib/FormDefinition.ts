export type FormDefinition = {
    action: string;
    api: FormApi;
    elements: ElementDefinition[];
    i18n: string;
    id: string;
    identifier: string;
}

export type FormApi = {
    status: 'success' | 'failure' | null;
    errors: string[] | null;
    callbacks: Callback<Record<string, any>>[];
    preprocess: string | null;
    actionAfterSuccess: unknown;
    page: PageDefinition;
}

export type Callback<Args> = {
    action: string,
    arguments?: Args
};

export type PageDefinition = {
    /** Current page number */
    current: number;
    /** Number of the next page, if there is any */
    nextPage: number | null;
    /** Total number of pages */
    pages: number;
    labels: Record<string, string>,
    errorHint: string;
    pageSummaryText: string | null,
    submitButtonAlignment?: 'left' | 'right';
}

export type ElementDefinition = {
    defaultValue?: string | null
    elements?: ElementDefinition[]
    identifier: string
    label: string
    name: string
    renderingOptions: Record<string, any>
    properties: Record<string, any>
    validators?: InputValidator[]
    type: string
}

export type InputValidator = {
    code: number
    errorMessage: string | number
    identifier: string
    options?: Record<string, any>
}
