import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Box, Button, Container, Flex, Grid, Modal, NumberInput, Paper, Table, Text, TextInput, Title } from '@mantine/core'
import { IconCurrencyPound, IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { getFeeType } from '../../../../shared/fees/fees'
import { FeeStructure } from '../../../../shared/fees/feeStructure'
import { TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { FeeSchema, FeeSchemaForForm, TFee, TFeeForForm } from '../../../../shared/schemas/fees'
import { currency } from '../../../../shared/util'
import { createFeeItem } from '../../mutations/createFeeItem'
import { deleteFeeItem } from '../../mutations/deleteFeeItem'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { getEventFeesQueryOptions } from '../../queries/getEventFees'
import { useEvent } from '../../utils'
import { CustomNumberInput } from '../custom-inputs/customNumberInput'

export const ManageMoney = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const feesQuery = useSuspenseQuery(getEventFeesQueryOptions(eventId))
  const event = useEvent()

  const [selected, setSelected] = useState<string | undefined>(undefined)

  const feeStructure = useMemo(() => getFeeType(event), [event])
  const bookings = useMemo(() => bookingsQuery.data.bookings, [bookingsQuery.data])
  const fees = useMemo(() => feesQuery.data.fees, [feesQuery.data])

  let totalFees = 0
  let totalsPaid = 0

  const tablesRows = bookings.map((b) => {
    const fees = feesQuery.data.fees.filter((f) => f.userId === b.userId)
    const feeRows = feeStructure.getFeeLines(event, b)
    const total = feeRows.reduce((acc, line) => acc + (line.amount || 0), 0)
    const totalWithAdjustments = fees.filter((f) => f.type === 'adjustment').reduce((acc, f) => acc + f.amount, total)
    const totalPaid = fees.filter((f) => f.type === 'payment').reduce((acc, f) => acc + f.amount, 0)
    totalFees += totalWithAdjustments
    totalsPaid += totalPaid

    return (
      <Table.Tr key={b.userId} style={{ cursor: 'pointer' }} onClick={() => setSelected(b.userId)}>
        <Table.Td>{b.basic.name}</Table.Td>
        <Table.Td>{currency(totalWithAdjustments)}</Table.Td>
        <Table.Td>{currency(totalPaid)}</Table.Td>
        <Table.Td>
          {currency(totalWithAdjustments - totalPaid)} {totalWithAdjustments - totalPaid <= 0 ? '✅' : ''}
        </Table.Td>
      </Table.Tr>
    )
  })

  const selectedBooking = bookings.find((b) => b.userId === selected)
  const feesForSelectedBooking = useMemo(() => fees.filter((f) => f.userId === selected), [fees, selected])

  return (
    <>
      {' '}
      <Modal opened={selectedBooking !== undefined} onClose={() => setSelected(undefined)} size="auto" withCloseButton={false}>
        <Modal.CloseButton style={{ float: 'right' }} />
        {selectedBooking !== undefined && <MoneyDetails feeStructure={feeStructure} event={event} booking={selectedBooking!} fees={feesForSelectedBooking} />}
      </Modal>
      <Table striped highlightOnHover withColumnBorders mt={8}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Booking</Table.Th>
            <Table.Th>Fee</Table.Th>
            <Table.Th>Paid</Table.Th>
            <Table.Th>Outstanding</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tablesRows}
          <Table.Tr style={{ borderTop: '2px solid' }}>
            <Table.Td>
              <b>Total</b>
            </Table.Td>
            <Table.Td>
              <b>{currency(totalFees)}</b>
            </Table.Td>
            <Table.Td>{currency(totalsPaid)}</Table.Td>
            <Table.Td>{currency(totalFees - totalsPaid)}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </>
  )
}

const MoneyDetails = ({ feeStructure, event, booking, fees }: { feeStructure: FeeStructure<any>; event: TEvent; booking: TBooking; fees: TFee[] }) => {
  const feeRows = feeStructure.getFeeLines(event, booking)

  const calculatedRows = feeRows.map((line, index) => (
    <Table.Tr key={index}>
      <Table.Td>{line.label}</Table.Td>
      <Table.Td>{currency(line.amount || 0)}</Table.Td>
      <Table.Td></Table.Td>
      <Table.Td></Table.Td>
    </Table.Tr>
  ))

  const AdjustmentRow = ({ fee, index }: { fee: TFee; index: number }) => {
    const deleteMutation = deleteFeeItem(event.eventId)

    return (
      <Table.Tr>
        <Table.Td>{fee.note}</Table.Td>
        <Table.Td>{currency(fee.amount || 0)}</Table.Td>
        <Table.Td></Table.Td>
        <Table.Td align="center">
          <ActionIcon loading={deleteMutation.isPending} variant="subtle" aria-label="Delete" onClick={() => deleteMutation.mutate(fee)}>
            <IconX size={16} color="red" />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    )
  }

  const adjustmentRows = fees.filter((f) => f.type === 'adjustment').map((f, index) => <AdjustmentRow key={'adjustment-' + index} fee={f} index={index} />)

  const PaymentRow = ({ fee, index }: { fee: TFee; index: number }) => {
    const deleteMutation = deleteFeeItem(event.eventId)

    return (
      <Table.Tr>
        <Table.Td>{fee.note}</Table.Td>
        <Table.Td>{currency(fee.amount || 0)}</Table.Td>
        <Table.Td></Table.Td>
        <Table.Td align="center">
          <ActionIcon loading={deleteMutation.isPending} variant="subtle" aria-label="Delete" onClick={() => deleteMutation.mutate(fee)}>
            <IconX size={16} color="red" />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    )
  }

  const paymentRows = fees.filter((f) => f.type === 'payment').map((f, index) => <PaymentRow key={'payment-' + index} fee={f} index={index} />)

  const feesTotal = feeRows.reduce((acc, line) => acc + (line.amount || 0), 0) + fees.filter((f) => f.type === 'adjustment').reduce((acc, f) => acc + f.amount, 0)
  const paymentsTotal = fees.filter((f) => f.type === 'payment').reduce((acc, f) => acc + f.amount, 0)

  console.log('Fees total', feesTotal, paymentsTotal)

  const form = useForm<TFeeForForm>({
    resolver: zodResolver(FeeSchemaForForm),
    mode: 'onChange',
    defaultValues: { eventId: event.eventId, userId: booking.userId, type: undefined, amount: feesTotal - paymentsTotal, note: '' },
  })

  const formState = form.formState

  const valid = formState.isValid

  const icon = <IconCurrencyPound size={20} stroke={1.5} />

  const createMutation = createFeeItem(event.eventId)

  const onSubmit: SubmitHandler<TFeeForForm> = (data) => {
    console.log('Submitting fee:', data)
    createMutation.mutate(data)
  }

  useEffect(() => {
    form.reset({ eventId: event.eventId, userId: booking.userId, type: undefined, amount: feesTotal - paymentsTotal, note: '' })
  }, [createMutation.isSuccess, feesTotal - paymentsTotal])

  return (
    <>
      <Table striped highlightOnHover withColumnBorders mt={8}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Description</Table.Th>
            <Table.Th>Fee</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {calculatedRows}
          {adjustmentRows}
          {paymentRows}
          <Table.Tr style={{ borderTop: '2px solid' }}>
            <Table.Td>
              <b>Total</b>
            </Table.Td>
            <Table.Td>
              <b>{currency(feesTotal)}</b>
            </Table.Td>
            <Table.Td>
              <b>{currency(paymentsTotal)}</b>
            </Table.Td>
            <Table.Td>
              <b>{currency(feesTotal - paymentsTotal)}</b>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      {valid}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Flex>
            <CustomNumberInput name="amount" label="Amount" leftSection={icon} style={{ width: '150px' }} />
            <TextInput label="Description" {...form.register('note')} ml={8} style={{ flexGrow: 1, minWidth: '20em' }} />
          </Flex>
          <Flex mt={8} justify="flex-end">
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 110 }}
              disabled={!valid}
              loading={createMutation.isPending}
              onClick={() => form.setValue('type', 'adjustment')}
            >
              Add Adjustment
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'blue', to: 'violet', deg: 110 }}
              ml={8}
              disabled={!valid}
              loading={createMutation.isPending}
              onClick={() => form.setValue('type', 'payment')}
            >
              Add Payment
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </>
  )
}
