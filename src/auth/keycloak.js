import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180",
    realm: "cloudops-realm",
    clientId: "cloudops-frontend",
});

export default keycloak;