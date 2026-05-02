export const getUserRoles = (keycloak) => {
  return keycloak?.tokenParsed?.realm_access?.roles || [];
};

export const hasRole = (keycloak, role) => {
  const roles = getUserRoles(keycloak);
  return roles.includes(role);
};

export const isAdmin   = (keycloak) => hasRole(keycloak, "ADMIN");
export const isDevOps  = (keycloak) => hasRole(keycloak, "DEVOPS");