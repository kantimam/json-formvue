export async function handleResponse(response){
    if(response.status===301) return handleRedirectResponse(response)
    if(response.status===200) return handleRedirectResponse(response)
    throw new Error("invalid status code")
}

export async function handleRedirectResponse(response){
    const json=await response.json();
    if(!json || !json.redirectUri) throw new Error('invalid json received for handeling a redirect response');
    window.location=json.redirectUri;
}

export async function handleJsonResponseWithHTMLContent(response){
    const json=await response.json();
    if(!json || !json.content) throw new Error('invalid json received for rendering HTML content');
    return json.content;
}