import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEvent, TEventWhenCreating } from '../../../shared/schemas/event'
import { TBookingForType } from '../../../shared/schemas/booking'
import { TCreateBookingData } from '../../../lambda/endpoints/booking/createBooking'
import { TApplication, TApplicationForForm } from '../../../shared/schemas/application'
import { TCreateApplicationData } from '../../../lambda/endpoints/application/createApplicationEndpoint'

export const createApplicationMuation = (event: TEvent) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (application: TApplicationForForm) => {
      return await axios.post<TCreateApplicationData>(`/api/event/${event.eventId}/application/create`, { application })
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate({ to: '/' })
      notifications.show({
        title: 'Application Created',
        message: `Application Created`,
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
