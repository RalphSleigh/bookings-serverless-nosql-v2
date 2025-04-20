import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { EventForm } from '../../../components/event-form/form';
import { createEventMuation } from '../../../mutations/createEvent';

export const Route = createFileRoute('/_user/events/new')({
  component: CreateEventComponent,
});

function CreateEventComponent() {
  return <EventForm mode="create" inputData={{}} mutation={createEventMuation()}/>;
}
