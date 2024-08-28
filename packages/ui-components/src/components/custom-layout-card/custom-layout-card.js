import { definition } from '@eui/lit-component';
import { Card } from '@eui/layout';
import { Icon } from '@eui/theme';
import { Tooltip } from '@eui/base';
import style from './custom-layout-card.css';

/**
 * Component is defined as `<e-custom-layout-card>`.
 *
 * @class
 * @name CustomLayoutCard
 * @extends Card
 *
 * @example
 * // Imperatively create component.
 * let component = new CustomLayoutCard();
 *
 * // Declaratively create component
 * <e-custom-layout-card></e-custom-layout-card>
 */
class CustomLayoutCard extends Card {
  static get components() {
    return {
      'eui-tooltip': Tooltip,
      'eui-icon': Icon,
    };
  }

  renderTitle() {
    this.titleElement = this.root.querySelector('.eui__card__title');

    if (this.titleIconType) {
      this.titleElement.innerHTML = this._renderExternalIcon();
    } else {
      this.titleElement.innerHTML = `
        <div class="titleWithIcon">
          <eui-tooltip class="cardTitle" message="${this.cardTitle}" position="top-end" smart>
            <span class="title-message">${this.cardTitle}</span>
          </eui-tooltip>
        </div>
      `;
    }
  }

  renderSubtitle() {
    const subtitleElement = this.root.querySelector('.eui__card__subtitle');
    subtitleElement.classList.add('embedded_subtitle');
  }

  renderAccordionHolder() {
    const ACCORDION_CLASS = 'eui__card__accordion';
    const header = this.root.querySelector('.eui__card__header');
    const accordion = header.querySelector(`.${ACCORDION_CLASS}`);

    if (accordion) {
      accordion.parentNode.removeChild(accordion);
    }

    header.innerHTML = `
      <div class=${ACCORDION_CLASS}>
        <slot name="accordion"></slot>
      </div>
      ${header.innerHTML}
    `;
  }

  renderProductIconHolder() {
    const ICON_CLASS = 'eui__card__icon__holder';
    const card = this.root.querySelector('.eui__card');
    const iconHolder = card.querySelector(`.${ICON_CLASS}`);

    if (iconHolder) {
      iconHolder.parentNode.removeChild(iconHolder);
    }

    card.classList.add('cardGrid');

    card.innerHTML = `
      <div class="column">
        <div class=${ICON_CLASS}>
          <slot name="product__icon"></slot>
        </div>
      </div>
      <div class="column">
        ${card.innerHTML}
      </div>
    `;
  }

  _renderExternalIcon() {
    return `
      <div class="titleWithIcon">
        <eui-tooltip class="cardTitle" message="${this.cardTitle}" position="top-end" smart>
          <span>${this.cardTitle}</span>
        </eui-tooltip>
        <eui-tooltip message="${this.titleIconName}" position="top-end">
          <eui-icon class="titleIcon" name="${this.titleIconType}"></eui-icon>
        </eui-tooltip>
      </div>
    `;
  }

  didUpgrade() {
    super.didUpgrade();

    if (this.cardTitle) {
      this.renderTitle();
    }

    if (this.embedSubTitle) {
      this.renderSubtitle();
    }

    if (this.hasAccordionHolder) {
      this.renderAccordionHolder();
    }

    if (this.hasProductIconHolder) {
      this.renderProductIconHolder();
    }
  }

  didChangeProps(changedProps) {
    super.didChangeProps(changedProps);

    if (changedProps.has('cardTitle') || changedProps.has('titleIconType')) {
      this.renderTitle();
    }

    if (changedProps.has('embedSubTitle')) {
      this.renderSubtitle();
    }

    if (changedProps.has('hasAccordionHolder')) {
      this.renderAccordionHolder();
    }

    if (changedProps.has('hasProductIconHolder')) {
      this.renderProductIconHolder();
    }
  }
}

definition('e-custom-layout-card', {
  style,
  props: {
    cardTitle: { attribute: true, type: String },
    titleIconType: { attribute: true, default: '', type: String },
    titleIconName: { attribute: true, default: '', type: String },
    hasAccordionHolder: { attribute: true, default: false, type: Boolean },
    hasProductIconHolder: { attribute: true, default: false, type: Boolean },
    embedSubTitle: { attribute: true, default: false, type: Boolean },
    isCompactView: { attribute: true, default: false, type: Boolean },
  },
})(CustomLayoutCard);

export default CustomLayoutCard;
