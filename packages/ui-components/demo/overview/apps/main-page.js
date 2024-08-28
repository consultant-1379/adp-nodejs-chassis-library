import { App, html, definition } from '@eui/app';
import ComponentView from '../components/component-view.js';
import style from './main-page.css';

export default class MainPage extends App {
  static get components() {
    return {
      'e-component-view': ComponentView,
    };
  }

  async didConnect() {
    this.componentName = this.metaData.isComponent ? this.metaData.name : null;
    this.bubble('app:title', { displayName: this.metaData.displayName });
  }

  render() {
    const content = !this.componentName
      ? html`
          <div>Choose a component to see its description</div>
        `
      : html`
          <e-component-view
            .componentName=${this.componentName}
            .metaData=${this.metaData}
          ></e-component-view>
        `;

    return html`
      <div class="content_wrap">${content}</div>
    `;
  }
}

definition('e-main-page', {
  style,
  props: {
    componentName: {
      type: String,
      default: null,
      attribute: false,
    },
    displayName: {
      type: String,
      default: null,
      attribute: false,
    },
  },
})(MainPage);

MainPage.register();
