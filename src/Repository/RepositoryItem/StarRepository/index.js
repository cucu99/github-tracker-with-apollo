import React from 'react';
import { Mutation } from 'react-apollo';

import { STAR_REPOSITORY, UNSTAR_REPOSITORY } from '../../mutations';

import REPOSITORY_FRAGMENT from '../../fragments';

import Button from '../../../Button';

const updateAddStar = (
  client,
  {
    data: {
      addStar: {
        starrable: { id, viewerHasStarred }
      }
    }
  }
) =>
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarData(client, id, viewerHasStarred)
  });

const updateRemoveStar = (
  client,
  {
    data: {
      removeStar: {
        starrable: { id, viewerHasStarred }
      }
    }
  }
) =>
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarData(client, id, viewerHasStarred)
  });

const getUpdatedStarData = (client, id, viewerHasStarred) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });

  let { totalCount } = repository.stargazers;
  totalCount = viewerHasStarred ? totalCount + 1 : totalCount - 1;

  return {
    ...repository,
    stargazers: {
      ...repository.stargazers,
      totalCount
    }
  };
};

const optimisticResponseAddStar = (id, viewerHasStarred) => {
  return {
    addStar: {
      __typename: 'Mutation',
      starrable: {
        __typename: 'Repository',
        id,
        viewerHasStarred: !viewerHasStarred
      }
    }
  };
};

const optimisticResponseRemoveStar = (id, viewerHasStarred) => {
  return {
    removeStar: {
      __typename: 'Mutation',
      starrable: {
        __typename: 'Repository',
        id,
        viewerHasStarred: !viewerHasStarred
      }
    }
  };
};

const StarRepository = ({ id, stargazers, viewerHasStarred }) => (
  <span>
    {!viewerHasStarred ? (
      <Mutation
        mutation={STAR_REPOSITORY}
        variables={{ id }}
        optimisticResponse={optimisticResponseAddStar(id, viewerHasStarred)}
        update={updateAddStar}
      >
        {(addStar, { data, loading, error }) => (
          <Button className={'RepositoryItem-title-action'} onClick={addStar}>
            {stargazers.totalCount} Star
          </Button>
        )}
      </Mutation>
    ) : (
      <Mutation
        mutation={UNSTAR_REPOSITORY}
        variables={{ id }}
        optimisticResponse={optimisticResponseRemoveStar(id, viewerHasStarred)}
        update={updateRemoveStar}
      >
        {(removeStar, { data, loading, error }) => (
          <Button
            className={'RepositoryItem-title-action'}
            onClick={removeStar}
          >
            {stargazers.totalCount} UnStar
          </Button>
        )}
      </Mutation>
    )}
  </span>
);

export default StarRepository;
