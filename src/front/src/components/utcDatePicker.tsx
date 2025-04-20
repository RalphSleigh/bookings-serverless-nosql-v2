import { parseISO } from 'date-fns';

//We need the dates to work both in the browser in whatever timezone thats in, and also serverside.
//This date picker will convert the picked date to the start of that day in UTC, and expects a UTC datetime in its value.
//This way we always send the server the same date that the user picked, and not possibly a UTC datetime thats outside that day
//Downside is we need to recovert it back to local time before displaying
export function UtcDatePicker(props: { [x: string]: any; value: string | undefined; onChange: (value: string) => void }) {
  const { value, onChange, ...rest } = props;
  const convertOnChange = (value: Date | null, context: any) => {
    if (value) {
      const utcDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
      onChange(utcDate.toISOString());
    }
  };

  const valueAsDate = value ? parseISO(value) : undefined;
  const localDate = valueAsDate ? new Date(valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60000) : null;

  return <DatePicker value={localDate} onChange={convertOnChange} {...rest} />;
}
