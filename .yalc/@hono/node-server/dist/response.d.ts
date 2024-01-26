declare const cacheKey: unique symbol;
declare const GlobalResponse: {
    new (body?: BodyInit | null | undefined, init?: ResponseInit | undefined): globalThis.Response;
    prototype: globalThis.Response;
    error(): globalThis.Response;
    json(data: any, init?: ResponseInit | undefined): globalThis.Response;
    redirect(url: string | URL, status?: number | undefined): globalThis.Response;
};
declare class Response {
    #private;
    private get cache();
    constructor(body?: BodyInit | null, init?: ResponseInit);
}

export { GlobalResponse, Response, cacheKey };
