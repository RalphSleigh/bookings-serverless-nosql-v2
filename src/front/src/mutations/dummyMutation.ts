import { useMutation } from '@tanstack/react-query'

import { TBookingForType } from '../../../shared/schemas/booking'
import { TEvent } from '../../../shared/schemas/event'

export const dummyMutation = () => {
  return useMutation({
    mutationFn: async ({ event, booking, min, max }: { event: TEvent; booking: TBookingForType; min: number; max: number }) => {
      return Promise.resolve()
    },
  })
}
