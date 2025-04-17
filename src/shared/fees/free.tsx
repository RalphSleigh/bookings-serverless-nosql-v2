import { PartialDeep } from 'type-fest';
import { FeeTypes } from '.';
import { AttendanceTypes } from '../attendance/attendance';
import { TEvent, TFreeFees } from '../schemas/event';
import { FeeStructure, FeeStructureCondfigurationElement } from './feeStructure';

export class FreeFees implements FeeStructure<TFreeFees> {
  typeName: 'free' = 'free';
  name: string = 'Free Fees';
  supportedAttendance: AttendanceTypes[] = [];

  ConfigurationElement: FeeStructureCondfigurationElement<TFreeFees> = ({ data, update }) => {
    return (
      <div>
        <p>{data?.feeStructure}</p>
      </div>
    );
  };
}