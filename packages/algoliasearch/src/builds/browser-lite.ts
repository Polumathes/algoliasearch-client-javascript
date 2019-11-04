import { createBrowserLocalStorageCache } from '@algolia/cache-browser-local-storage/createBrowserLocalStorageCache';
import { createInMemoryCache } from '@algolia/cache-in-memory/createInMemoryCache';
import { AuthMode } from '@algolia/client-common/types/AuthModeType';
import { LogLevelEnum } from '@algolia/logger-common/types/LogLevelType';
import { createConsoleLogger } from '@algolia/logger-console/createConsoleLogger';
import { createBrowserXhrRequester } from '@algolia/requester-browser-xhr/createBrowserXhrRequester';
import { createUserAgent } from '@algolia/transporter/createUserAgent';

import { createSearchClient, SearchClient } from '../presets/lite';
import { AlgoliaSearchOptions } from '../types/AlgoliaSearchOptions';

export default function algoliasearch(
  appId: string,
  apiKey: string,
  options: AlgoliaSearchOptions = {}
): SearchClient {
  return createSearchClient({
    appId,
    apiKey,
    requester: createBrowserXhrRequester(),
    timeouts: {
      read: 1,
      write: 30,
    },
    logger: createConsoleLogger(
      options.logLevel === undefined ? LogLevelEnum.Error : options.logLevel
    ),
    responsesCache: createInMemoryCache(),
    requestsCache: createInMemoryCache(),
    hostsCache: createBrowserLocalStorageCache(),
    userAgent: createUserAgent('4.0.0-alpha.0').with({ segment: 'Browser', version: 'lite' }),
    authMode: AuthMode.WithinQueryParameters,
  });
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, functional/immutable-data
(<any>window).algoliasearch = algoliasearch;