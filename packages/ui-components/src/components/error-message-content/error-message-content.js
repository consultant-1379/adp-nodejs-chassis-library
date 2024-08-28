/**
 * Component ErrorMessageContent is defined as `<e-error-message-content>`.
 *
 * @class
 * @name ErrorMessageContent
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component
 * let component = new ErrorMessageContent();
 *
 * // Declaratively create component
 * <e-error-message-content></e-error-message-content>
 */
import { LitComponent, html, definition, map } from '@eui/lit-component';
import style from './error-message-content.css';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';
import defaultI18n from './locale/en-us.json';

class ErrorMessageContent extends i18nMixin(defaultI18n, LitComponent) {
  get meta() {
    return import.meta;
  }

  render() {
    const { message, reasons, tryAgain } = this;

    const messageTemplate = message
      ? html`
          <div class="message">${message}</div>
        `
      : '';

    const reasonsTemplate =
      reasons?.length > 0
        ? html`
            <div class="reasons">
              <dl>
                <dt>${defaultI18n.POSSIBLE_REASONS}</dt>
                ${map(
                  reasons,
                  (reason) => html`
                    <dd>- ${reason}</dd>
                  `,
                )}
              </dl>
            </div>
          `
        : '';

    const tryAgainTemplate = tryAgain
      ? html`
          <div class="try">${defaultI18n.TRY_AGAIN}</div>
        `
      : '';

    return html`
      ${messageTemplate} ${reasonsTemplate} ${tryAgainTemplate}
    `;
  }
}

definition('e-error-message-content', {
  style,
  props: {
    message: {
      type: String,
      default: '',
      attribute: false,
    },
    reasons: {
      type: Object,
      default: {},
      attribute: false,
    },
    tryAgain: {
      type: Boolean,
      default: false,
      attribute: false,
    },
  },
})(ErrorMessageContent);

export default ErrorMessageContent;
