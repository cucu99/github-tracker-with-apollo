import React from 'react';
import { Mutation } from 'react-apollo';

import { WATCH_REPOSITORY } from '../../mutations';

import REPOSITORY_FRAGMENT from '../../fragments';

import Button from '../../../Button';

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED'
};

const isWatch = viewerSubscription =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const updateWatch = (
  client,
  {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription }
      }
    }
  }
) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });

  let { totalCount } = repository.watchers;
  totalCount =
    viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED
      ? totalCount + 1
      : totalCount - 1;

  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount
      }
    }
  });
};

const optimisticResponseWatch = (id, viewerSubscription) => {
  return {
    updateSubscription: {
      __typename: 'Mutation',
      subscribable: {
        __typename: 'Repository',
        id,
        viewerSubscription: isWatch(viewerSubscription)
          ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
          : VIEWER_SUBSCRIPTIONS.SUBSCRIBED
      }
    }
  };
};

const WatchRepository = ({ id, watchers, viewerSubscription }) => {
  return (
    <span>
      <Mutation
        mutation={WATCH_REPOSITORY}
        variables={{
          id,
          viewerSubscription: isWatch(viewerSubscription)
            ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
            : VIEWER_SUBSCRIPTIONS.SUBSCRIBED
        }}
        optimisticResponse={optimisticResponseWatch(id, viewerSubscription)}
        update={updateWatch}
      >
        {(updateSubscription, { data, loading, error }) => (
          <Button
            className={'RepositoryItem-title-action'}
            onClick={updateSubscription}
          >
            {watchers.totalCount}{' '}
            {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
          </Button>
        )}
      </Mutation>
    </span>
  );
};

export default WatchRepository;
