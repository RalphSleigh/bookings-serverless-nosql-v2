import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

import { DBRole } from '../lambda/dynamo';
import { ContextUser } from '../lambda/middleware/context';
import { TRole } from './schemas/role';

type Action = 'manage' | 'create' | 'edit';
type Subject = 'all' | 'event';

export const getPermissionsFromUser = (user: ContextUser) => {
  const { can, cannot, build } = new AbilityBuilder<MongoAbility<[Action, Subject]>>(createMongoAbility);

  cannot('manage', 'all');

  if (!user) {
    return build();
  }

  for (const role of user.roles) {
    permissionsFunctions[role.role](can);
  }

  return build();
};


const permissionsFunctions: Record<TRole['role'], (can: AbilityBuilder<MongoAbility<[Action, Subject]>>['can']) => void> = {
  admin: (can) => {
    can('manage', 'all');
  },
};
