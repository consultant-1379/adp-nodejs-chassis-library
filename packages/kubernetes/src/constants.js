export const RESOURCE_CHANGE_TYPE = {
  ADD: 'ADDED',
  DELETE: 'DELETED',
  MODIFY: 'MODIFIED',
};

export const RESOURCE_TYPE = {
  SERVICE: 'service',
  POD: 'pod',
  ENDPOINT: 'endpoint',
};

export const RESOURCE_TYPE_NAME = {
  [RESOURCE_TYPE.SERVICE]: 'Service',
  [RESOURCE_TYPE.POD]: 'Pod',
  [RESOURCE_TYPE.ENDPOINT]: 'Endpoint',
};

export const DEFAULT_CONFIGS = {
  watchReconnectInterval: 30,
  podStartupTimeout: 200,
  podTerminationTimeout: 200,
  podReplicaStartupTimeout: 3000,
  serviceAccountDir: '/var/run/secrets/kubernetes.io/serviceaccount',
};

export const SERVICE_EVENTS = {
  ADDED: 'service-added',
  MODIFIED: 'service-modified',
  DELETED: 'service-deleted',
};

export const DEFAULT_UI_CONTEXT = '/';
export const MAX_LOOP_ID = 1000;
