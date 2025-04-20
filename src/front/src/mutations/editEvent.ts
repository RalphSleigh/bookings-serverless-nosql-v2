import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useContext } from 'react';

import { TEvent,  } from '../../../shared/schemas/event';
import { SnackBarContext } from '../toasts';
import { useNavigate } from '@tanstack/react-router';
import { TEditEventData } from '../../../lambda/endpoints/event/editEvent';

export const editEventMuation = () => {
  const snackBar = useContext(SnackBarContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: TEvent) => {
      return await axios.post<TEditEventData>(`/api/event/${event.eventId}/edit`, { event: event });
    },
    onSuccess: (data: AxiosResponse) => {
        queryClient.invalidateQueries({queryKey: ['events']})
        navigate({to: '/'});
    },
    onError: (error) => {
      if(error instanceof AxiosError) {
      snackBar({
        message: `Error: ${error.response?.data?.message || 'Unknown error'}`,
        severity: 'error',
      });
    } else {
        snackBar({
            message: `Error: ${error.message || 'Unknown error'}`,
            severity: 'error',
        });
    }
    },
  });
};
