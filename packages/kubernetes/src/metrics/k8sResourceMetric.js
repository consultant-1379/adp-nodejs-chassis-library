import * as events from 'events';
import { RESOURCE_CHANGE_TYPE, RESOURCE_TYPE, RESOURCE_TYPE_NAME } from '../constants.js';

const LOGGER = Symbol('LOGGER');
const PM = Symbol('Performance Management Service');

/**
 * Class representing a resources metric.
 * @private
 * @extends events.EventEmitter
 */
class K8sResourceMetric extends events.EventEmitter {
  /**
   * Create a metric and a map for a given resource's type.
   *
   * @param {object} options - Options for k8sResourceMetric constructor.
   */
  constructor(options) {
    super();

    const { resourceType, logger, pm } = options;

    this[LOGGER] = logger;
    this[PM] = pm;

    this.resourceType = resourceType;
    this.resourcesMap = new Map();
    this._metricEnabled = this[PM]?.isEnabled();
    if (this._metricEnabled) {
      this._metricName = `${resourceType}_num`;
      this._metric = this[PM].createMetric('gauge', {
        name: this._metricName,
        help: `Total number of ${RESOURCE_TYPE_NAME[resourceType]} K8s discovered resources.`,
      });
    }
  }

  /**
   * Set metric value to the amount of resources.
   *
   * @private
   */
  _updateValue() {
    if (!this._metricEnabled) {
      return;
    }

    const metricValue = this.resourcesMap.size;
    this._metric.set(metricValue);
  }

  /**
   * Add resource with its service name.
   *
   * @param {string} name - Name of the added service.
   * @param {string} serviceName - K8 Name of the service.
   */
  add(name, serviceName) {
    this.resourcesMap.set(name, { serviceName });
    this._updateValue();
  }

  /**
   * Remove resource by name.
   *
   * @param {string} name - Name of the removed service.
   */
  remove(name) {
    this.resourcesMap.delete(name);
    this._updateValue();
    this.emit('remove-metric-resource', name);
  }

  /**
   * Remove resources by given service name.
   *
   * @param {string} name - Name of the removed service.
   */
  removeByServiceName(name) {
    this.resourcesMap.forEach(({ serviceName }, resourceName) => {
      if (serviceName === name) {
        this.resourcesMap.delete(resourceName);
      }
    });
    this._updateValue();
  }

  /**
   * Updates resources map according to a given change type.
   *
   * @param {object} parameters - Properties described below.
   * @param {string} parameters.type - Change type. Possible values are: 'ADDED', 'DELETED', 'MODIFIED'.
   * @param {string} parameters.name - Resource's name.
   * @param {string} [parameters.serviceName] - Resource's service name. Later it will help to delete resources when their service will be deleted.
   */
  update({ type, name, serviceName }) {
    if (!type || !name) {
      this[LOGGER].error('Updating k8s metric: at list one of the required parameters is missing');
      return;
    }

    switch (type) {
      case RESOURCE_CHANGE_TYPE.ADD:
        serviceName = this.resourceType === RESOURCE_TYPE.SERVICE ? name : serviceName;
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

  /**
   * Set metric value to 0.
   */
  reset() {
    this.resourcesMap.clear();

    if (this._metricEnabled) {
      this._metric.set(0);
    }
  }

  /**
   * Delete metric.
   */
  clear() {
    if (this._metricEnabled) {
      this[PM].deleteMetric(this._metricName);
    }
  }
}

export default K8sResourceMetric;
