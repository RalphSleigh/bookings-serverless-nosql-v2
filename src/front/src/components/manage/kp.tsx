import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { useEvent } from '../../utils'
import { getKPType } from '../../../../shared/kp/kp'

export const ManageKP: React.FC = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const bookings = bookingsQuery.data.bookings.map((b) => (
    <div key={b.userId}>
      <p>{b.basic.name}</p>
    </div>
  ))

  const campers = useMemo(
    () =>
      bookingsQuery.data.bookings.reduce<TPerson[]>((acc, booking) => {
        return [...acc, ...booking.people]
      }, []),
    [bookingsQuery.data],
  )

  const KP = useMemo(() => getKPType(event), [event])
  return (
    <>
      <p>Manage KP</p>
      <KP.ManageKPPageList event={event} campers={campers} />
    </>
  )
}
