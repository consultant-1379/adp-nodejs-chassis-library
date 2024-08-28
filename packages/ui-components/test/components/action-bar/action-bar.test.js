import { expect, fixture } from '@open-wc/testing';
import ActionBar from '../../../src/components/action-bar/action-bar';

describe('ActionBar Component Tests', () => {
  before(() => {
    ActionBar.register();
  });

  describe('Basic component setup', () => {
    it('should render <e-action-bar>', async () => {
      const component = await fixture('<e-action-bar></e-action-bar>');
      expect(component.shadowRoot).to.exist;
    });
  });
});
