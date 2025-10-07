import { Table } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo } from 'react'

import { getKPType, KPBasicOptions } from '../../../../shared/kp/kp'
import { TPerson } from '../../../../shared/schemas/person'
import { AgeGroup, ageGroupFromPerson, ageGroups } from '../../../../shared/woodcraft'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { useEvent } from '../../utils'

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

  const totals: Record<string, Record<string, number>> = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {}
    const ageFn = ageGroupFromPerson(event)

    return campers.reduce((totals, camper) => {
      const ageGroup = ageFn(camper)
      totals[ageGroup.plural] = totals[ageGroup.plural] || {}
      totals[ageGroup.plural][camper.kp.diet] = (totals[ageGroup.plural][camper.kp.diet] || 0) + 1
      totals['all'] = totals['all'] || {}
      totals['all'][camper.kp.diet] = (totals['all'][camper.kp.diet] || 0) + 1
      return totals
    }, totals)
  }, [campers])

const ageGroupList = ageGroups.map(ag => ag.construct(0))

  const rows = ageGroupList.map((ageGroup) => {
    const row = KPBasicOptions.map((k) => totals[ageGroup.plural]?.[k] || 0).map((t) => <Table.Td key={t}>{t}</Table.Td>)
    const total = KPBasicOptions.reduce((acc, k) => acc + (totals[ageGroup.plural]?.[k] || 0), 0)
    return (
      <Table.Tr key={ageGroup.plural}>
        <Table.Td>{ageGroup.plural}</Table.Td>
        {row}
        <Table.Td>
          <b>{total}</b>
        </Table.Td>
      </Table.Tr>
    )
  })

  const totalRow = KPBasicOptions.map((k) => {
    const total = totals['all']?.[k] || 0
    return (
      <Table.Td key={k}>
        <b>{total}</b>
      </Table.Td>
    )
  })

  const headers = KPBasicOptions.map((k) => <Table.Th key={k}>{capitalise(k)}</Table.Th>)
  const KP = useMemo(() => getKPType(event), [event])
  return (
    <>
      <p>Manage KP</p>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Age Group</Table.Th>
            {headers}
            <Table.Th>Total</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
          <Table.Tr>
            <Table.Td>
              <b>Total</b>
            </Table.Td>
            {totalRow}
            <Table.Td>
              <b>{campers.length}</b>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <KP.ManageKPPageList event={event} campers={campers} />
    </>
  )
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
