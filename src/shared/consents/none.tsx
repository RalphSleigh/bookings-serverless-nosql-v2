import { TEventNoneConsents } from "../schemas/event";
import { ConsentPersonFormSection, ConsentStructure } from "./consents";


export class NoneConsents implements ConsentStructure<TEventNoneConsents> {
  typeName: 'none' = 'none'
  FormSection: ConsentPersonFormSection = () => { return null }
}