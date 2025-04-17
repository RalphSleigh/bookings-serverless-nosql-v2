import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useContext } from 'react';

import { TEventSchemaWhenCreating } from '../../../shared/schemas/event';
import { SnackBarContext } from '../toasts';
import { useNavigate } from '@tanstack/react-router';
import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent';

export const createEventMuation = () => {
  const snackBar = useContext(SnackBarContext);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (event: TEventSchemaWhenCreating) => {
      return await axios.post<TCreateEventData>(`/api/event/create`, { event: event });
    },
    onSuccess: (data: AxiosResponse) => {
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
