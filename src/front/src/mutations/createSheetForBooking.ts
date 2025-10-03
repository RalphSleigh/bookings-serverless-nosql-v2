import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import axios, { AxiosError, AxiosResponse } from 'axios'

import { TCreateSheetForBooking } from '../../../lambda/endpoints/booking/createSheetForBooking'

export const createSheetForBooking = (eventId: string) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({userId, name, email, district}: {userId: string, name: string, email: string, district: string}) => {
      return await axios.post<TCreateSheetForBooking>(`/api/event/${eventId}/booking/${userId}/sheet`, { userId, eventId, name, email, district })
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'sheet'] })
      notifications.show({
        title: 'Sheet Created',
        message: `Sheet Created`,
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
