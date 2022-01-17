const responseInterceptors = [];

export function registerResponseInterceptor(interceptor) {
    responseInterceptors.push(interceptor);
}

export async function handleResponse(context, successJson) {
    for (const interceptor of responseInterceptors)
        if (await interceptor(context, successJson))
            return true;

    return false;
}
