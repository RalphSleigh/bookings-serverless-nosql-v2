import { DateInput, DateInputProps, DatePicker, DatePickerInput, DatePickerInputProps, DatesRangeValue, DateTimePicker, DateTimePickerProps, DateValue } from '@mantine/dates'
import dayjs from 'dayjs'
import { Controller, ControllerProps, FieldValues, useController, UseControllerProps } from 'react-hook-form'

export type CustomDateInputProps<T extends FieldValues> = UseControllerProps<T> & Omit<DateInputProps, 'value' | 'defaultValue'>

export function CustomDatePicker<T extends FieldValues>(props: CustomDateInputProps<T>) {
  const { name, ...inputProps } = props
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name
  })
  const valueAsDate = value != undefined ? dayjs(value).toDate() : undefined
  //const formValue = valueAsDate ? new Date(valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60000) : undefined

  const { error } = fieldState

  return (
    <DateInput
      popoverProps={{ zIndex: 1000 }}
      error={error?.message}
      valueFormat="DD/MM/YYYY"
      type="default"
      value={valueAsDate}
      onChange={(value) => fieldOnChange(value ? new Date(value).toISOString() : undefined)}
      {...inputProps}
      {...field}
    />
  )
}

export type CustomDateTimePickerProps<T extends FieldValues> = UseControllerProps<T> & Omit<DateTimePickerProps, 'value' | 'defaultValue'>

export function CustomDateTimePicker<T extends FieldValues>(props: CustomDateTimePickerProps<T>) {
  const { name, control, ...inputProps } = props
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
  })
  const valueAsDate = value != undefined ? dayjs(value).toDate() : undefined
  //const formValue = valueAsDate ? new Date(valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60000) : undefined
  return (
    <DateTimePicker
      value={valueAsDate}
      onChange={(value) => fieldOnChange(value ? new Date(value).toISOString() : undefined)}
      {...inputProps}
    />
  )
}
