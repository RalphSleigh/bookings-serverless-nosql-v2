import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

export const deleteApplicationMutation = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      return await axios.delete(`/api/event/${eventId}/manage/application/${userId}`)
    },
    onSuccess: (data: AxiosResponse, context) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'applications'] })
      notifications.show({
        title: 'Application Deleted',
        message: `Application deleted`,
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
