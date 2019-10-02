import { Request, Requester, Response } from '@algolia/requester-types';

export class BrowserXhrRequester implements Requester {
  public send(request: Request): Promise<Response> {
    return new Promise((resolve): void => {
      const baseRequester = new XMLHttpRequest();
      baseRequester.open(request.method, request.url, true);

      const timeoutHandler = setTimeout(() => {
        baseRequester.abort();
        resolve({ status: 0, content: '', isTimedOut: true });
      }, request.timeout * 1000);

      // eslint-disable-next-line functional/immutable-data
      baseRequester.onerror = () => {
        // istanbul ignore next
        if (baseRequester.status === 0) {
          clearTimeout(timeoutHandler);

          resolve({
            content: baseRequester.responseText || 'Network request failed',
            status: baseRequester.status,
            isTimedOut: false,
          });
        }
      };

      //  eslint-disable-next-line functional/immutable-data
      baseRequester.onload = () => {
        clearTimeout(timeoutHandler);

        resolve({
          content: baseRequester.responseText,
          status: baseRequester.status,
          isTimedOut: false,
        });
      };

      Object.keys(request.headers).forEach(key =>
        baseRequester.setRequestHeader(key, request.headers[key])
      );

      baseRequester.send(request.data);
    });
  }
}