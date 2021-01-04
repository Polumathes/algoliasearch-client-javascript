import { Request, Requester, Response } from '@algolia/requester-common';

export function createBrowserFetchRequester(): Requester {
  return {
    async send(request: Request): Promise<Response> {
        let request_params: RequestInit = {
            headers: request.headers,
            method: request.method
        };
        console.log(request.method);
        console.log(request.url);
        let req = new Request(request.url,request_params);

        let response = await fetch(req);

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        return new Promise( (resolve): void => {
            response.text().then(text => {
                return {
                    content: response.text(),
                    status: response.status,
                    isTimedOut: false,
                }
            });
        });
    },
  };
}
