export function registerRequestModifier(handler: RequestModifier.Handler) {
    return RequestModifier.register(handler);
}

export namespace RequestModifier {
    const requestModifiers: Handler[] = [];

    export function register(handler: Handler) {
        requestModifiers.push(handler);
    }

    export function modifyRequest(context: any, formData: FormData) {
        for (const interceptor of requestModifiers)
            interceptor(context, formData);

        return false;
    }

    export type Handler = (context: any, formData: FormData) => void;
}

export default RequestModifier;
