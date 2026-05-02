
export const getIncidents = (api) => {
  return api.get("/api/incidents");
};

export const createIncident = (api, data) => {
  return api.post("/api/incidents", data);
};

export const getIncidentById = (api, id) => {
  return api.get(`/api/incidents/${id}`);
};

export const updateIncident = (api, id, data) => {
  return api.put(`/api/incidents/${id}`, data);
};

export const deleteIncident = (api, id) => {
  return api.delete(`/api/incidents/${id}`);
};