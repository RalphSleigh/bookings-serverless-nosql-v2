import { Radio, RadioGroupProps } from "@mantine/core";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

//https://github.com/aranlucas/react-hook-form-mantine/blob/master/src/Switch/Switch.tsx
type CustomRadioGroupProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<RadioGroupProps, "value"  | "defaultValue">;

export function CustomRadioGroup<T extends FieldValues>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    onChange,
    children,
    ...props
  }: CustomRadioGroupProps<T>) {
    const {
      field: { value, onChange: fieldOnChange, ...field },
      fieldState,
    } = useController<T>({
      name,
      control,
      defaultValue,
      rules,
      shouldUnregister,
    });
  
    return (
      <Radio.Group
        value={value}
        onChange={(e) => {
          fieldOnChange(e);
          onChange?.(e);
        }}
        error={fieldState.error?.message}
        {...field}
        {...props}
      >
        {children}
      </Radio.Group>
    );
  }