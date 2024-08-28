/**
 * Component ErrorMessage is defined as `<e-error-message>`.
 *
 * @class
 * @name ErrorMessage
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component
 * let component = new ErrorMessage();
 *
 * // Declaratively create component
 * <e-error-message></e-error-message>
 */
import { LitComponent, html, definition } from '@eui/lit-component';
import { Icon } from '@eui/theme';
import style from './error-message.css';

class ErrorMessage extends LitComponent {
  static get components() {
    return {
      'eui-icon': Icon,
    };
  }

  render() {
    const { title } = this;

    return html`
      <div id="container">
        <div class="title">
          <eui-icon name="cross" color="red" size="18pt"></eui-icon>
          ${title}
        </div>
        <div><slot name="content"></slot></div>
      </div>
    `;
  }
}

definition('e-error-message', {
  style,
  props: {
    title: {
      type: String,
      default: '',
      attribute: false,
    },
  },
})(ErrorMessage);

export default ErrorMessage;
