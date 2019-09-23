import { BrowserXhrRequester } from '../../..';
import mock, { MockRequest, MockResponse } from 'xhr-mock';
import { Method } from '@algolia/requester-types';
import Fixtures from '../Fixtures';

describe('status code handling', (): void => {
  beforeEach(() => mock.setup());
  afterEach(() => mock.teardown());

  it('sends requests', async () => {
    const requester = new BrowserXhrRequester();
    const request = Fixtures.request();

    expect.assertions(5);

    mock.post(
      'https://algolia-dns.net/foo',
      (req: MockRequest, res: MockResponse): MockResponse => {
        expect(req.method()).toEqual('POST');

        expect(req.header('X-Algolia-Application-Id')).toEqual('ABCDE');
        expect(req.header('X-Algolia-API-Key')).toEqual('12345');
        expect(req.header('Content-Type')).toEqual('application/json');

        expect(req.body()).toEqual(JSON.stringify({ foo: 'bar' }));

        return res.status(200);
      }
    );

    await requester.send(request);
  });

  it('resolves status 200', async () => {
    const requester = new BrowserXhrRequester();
    const body = JSON.stringify({ foo: 'bar' });

    mock.post('https://algolia-dns.net/foo', {
      status: 200,
      body,
    });

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(200);
    expect(response.content).toBe(body);
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves status 300', async () => {
    const requester = new BrowserXhrRequester();
    const reason = 'Multiple Choices';

    mock.post('https://algolia-dns.net/foo', {
      status: 300,
      reason,
    });

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(300);
    expect(response.content).toBe(''); // No body returned here on xhr
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves status 400', async () => {
    const requester = new BrowserXhrRequester();

    const body = { message: 'Invalid Application-Id or API-Key' };

    mock.post('https://algolia-dns.net/foo', {
      status: 400,
      body: JSON.stringify(body),
    });

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(400);
    expect(response.content).toBe(JSON.stringify(body));
    expect(response.isTimedOut).toBe(false);
  });

  it('timouts if response dont appears before the timeout', async () => {
    const requester = new BrowserXhrRequester();

    mock.post(
      'https://algolia-dns.net/foo',
      () => new Promise(resolve => setTimeout(() => resolve(), 2100))
    );

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(0);
    expect(response.content).toBe('');
    expect(response.isTimedOut).toBe(true);
  });

  it('do not timouts if response appears before the timeout', async () => {
    const requester = new BrowserXhrRequester();

    const res: MockResponse = new MockResponse();

    // @ts-ignore
    res._status = 200;

    // @ts-ignore
    res._body = '';

    mock.post(
      'https://algolia-dns.net/foo',
      () => new Promise(resolve => setTimeout(() => resolve(res), 1900))
    );

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(200);
    expect(response.content).toBe('');
    expect(response.isTimedOut).toBe(false);
  });
});

describe('error handling', (): void => {
  it('resolves dns not found', async () => {
    const requester = new BrowserXhrRequester();

    const request = {
      url: 'https://this-dont-exist.algolia.com',
      method: Method.Post,
      headers: {
        'X-Algolia-Application-Id': 'ABCDE',
        'X-Algolia-API-Key': '12345',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ foo: 'bar' }),
      timeout: 2,
    };

    const response = await requester.send(request);

    expect(response.status).toBe(0);
    expect(response.content).toBe('Network request failed');
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves general network errors', async () => {
    const requester = new BrowserXhrRequester();

    mock.post('https://algolia-dns.net/foo', () =>
      Promise.reject(new Error('This is a general error'))
    );

    const response = await requester.send(Fixtures.request());

    expect(response.status).toBe(0);
    expect(response.content).toBe('Network request failed');
    expect(response.isTimedOut).toBe(false);
  });
});
