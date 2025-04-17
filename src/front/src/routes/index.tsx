import { Add } from '@mui/icons-material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router';
import * as React from 'react';

import { Can } from '../permissionContext';
import { envQueryOptions } from '../queries/env';
import { MUILink } from '../utils';
import Fab from '@mui/material/Fab';
import { getEventsQueryOptions } from '../queries/getEvents';
import { EventList } from '../components/eventList';

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const eventsQuery = useSuspenseQuery(getEventsQueryOptions);
  const fabStyle = {
    float: 'right',
    mb: 2,
    mr: 2,
  };

  return (
    <>
      <EventList events={eventsQuery.data.events} />
      <Can I="create" a="event">
        <Link to="/events/new">
          <Fab sx={fabStyle} size="small" color="secondary" aria-label="add">
            <Add />
          </Fab>
        </Link>
      </Can>
    </>
  );
}
