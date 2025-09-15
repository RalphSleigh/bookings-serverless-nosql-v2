import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useContext } from 'react'

import { TCreateEventData } from '../../../lambda/endpoints/event/createEvent'
import { TEvent, TEventWhenCreating } from '../../../shared/schemas/event'
import { TBasicBig, TBookingForType } from '../../../shared/schemas/booking'
import { TCreateBookingData } from '../../../lambda/endpoints/booking/createBooking'
import { TCreateSheetForBooking } from '../../../lambda/endpoints/booking/createSheetForBooking'

export const cancelBooking = (eventId: string, userId:string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await axios.delete(`/api/event/${eventId}/booking/${userId}`)
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate({ to: '/' })
      notifications.show({
        title: 'Booking Cancelled',
        message: `Booking Cancelled`,
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
