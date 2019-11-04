import { createAuth } from '@algolia/client-common/createAuth';
import { compose, shuffle } from '@algolia/client-common/helpers';
import { AuthMode, AuthModeType } from '@algolia/client-common/types/AuthModeType';
import { ComposableOptions } from '@algolia/client-common/types/ComposableOptions';
import { createTransporter } from '@algolia/transporter/createTransporter';
import { CallEnum } from '@algolia/transporter/types/CallType';
import { TransporterOptions } from '@algolia/transporter/types/TransporterOptions';

import { SearchClient } from './types/SearchClient';

export const createSearchClient = <TClient>(
  options: SearchClientOptions & TransporterOptions & ComposableOptions
): SearchClient & TClient => {
  const appId = options.appId;
  const transporter = createTransporter(options);
  transporter.setHosts(
    [
      { url: `${appId}-dsn.algolia.net`, accept: CallEnum.Read },
      { url: `${appId}.algolia.net`, accept: CallEnum.Write },
    ].concat(
      shuffle([
        { url: `${appId}-1.algolianet.com`, accept: CallEnum.Any },
        { url: `${appId}-2.algolianet.com`, accept: CallEnum.Any },
        { url: `${appId}-3.algolianet.com`, accept: CallEnum.Any },
      ])
    )
  );

  const auth = createAuth(
    options.authMode !== undefined ? options.authMode : AuthMode.WithinHeaders,
    appId,
    options.apiKey
  );

  transporter.addHeaders({
    ...auth.headers(),
    ...{ 'content-type': 'application/x-www-form-urlencoded' },
  });

  transporter.addQueryParameters(auth.queryParameters());

  const base = {
    transporter,
    appId,
    addAlgoliaAgent(segment: string, version?: string): void {
      transporter.addUserAgent(segment, version);
    },
  };

  return compose<SearchClient & TClient>(
    base,
    options
  );
};

export type SearchClientOptions = {
  readonly appId: string;
  readonly apiKey: string;
  readonly authMode?: AuthModeType;
};