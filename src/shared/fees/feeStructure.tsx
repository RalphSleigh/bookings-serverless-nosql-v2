import { Dispatch, SetStateAction } from 'react';
import { PartialDeep } from 'type-fest';

import { FeeTypes } from '.';
import { AttendanceTypes } from '../attendance/attendance';
import { TEvent, TFees } from '../schemas/event';

export type FeeStructureConfigData<T extends TFees> = Required<Pick<T, 'feeStructure'>> & PartialDeep<T>;
export type FeeStructureCondfigurationElement<T extends TFees> = React.FC<{
  data: FeeStructureConfigData<T>;
  update: Dispatch<SetStateAction<PartialDeep<T>>>;
}>;

export interface FeeStructure<T extends TFees = TFees> {
  typeName: T['feeStructure']
  name: string;
  supportedAttendance: AttendanceTypes[];
  ConfigurationElement: FeeStructureCondfigurationElement<T>;
}
