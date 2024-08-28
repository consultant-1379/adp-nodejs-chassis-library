export default {
  kind: 'Endpoints',
  apiVersion: 'v1',
  metadata: {
    name: 'domain3',
    labels: {
      'app.kubernetes.io/name': 'domain-service-3',
      'app.kubernetes.io/version': '2.0.1-44',
      'ui.ericsson.com/part-of': 'workspace-gui',
    },
    annotations: {
      'endpoints.kubernetes.io/last-change-trigger-time': '2022-01-05T15:16:26Z',
    },
  },
  subsets: [
    {
      addresses: [
        {
          ip: '192.168.63.239',
          nodeName: 'seliics01765e03',
        },
        {
          ip: '192.168.63.240',
          nodeName: 'seliics01765e04',
        },
      ],
      ports: [
        {
          port: 4000,
          protocol: 'TCP',
        },
      ],
    },
  ],
};
