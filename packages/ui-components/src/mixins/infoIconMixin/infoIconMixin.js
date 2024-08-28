import { html, classMap } from '@eui/lit-component';
import { Tooltip } from '@eui/base';
import { Icon } from '@eui/theme';
import CONSTANTS from '../../constants.js';

const { I_KEY } = CONSTANTS;

const infoIconMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this.hasInfoIcon = false;
      this.handleInfoClick = this.handleInfoClick.bind(this);
    }

    static get components() {
      return {
        ...(super.components ?? {}),
        'eui-icon': Icon,
        'eui-tooltip': Tooltip,
      };
    }

    handleKeyboard(event) {
      super.handleKeyboard(event);
      if (event.key === I_KEY) {
        // toggle info tooltip
        this.handleInfoClick(event);
      }
    }

    renderTooltip(component, { descriptionShort, descriptionLong }) {
      const tooltipVisible = this.isInfoVisible ? 'always' : 'never';
      return html`
        <eui-tooltip
          class="tooltip"
          visible=${this.hasInfoIcon ? tooltipVisible : undefined}
          position="bottom-end"
        >
          ${component} ${this.renderTooltipContent(descriptionShort, descriptionLong)}
        </eui-tooltip>
      `;
    }

    renderTooltipContent(descriptionShort, descriptionLong) {
      const { i18n } = this;
      if (!descriptionShort && !descriptionLong) {
        descriptionShort = i18n.NO_DETAILS;
      }
      return html`
        <div slot="message" class="message subtitle">${descriptionShort}</div>
        <div slot="message" class="message description">${descriptionLong}</div>
      `;
    }

    handleInfoClick(event) {
      event.stopPropagation();
      event.preventDefault();
      this.isInfoVisible = !this.isInfoVisible;
    }

    didConnect() {
      super.didConnect();
      this.addEventListener('blur', () => {
        this.isInfoVisible = false;
      });
    }

    _renderIcon() {
      const { handleInfoClick } = this;
      return html`
        <eui-icon
          class=${classMap({ icon: true, pointer: true })}
          name="info"
          @click=${handleInfoClick}
        ></eui-icon>
      `;
    }

    renderInfoIcon() {
      const { i18n, isInfoVisible } = this;
      this.hasInfoIcon = true;

      if (isInfoVisible) {
        return this._renderIcon();
      }

      return html`
        <eui-tooltip
          message=${i18n.MORE_INFO_TOOLTIP}
          visible=${isInfoVisible ? 'never' : undefined}
          position="top-end"
        >
          ${this._renderIcon()}
        </eui-tooltip>
      `;
    }
  };

export default infoIconMixin;
