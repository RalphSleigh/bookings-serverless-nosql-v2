import { Anchor, Paper, Text, Title } from '@mantine/core'
import { useState } from 'react'

import { PartialBookingType } from '../../../../shared/schemas/booking'
import { WatchDebounce } from '../../utils'

export const BookingSummary: React.FC = ({}) => {
  ;[]
  const [people, setPeople] = useState<PartialBookingType['people']>([])
  const rows = (people || [])
    .filter((p) => p?.basic)
    .map((p) => {
      return (
        <Text key={p?.personId}>
          <Anchor href={`#${p?.personId}`}>{p?.basic?.name}</Anchor>
        </Text>
      )
    })

  return (
    <>
      <WatchDebounce value={people} set={setPeople} name="people" duration={500} />
      <Paper shadow="md" radius="md" withBorder mt={8} mr={8} p="md" style={{ position: 'sticky', top: 56 }}>
        <Title order={3}>Booking Summary</Title>
        {rows}
      </Paper>
    </>
  )
}
