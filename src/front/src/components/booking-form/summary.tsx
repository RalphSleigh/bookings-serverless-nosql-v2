import { Anchor, Paper, Text, Title } from '@mantine/core'
import { useState } from 'react'

import { TPersonResponse } from '../../../../lambda/endpoints/event/manage/getEventBookings'
import { PartialBookingType, TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroups, campersInAgeGroup } from '../../../../shared/woodcraft'
import { useEvent, WatchDebounce } from '../../utils'

const reverseAgeGroups = [...ageGroups].reverse()

export const BookingSummary: React.FC = ({}) => {
  const [people, setPeople] = useState<PartialBookingType['people']>([])

  const peopleWithIndex = (people || [])
    .map((p, i) => (p ? { ...p, index: i } : null))
    .filter((p): p is NonNullable<typeof p> => p !== null)
    
  const event = useEvent()

  const filter = campersInAgeGroup(event)

  const sections = reverseAgeGroups.map((group) => {
    const peopleInGroup = peopleWithIndex.filter((p) => p?.basic?.name && p?.basic?.dob).filter((p) => filter(group)({ p, b: null } as unknown as { p: TPersonResponse; b: TBooking<TEvent> }))
    if (peopleInGroup.length === 0) return null

    const rows = peopleInGroup.map((p, i) => {
      return (
        <Text key={i}>
          <Anchor href={`#person-${p.index}`}>{p?.basic?.name}</Anchor>
        </Text>
      )
    })

    return (
      <div key={group.construct(0).singular}>
        <Title order={4}>{group.construct(0).plural}</Title>
        {rows}
      </div>
    )
  })

  return (
    <>
      <WatchDebounce value={people} set={setPeople} name="people" duration={500} />
      <Paper shadow="md" radius="md" withBorder mt={8} mr={8} p="md" style={{ position: 'sticky', top: 8 }}>
        <Title order={3}>Booking Summary</Title>
        {sections}
      </Paper>
    </>
  )
}
