import { Switch, SwitchProps } from "@mantine/core";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

//https://github.com/aranlucas/react-hook-form-mantine/blob/master/src/Switch/Switch.tsx
type CustomSwitchProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<SwitchProps, "value" | "checked" | "defaultValue">;

export function CustomSwitch<T extends FieldValues>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    onChange,
    ...props
  }: CustomSwitchProps<T>) {
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
      <Switch
        value={value}
        checked={value}
        onChange={(e) => {
          fieldOnChange(e);
          onChange?.(e);
        }}
        error={fieldState.error?.message}
        {...field}
        {...props}
      />
    );
  }