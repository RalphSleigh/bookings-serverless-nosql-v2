import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import type { ManageVillageItemData } from '../../../lambda/endpoints/event/manage/manageVillages'


export const manageVillageMutation = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ManageVillageItemData) => {
      return await axios.post(`/api/event/${eventId}/manage/villages`, data)
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'bookings'], })
      notifications.show({
        title: 'Villages Updated',
        message: `Villages Updated`,
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
