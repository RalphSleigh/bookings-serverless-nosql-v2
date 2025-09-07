import { Anchor, Paper, Text, Title } from '@mantine/core'
import { useDebounce } from '@react-hook/debounce'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { PartialDeep } from 'type-fest/source/partial-deep'
import { z } from 'zod/v4'

import { BookingSchemaForType, TBookingForType } from '../../../../shared/schemas/booking'

export const BookingSummary: React.FC = ({}) => {
  const data = useWatch<z.input<typeof BookingSchemaForType>>()

  if (!data.people) return null

  const people = data.people
    .filter((p) => p.basic)
    .map((p) => {
      return (
        <Text key={p.personId}>
          <Anchor href={`#${p.personId}`}>{p.basic!.name}</Anchor>
        </Text>
      )
    })

  return (
    <Paper shadow="md" radius="md" withBorder mt={8} mr={8} p="md" style={{ position: 'sticky', top: 56 }}>
      <Title order={3}>Booking Summary</Title>
      {people}
    </Paper>
  )
}
