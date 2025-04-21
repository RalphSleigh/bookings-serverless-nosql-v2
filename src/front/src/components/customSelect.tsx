import { Select, type SelectProps } from "@mantine/core";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";


type CustomSelectProps<T extends FieldValues> = UseControllerProps<T> & Omit<SelectProps, 'value' | 'defaultValue'>

export function CustomSelect<T extends FieldValues>({ name, control, ...inputProps }: CustomSelectProps<T>) {
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController({
    name,
    control,
  })

  return (
    <Select
      {...inputProps}
      {...field}
      value={value}
      onChange={(e) => {
        fieldOnChange(e)
      }}
    />
  )
}