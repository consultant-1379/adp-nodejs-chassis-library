import { LitComponent, html, definition } from '@eui/lit-component';
import Table from './table.js';
import ExampleSection from './example-section.js';
import style from './component-view.css';

export default class ComponentView extends LitComponent {
  static get components() {
    return {
      'e-table': Table,
      'e-example-section': ExampleSection,
    };
  }

  async didConnect() {
    this.componentConfig = {};
    this.componentConfigUpdated = false;

    try {
      this.componentConfig = (await import(`../config/${this.componentName}-config.js`)).default;
      this.componentConfigUpdated = true;
    } catch (e) {
      console.error('Something went wrong:', e);
    }
  }

  _getPropsSection() {
    const props = this.componentConfig?.props;
    if (!props?.length) {
      return null;
    }

    return html`
      <h2>Props</h2>
      <div>
        <e-table
          .columns=${{
            name: 'Name',
            type: 'Type',
            attribute: 'Attribute',
            default: 'Default',
            description: 'Description',
          }}
          .rows=${props}
        ></e-table>
      </div>
    `;
  }

  _getSlotsSection() {
    const slots = this.componentConfig?.slots;
    if (!slots?.length) {
      return null;
    }

    return html`
      <h2>Slots</h2>
      <div>
        <e-table
          .columns=${{
            name: 'Name',
            description: 'Description',
          }}
          .rows=${slots}
        ></e-table>
      </div>
    `;
  }

  _getEventsSection() {
    const events = this.componentConfig?.events;
    if (!events?.length) {
      return null;
    }

    return html`
      <h2>Events</h2>
      <div>
        <e-table
          .columns=${{
            name: 'Name',
            description: 'Description',
          }}
          .rows=${events}
        ></e-table>
      </div>
    `;
  }

  _getExamplesSection() {
    const examples = this.componentConfig?.examples;
    if (!examples?.length) {
      return null;
    }

    const examplesHtml = examples.map(
      (example) => html`
        <e-example-section
          .language=${example.language || 'html'}
          .example="${example}"
          .componentName=${this.componentName}
        ></e-example-section>
      `,
    );

    return html`
      <h2>Examples</h2>
      <div>${examplesHtml}</div>
    `;
  }

  render() {
    return html`
      ${this._getPropsSection()} ${this._getSlotsSection()} ${this._getEventsSection()}
      ${this._getExamplesSection()}
    `;
  }
}

definition('e-component-view', {
  style,
  props: {
    componentName: {
      type: String,
      default: null,
      attribute: false,
    },
    componentConfigUpdated: {
      type: Boolean,
      default: false,
      attribute: false,
    },
  },
})(ComponentView);
