import { Dispatch } from 'react';
import { PartialDeep } from 'type-fest';

import { FeeTypes } from '.';
import { AttendanceTypes } from '../attendance/attendance';
import { TEalingFees, TEvent, TFees } from '../schemas/event';
import { FeeStructure, FeeStructureCondfigurationElement, FeeStructureConfigData } from './feeStructure';
import { getMemoObjectUpdateFunctions, getSubUpdate } from '../../front/src/utils';

export class EalingFees implements FeeStructure<TEalingFees> {
  typeName: 'ealing' = 'ealing';
  name = 'Ealing Fees';
  supportedAttendance: AttendanceTypes[] = ['whole'];
  ConfigurationElement: FeeStructureCondfigurationElement<TEalingFees> = ({ data, update }) => {
    const { updateNumber, updateField } = getMemoObjectUpdateFunctions(getSubUpdate(update, "ealingData"))
    return (<>
      <Typography sx={{ mt: 2 }} variant="h5">Ealing fee options</Typography>
      <Grid container spacing={2}>
          <Grid size={6}>
              <TextField
                  fullWidth
                  slotProps={{ input: {startAdornment: <InputAdornment position="start">£</InputAdornment> }}}
                  sx={{ mt: 2 }}
                  required
                  id="outlined-required"
                  label="Unaccompanied"
                  type="number"
                  value={data.ealingData?.unaccompanied}
                  onChange={updateNumber('unaccompanied')} />
          </Grid>
          <Grid size={6}>
              <TextField
                  fullWidth
                  slotProps={{ input: {startAdornment: <InputAdornment position="start">£</InputAdornment> }}}
                  sx={{ mt: 2 }}
                  required
                  id="outlined-required"
                  label="Unaccompanied Discount"
                  type="number"
                  value={data.ealingData?.unaccompaniedDiscount}
                  onChange={updateNumber('unaccompaniedDiscount')} />
          </Grid>
          <Grid size={6}>
              <TextField
                  fullWidth
                  slotProps={{ input: {startAdornment: <InputAdornment position="start">£</InputAdornment> }}}
                  sx={{ mt: 2 }}
                  required
                  id="outlined-required"
                  label="Accompanied"
                  type="number"
                  value={data.ealingData?.accompanied}
                  onChange={updateNumber('accompanied')} />
          </Grid>
          <Grid size={6}>
              <TextField
                  fullWidth
                  slotProps={{ input: {startAdornment: <InputAdornment position="start">£</InputAdornment> }}}
                  sx={{ mt: 2 }}
                  required
                  id="outlined-required"
                  label="Accompanied Discount"
                  type="number"
                  value={data.ealingData?.accompaniedDiscount}
                  onChange={updateNumber('accompaniedDiscount')} />
          </Grid>
          <Grid size={12}>
              <TextField
                  fullWidth
                  multiline
                  sx={{ mt: 2 }}
                  required
                  id="outlined-required"
                  label="Payment instructions"
                  defaultValue={data.ealingData?.paymentInstructions}
                  value={data.ealingData?.paymentInstructions}
                  onChange={updateField('paymentInstructions')} />
          </Grid>
      </Grid>
  </>);
  };
}
