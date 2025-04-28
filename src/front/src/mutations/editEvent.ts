import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TEditEventData } from '../../../lambda/endpoints/event/editEvent'
import { TEvent } from '../../../shared/schemas/event'

export const editEventMuation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: TEvent) => {
      return await axios.post<TEditEventData>(`/api/event/${event.eventId}/edit`, { event: event })
    },
    onSuccess: (data: AxiosResponse) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate({ to: '/' })
      notifications.show({
        title: 'Event updated',
        message: `Event updated`,
        color: 'green',
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        notifications.show({
          title: 'Error',
          message: `Error: ${error.response?.data?.message || 'Unknown error'}`,
          color: 'red',
        })
      } else {
        notifications.show({
          title: 'Error',
          message: `Error: ${error.message || 'Unknown error'}`,
          color: 'red',
        })
      }
    },
  })
}
