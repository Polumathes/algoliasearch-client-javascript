import { Request, Requester, Response } from '@algolia/requester-common';

export function createBrowserFetchRequester(): Requester {
  return {
    async send(request: Request): Promise<Response> {
        request.body = request.data;

        let req = new Request(request.url, request);

        let response = await fetch(req);
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        let response_text = await response.text();
        return {
            content: response_text,
            status: response.status,
            isTimedOut: false,
        };
    },
  };
}
