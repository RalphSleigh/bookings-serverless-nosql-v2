import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router';
import * as React from 'react';

import { userQueryOptions } from '../../queries/user';

export const Route = createFileRoute('/_user/user')({
  component: UserComponent,
});

function UserComponent() {
  const context = useRouteContext({ from: '/_user' });
  const { user } = context
  return (
    <div className="p-2">
      <h3>USER PAGE!</h3>
      <p>{user.sub}</p>
      <p>{user.name}</p>
      <p>{user.email}</p>
      <p>{user.isWoodcraft!.toString()}</p>
      <p>{user.isGroupAccount!.toString()}</p>
    </div>
  );
}
