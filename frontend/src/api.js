import axios from 'axios';

const nodeAPI = axios.create({ baseURL: process.env.REACT_APP_NODE_API || 'http://localhost:5000/api' });
const fastAPI  = axios.create({ baseURL: process.env.REACT_APP_FASTAPI_API || 'http://localhost:8000' });

const addAuth = (cfg) => {
  const t = localStorage.getItem('ucp_token');
  if (t) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${t}` };
  return cfg;
};
nodeAPI.interceptors.request.use(addAuth);
nodeAPI.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => nodeAPI.post('/auth/register', d),
  login:    (d) => nodeAPI.post('/auth/login',    d),
  me:       ()  => nodeAPI.get('/auth/me'),
};

export const projectAPI = {
  list:   ()        => nodeAPI.get('/projects'),
  get:    (id)      => nodeAPI.get(`/projects/${id}`),
  create: (d)       => nodeAPI.post('/projects', d),
  update: (id, d)   => nodeAPI.put(`/projects/${id}`, d),
  remove: (id)      => nodeAPI.delete(`/projects/${id}`),
};

export const appAPI = {
  list:   ()   => nodeAPI.get('/apps'),
  create: (d)  => nodeAPI.post('/apps', d),
  build:  (id) => nodeAPI.put(`/apps/${id}/build`),
  remove: (id) => nodeAPI.delete(`/apps/${id}`),
};

export const analyticsAPI = {
  summary:    () => fastAPI.get('/analytics/summary'),
  platforms:  () => fastAPI.get('/analytics/platform-distribution'),
  timeline:   () => fastAPI.get('/analytics/timeline'),
  buildStats: () => fastAPI.get('/builds/stats'),
  efficiency: () => fastAPI.get('/reports/efficiency'),
};

export const builderAPI = {
  submit: (d)   => nodeAPI.post('/builder/submit', d),
  jobs:   ()    => nodeAPI.get('/builder/jobs'),
  job:    (id)  => nodeAPI.get(`/builder/jobs/${id}`),
};
