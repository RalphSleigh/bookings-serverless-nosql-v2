import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { TCreateBookingData } from '../../../lambda/endpoints/booking/createBooking'
import { TBookingForType } from '../../../shared/schemas/booking'
import { TEvent } from '../../../shared/schemas/event'

export const createBookingMuation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ event, booking, min, max }: { event: TEvent; booking: TBookingForType; min: number; max: number }) => {
      return await axios.post<TCreateBookingData>(`/api/event/${event.eventId}/booking/create`, { booking, min, max })
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate({ to: '/' })
      notifications.show({
        title: 'Booking Created',
        message: `Booking Created`,
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
