import { waitUntil, aTimeout } from '@open-wc/testing-helpers';
import CONSTANT from './constants.js';

const isReady = async (elements) => {
  if (elements.length === 0) {
    return true;
  }
  const element = elements.shift();
  const isCustomElement = element.tagName.includes('-');
  if (isCustomElement) {
    await waitUntil(
      () => element?.shadowRoot?.hasChildNodes(),
      'Element should have children in time.',
      { interval: 50, timeout: CONSTANT.CHILDREN_WAIT_TIMEOUT },
    );
    return isReady([...elements, ...element.shadowRoot.children]);
  }
  return isReady([...elements, ...element.children]);
};

export default async (element) => {
  await waitUntil(() => isReady([element]), 'Element should become ready in time', {
    interval: 50,
    timeout: CONSTANT.ROOT_WAIT_TIMEOUT,
  });
  await aTimeout(CONSTANT.NEXT_TICK_WAIT_TIMEOUT);
};
