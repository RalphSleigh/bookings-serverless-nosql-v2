
import { TBooking } from '../schemas/booking';
import { TEvent, TEventBasicKP } from '../schemas/event'
import { KPStructure } from './kp'

export class BasicKP implements KPStructure<TEventBasicKP> {
  typeName: 'basic' = 'basic'

  ManageKPPageList: React.FC<{ event: TEvent<TEventBasicKP>; bookings: TBooking<TEvent<TEventBasicKP>>[] }> = () => {
    return <></>
  }
}
