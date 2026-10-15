import { type ErrorLike } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getErrorMessageFromApolloError = (error: ErrorLike): string => {
  if (!CombinedGraphQLErrors.is(error)) {
    if (
      ['Failed to fetch', 'Network request failed', 'Load failed'].includes(
        error.message,
      )
    ) {
      return t`Could not connect to the server. Check your connection and try again.`;
    }
    return (
      error.message ??
      t`The request could not be completed. Try again or contact your workspace administrator.`
    );
  }

  const userFriendlyMessage = error.errors?.[0]?.extensions
    ?.userFriendlyMessage as Nullable<MessageDescriptor | string>;

  if (!isDefined(userFriendlyMessage)) {
    return t`The request could not be completed. Try again or contact your workspace administrator.`;
  }

  if (typeof userFriendlyMessage === 'object' && 'id' in userFriendlyMessage) {
    return t(userFriendlyMessage);
  }

  return userFriendlyMessage;
};
