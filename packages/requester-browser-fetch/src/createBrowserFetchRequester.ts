import { Request, Requester, Response } from '@algolia/requester-common';

export function createBrowserFetchRequester(): Requester {
  return {
    send(request: Request): Readonly<Promise<Response>> {
        let request_params: RequestInit = {
            headers: request.headers,
            method: request.method
        };

        let req = new Request(request.url,request_params);

        return fetch(req)
            .then(response => {
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
            }) as Promise<Response>;
    },
  };
}
