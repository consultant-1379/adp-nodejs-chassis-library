import { LitComponent, html, definition, nothing } from '@eui/lit-component';
import CodeSnippet from './code-snippet.js';
import ExampleView from './example-view.js';
import style from './example-section.css';

export default class ExampleSection extends LitComponent {
  static get components() {
    return {
      'e-code-snippet': CodeSnippet,
      'e-example-view': ExampleView,
    };
  }

  render() {
    return this.example
      ? html`
          <section class="example-columns">
            <div>
              <e-example-view
                .example="${this.example}"
                .componentName=${this.componentName}
              ></e-example-view>
            </div>
            <div>
              <e-code-snippet
                .example="${this.example}"
                .componentName=${this.componentName}
              ></e-code-snippet>
            </div>
          </section>
        `
      : html`
          ${nothing}
        `;
  }
}

definition('e-example-section', {
  style,
  props: {
    example: {
      type: Object,
      attribute: false,
      default: {},
    },
    componentName: {
      type: String,
      attribute: false,
      default: '',
    },
  },
})(ExampleSection);
