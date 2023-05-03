import { acl } from './index.js';
import { adminUsers, UserRoles } from '../../constants/roles.ts';

export default function authPlugin() {
  return {
    requestDidStart(requestContext) {
      const user = requestContext?.context?.req?.user || null;
      const where = requestContext?.request?.variables?.where;

      if (user && where) {
        const { user: userId, organization: org } = where;
        const { userOrganization: userOrg, role, id: uid } = user;

        // User access valdiation
        if (userId && !adminUsers.includes(role) && Number(uid) !== Number(userId)) {
          throw error('common:error-invalid-user-param', 'INVALID_USER_PARAM');
        }

        // Organization access valdiation
        if (org && role !== UserRoles.SYSTEMADMIN && Number(userOrg) !== Number(org)) {
          const msg = `common:error-invalid-organization-param user:${uid} attempt to access organization:${org}`;
          throw error('common:error-invalid-organization-param', 'INVALID_ACCOUNT_PARAM');
        }
      }

      return {
        didResolveOperation(resolutionContext) {
          resolutionContext.operation.selectionSet.selections.forEach(selection => {
            const { value: operationName } = selection.name;
            const operationACL = acl[operationName];

            if (operationACL.userSession === true) {
              const { roles } = operationACL;

              // Validate active session
              if (!user) throw error('common:error-general-unauthorized', `UNAUTHORIZED : ${operationName}`);

              // Validate Access control list
              if (!roles.includes(user.role))
                throw error('common:error-general-not-allowed', `NOT_ALLOWED : ${operationName}`);
            }
          });
        },
      };
    },
  };
}
