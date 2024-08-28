import { LitComponent, html, definition } from '@eui/lit-component';

export default class ExampleView extends LitComponent {
  async didConnect() {
    if (this.componentName) {
      await this._generateComponent();
    } else {
      this.componentElement = html`
        <div>
          <i>Component name wasn't passed</i>
        </div>
      `;
    }
  }

  async _generateComponent() {
    const exampleContainer = document.createElement('div');
    const { code, props } = this.example || {};

    try {
      // eslint-disable-next-line no-undef
      const componentModule = await importShim(
        `/src/components/${this.componentName}/${this.componentName}.js`,
      );
      componentModule.default.register();

      if (code) {
        exampleContainer.innerHTML = code;
      } else if (props) {
        const element = document.createElement(`e-${this.componentName}`);

        Object.keys(props).forEach((property) => {
          element[property] = props[property];
        });

        exampleContainer.appendChild(element);
      }
    } catch (e) {
      exampleContainer.innerHTML = `Something wrong with the component view element: <i>${e.message}</i>.<br>See more detailed in a Dev Tools.`;
      console.error(e);
    }

    this.componentElement = exampleContainer;
  }

  render() {
    return html`
      ${this.componentElement}
    `;
  }
}

definition('e-example-view', {
  style: ':host {  display: block; }',
  props: {
    componentName: {
      type: String,
      attribute: false,
      default: '',
    },
    example: {
      type: Object,
      attribute: false,
      default: {},
    },
    componentElement: {
      type: Object,
      attribute: false,
    },
  },
})(ExampleView);
