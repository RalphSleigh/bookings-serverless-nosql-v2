import { DateInput, DateInputProps, DatePicker, DatePickerInput, DatePickerInputProps, DatesRangeValue, DateTimePicker, DateTimePickerProps, DateValue } from '@mantine/dates'
import { DateValues, parseISO } from 'date-fns'
import { Controller, ControllerProps, FieldValues, useController, UseControllerProps } from 'react-hook-form'

export type CustomDateInputProps<T extends FieldValues> = UseControllerProps<T> & Omit<DateInputProps, 'value' | 'defaultValue'>

export function CustomDatePicker<T extends FieldValues>(props: CustomDateInputProps<T>) {
  const { name, control, ...inputProps } = props
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
  })
  const valueAsDate = value != undefined ? parseISO(value) : undefined
  //const formValue = valueAsDate ? new Date(valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60000) : undefined
  return (
    <DateInput popoverProps={{zIndex: 1000}}
    valueFormat="DD/MM/YYYY"
    type="default"
      value={valueAsDate}
      onChange={(value) => {
        if (value instanceof Date) {
          fieldOnChange(value.toISOString());
        }
      }}
      {...inputProps}
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
  const valueAsDate = value != undefined ? parseISO(value) : undefined
  //const formValue = valueAsDate ? new Date(valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60000) : undefined
  return (
    <DateTimePicker
      value={valueAsDate}
      onChange={(e) => {
        if(e instanceof Date){
        //const utcDate = new Date(e?.getTime() - e?.getTimezoneOffset() * 60000)
        fieldOnChange(e.toISOString())
        }
      }}
      {...inputProps}
    />
  )
}

