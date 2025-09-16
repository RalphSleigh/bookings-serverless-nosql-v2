import { Anchor, Paper, Text, Title } from '@mantine/core'
import { useDebounce } from '@react-hook/debounce'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { PartialDeep } from 'type-fest/source/partial-deep'
import { z } from 'zod/v4'

import { BookingSchemaForType, PartialBookingType, TBookingForType } from '../../../../shared/schemas/booking'
import { TPerson } from '../../../../shared/schemas/person'

export const BookingSummary: React.FC = ({}) => {
  const data = useWatch<PartialBookingType,"people">({name: 'people'})
  const [debouncedData, setDebouncedData] = useDebounce(() => data, 200)
  setDebouncedData(data)

  return useMemo(() => <SummaryContents people={debouncedData} />, [debouncedData])
}

const SummaryContents = ({people}:{people: PartialBookingType["people"]}) => {
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
    <Paper shadow="md" radius="md" withBorder mt={8} mr={8} p="md" style={{ position: 'sticky', top: 56 }}>
      <Title order={3}>Booking Summary</Title>
      {rows}
    </Paper>
  )
}
