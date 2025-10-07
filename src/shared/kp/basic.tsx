
import { TBooking } from '../schemas/booking';
import { TEvent, TEventBasicKP } from '../schemas/event'
import { TPerson } from '../schemas/person';
import { KPStructure } from './kp'

export class BasicKP implements KPStructure<TEventBasicKP> {
  typeName: 'basic' = 'basic'

  ManageKPPageList: React.FC<{ event: TEvent<TEventBasicKP>; campers: TPerson<TEvent<TEventBasicKP>>[] }> = () => {
    return <><p>basic KP management page</p></>
  }
}
