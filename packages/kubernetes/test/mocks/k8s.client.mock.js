import annotationApp from './annotation.serviceobject.js';
import notDiscoverableAnnotationApp from './notDiscoverableAnnotation.serviceobject.js';

class K8sApi {
  setReturnScenario(scenario) {
    this.returnScenario = scenario;
  }

  readNamespacedService(serviceName /* , namespace */) {
    const scenario = this.returnScenario === 'coupleServices' ? serviceName : this.returnScenario;
    switch (scenario) {
      case 'error':
        throw new Error('Cannot read Service');
      case 'reject':
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          response: { statusCode: 'A1', statusMessage: 'Cannot read service' },
        });
      case 'invalid':
        return Promise.resolve({
          sometingElse: {},
        });
      case 'notDiscoverableDomain':
        return Promise.resolve({
          body: notDiscoverableAnnotationApp,
        });
      default:
        // resolve
        return Promise.resolve({
          body: annotationApp,
        });
    }
  }

  readNamespacedPod(/* podName, namespace */) {
    switch (this.scenario) {
      case 'error':
        throw new Error('Cannot read pod');
      case 'reject':
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          response: { statusCode: 'A1', statusMessage: 'Cannot read service' },
        });
      case 'invalid':
        return Promise.resolve({
          sometingElse: {},
        });
      case 'terminatingPod':
        // resolve
        return Promise.resolve({
          body: {
            metadata: {
              name: 'some-pod-postfix',
              generateName: 'some-pod-',
            },
          },
        });
      default:
        // resolve
        throw new Error('Pod not found!');
    }
  }

  listNamespacedPod() {
    switch (this.returnScenario) {
      case 'error':
        throw new Error('Cannot read Pod list');
      case 'reject':
        return Promise.reject(new Error('Cannot read Pod list'));
      case 'invalid':
        return Promise.resolve({
          body: {
            blah: [
              Promise.resolve({
                spec: {
                  volumes: [
                    {
                      notAConfigMap: {
                        name: 'config-map',
                      },
                    },
                  ],
                },
                status: {
                  phase: 'Running',
                },
              }),
            ],
          },
        });
      default:
        return Promise.resolve({
          body: {
            items: [
              {
                metadata: {
                  name: 'some-pod-postfix',
                  generateName: 'some-pod-',
                },
                spec: {
                  volumes: [
                    {
                      configMap: {
                        name: 'config-map',
                      },
                    },
                  ],
                },
                status: {
                  phase: 'Running',
                },
              },
            ],
          },
        });
    }
  }

  listNamespacedIngress() {
    switch (this.returnScenario) {
      case 'error':
        throw new Error('Cannot read ingress list');
      case 'reject':
        return Promise.reject(new Error('Cannot read ingress list'));
      case 'invalid':
        return Promise.resolve({
          body: {
            invalidTag: [
              {
                spec: {
                  otherInvalidTag: [
                    {
                      host: 'localhost',
                      http: {
                        paths: [
                          {
                            path: '/domain-app-1',
                            backend: {
                              serviceName: 'domain1',
                              servicePort: '4000',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                spec: {
                  rules: [
                    {
                      host: 'localhost',
                      http: {
                        paths: [
                          {
                            path: '/domain-app-2',
                            backend: {
                              serviceName: 'domain2',
                              servicePort: '4000',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        });

      default:
        return Promise.resolve({
          body: {
            items: [
              {
                spec: {
                  rules: [
                    {
                      host: 'localhost',
                      http: {
                        paths: [
                          {
                            path: '/domain-app-1',
                            backend: {
                              serviceName: 'domain1',
                              servicePort: '4000',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                spec: {
                  rules: [
                    {
                      host: 'localhost',
                      http: {
                        paths: [
                          {
                            path: '/domain-app-2',
                            backend: {
                              serviceName: 'domain2',
                              servicePort: '4000',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        });
    }
  }
}

const message = 'Callback not registered.';
class Watch {
  static async podsCallback() {
    console.log(message);
  }

  static async servicesCallback() {
    console.log(message);
  }

  static async endpointsCallback() {
    console.log(message);
  }

  static async podsErrorCallback() {
    console.log(message);
  }

  static async servicesErrorCallback() {
    console.log(message);
  }

  static async endpointsErrorCallback() {
    console.log(message);
  }

  watch(path, _options, cb, errorCb) {
    switch (true) {
      case path.includes('pods'):
        Watch.podsCallback = cb;
        Watch.podsErrorCallback = errorCb;
        break;
      case path.includes('services'):
        Watch.servicesCallback = cb;
        Watch.servicesErrorCallback = errorCb;
        break;
      case path.includes('endpoints'):
        Watch.endpointsCallback = cb;
        Watch.endpointsErrorCallback = errorCb;
        break;
      default:
        console.log('The service is trying to watch a path that is not mocked.');
    }

    return {
      abort: () => undefined,
    };
  }
}

class KubeConfig {
  loadFromDefault() {
    // only a mock
  }

  makeApiClient() {
    return new K8sApi();
  }
}

export default { KubeConfig, Watch };
