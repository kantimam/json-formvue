export function registerResponseInterceptor(handler: ResponseInterceptor.Handler) {
    return ResponseInterceptor.register(handler);
}

export namespace ResponseInterceptor {
    const responseInterceptors: Handler[] = [];

    export function register(handler: Handler) {
        responseInterceptors.push(handler);
    }

    export async function handleResponse(context: any, successJson: string) {
        for (const interceptor of responseInterceptors)
            if (await interceptor(context, successJson))
                return true;

        return false;
    }

    export type Handler = (context: any, successJson: string) => Promise<boolean>;
}

export default ResponseInterceptor;
