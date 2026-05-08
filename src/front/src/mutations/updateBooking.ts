import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { TUpdateBookingData } from '../../../lambda/endpoints/booking/updateBooking'
import { TBookingForType } from '../../../shared/schemas/booking'
import { TEvent } from '../../../shared/schemas/event'

type TOk = {
  ok: "ok"
}

export const updateBookingMuation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ event, booking, min, max, notify }: { event: TEvent; booking: TBookingForType; min: number; max: number; notify: boolean }) => {
      return await axios.post<TOk, AxiosResponse<TOk>, TUpdateBookingData>(`/api/event/${event.eventId}/booking/update`, { booking, min, max, notify })
    },
    onSuccess: (data: AxiosResponse<TOk>, context) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      navigate({ to: '/' })
      notifications.show({
        title: 'Booking Updated',
        message: `Booking Updated`,
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
