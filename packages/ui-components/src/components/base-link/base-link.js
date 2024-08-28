import { LitComponent, html, definition } from '@eui/lit-component';
import style from './base-link.css';

/**
 * Component is defined as `<e-base-link>`.
 *
 * @class
 * @name BaseLink
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new BaseLink();
 *
 * // Declaratively create component
 * <e-base-link></e-base-link>
 */

class BaseLink extends LitComponent {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.triggerLink = this.triggerLink.bind(this);
  }

  render() {
    const { url, newTab } = this;
    return html`
      <a
        href="${url}"
        tabindex="-1"
        draggable="false"
        target="${newTab ? '_blank' : '_self'}"
        @click=${this.handleClick}
      >
        <slot name="content"></slot>
      </a>
    `;
  }

  handleClick(event) {
    if (window.getSelection().toString()) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
    return true;
  }

  triggerLink() {
    this.shadowRoot.querySelector('a').click();
  }
}

definition('e-base-link', {
  style,
  props: {
    url: {
      type: String,
      default: '',
      attribute: true,
    },
    newTab: {
      type: Boolean,
      default: false,
      attribute: true,
    },
  },
})(BaseLink);

export default BaseLink;
