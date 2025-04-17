import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
} from '@tanstack/react-router';
import * as React from 'react';

import { testUserLoggedInOptions } from '../../queries/testLoggedin';

export const Route = createFileRoute('/_user/testLoggedIn')({
  component: UserComponent,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(testUserLoggedInOptions);
  },
});

function UserComponent() {
  const result = useSuspenseQuery(testUserLoggedInOptions);
  return (
    <div className="p-2">
      <p>{JSON.stringify(result)}</p>
    </div>
  );
}
