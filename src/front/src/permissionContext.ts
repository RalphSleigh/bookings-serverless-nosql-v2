import { createContextualCan } from "@casl/react";
import { createContext } from "react";
import { getPermissionsFromUser } from "../../shared/permissions";

export const AbilityContext = createContext(getPermissionsFromUser(undefined));
export const Can = createContextualCan(AbilityContext.Consumer);