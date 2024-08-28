import * as events from 'events';
import { RESOURCE_CHANGE_TYPE } from '../../src/constants.js';

class K8sResourceMetricMock extends events.EventEmitter {
  constructor(resourceType) {
    super();
    this.resourceType = resourceType;
  }

  add() {
    // only a mock
  }

  remove(name) {
    this.emit('remove-metric-resource', name);
  }

  update({ type, name, serviceName }) {
    switch (type) {
      case RESOURCE_CHANGE_TYPE.ADD:
        this.add(name, serviceName);
        break;
      case RESOURCE_CHANGE_TYPE.MODIFY:
        break;
      case RESOURCE_CHANGE_TYPE.DELETE:
        this.remove(name);
        break;
      default:
        break;
    }
  }

  removeByServiceName() {
    // only a mock
  }

  reset() {
    // only a mock
  }

  clear() {
    // only a mock
  }
}

export default K8sResourceMetricMock;
