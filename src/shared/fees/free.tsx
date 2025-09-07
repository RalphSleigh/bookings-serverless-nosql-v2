import { PartialDeep } from 'type-fest';
import { AttendanceTypes } from '../attendance/attendance';
import { TEvent, TEventWithFees, TFreeFees } from '../schemas/event';
import { BookingFormDisplayElement, FeeStructure, FeeStructureCondfigurationElement, GetFeeLineFunction } from './feeStructure';
import { useFormContext } from 'react-hook-form';
import { PartialBookingType } from '../schemas/booking';
import { Grid, Text, Textarea, TextInput, Title } from '@mantine/core'


export class FreeFees implements FeeStructure<TFreeFees> {
  typeName: 'free' = 'free';
  name: string = 'Free Fees';
  supportedAttendance: AttendanceTypes[] = [];

  ConfigurationElement: FeeStructureCondfigurationElement<TFreeFees> = () => {
    return (
      <div>
        <p>Free</p>
      </div>
    );
  };

  getFeeLines: GetFeeLineFunction<TFreeFees> = (event: TEventWithFees<TFreeFees>, booking: PartialBookingType) => {
      return [
        {
          label: `Free`,
          amount: 0,
        },
      ]
    }

    BookingFormDisplayElement: BookingFormDisplayElement<TFreeFees> = ({ event }) => {
      const { watch } = useFormContext<PartialBookingType>()
      const people = watch('people') || []
  
      const lines = this.getFeeLines(event, { people })
  
      return (
        <>
          {lines.map((line) => (
            <Text key={line.label}>
              {line.label}: {line.amount}
            </Text>
          ))}
        </>
      )
    }

}