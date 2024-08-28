import { LitComponent, html, definition, nothing, repeat } from '@eui/lit-component';
import { Link } from '@eui/base';
import style from './card-container.css';

import AppCard from '../app-card/app-card.js';
import ProductCard from '../product-card/product-card.js';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';

import CONSTANTS from '../../constants.js';

import defaultI18n from './locale/en-us.json';

const { EXTERNAL_TYPE, LANDING_CARD_COUNT, COLLAPSED_CARD_COUNT } = CONSTANTS;

/**
 * Component CardContainer is defined as `<e-card-container>`.
 *
 * @class
 * @name CardContainer
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new CardContainer();
 *
 * // Declaratively create component
 * <e-card-container></e-card-container>
 */

class CardContainer extends i18nMixin(defaultI18n, LitComponent) {
  constructor() {
    super();
    this._toggleExpandedState = this._toggleExpandedState.bind(this);
    this.viewAllClickHandler = this.viewAllClickHandler.bind(this);
  }

  static get components() {
    return {
      'e-app-card': AppCard,
      'e-product-card': ProductCard,
      'eui-link': Link,
    };
  }

  get meta() {
    return import.meta;
  }

  renderCards(items) {
    const { isExpanded, isCompactView, showFavorite } = this;
    if (this.isExpandable && !isExpanded) {
      items = items.slice(0, COLLAPSED_CARD_COUNT);
    }

    return repeat(
      items,
      (item) => item.name,
      (item) => {
        if (this.isProducts) {
          return html`
            <e-product-card
              .route=${item.route}
              .productName=${item.name}
              .displayName=${item.displayName}
              .descriptionLong=${item.descriptionLong}
              .descriptionShort=${item.descriptionShort}
              .isCompactView=${isCompactView}
            ></e-product-card>
          `;
        }
        const isExternal = item.type === EXTERNAL_TYPE;
        return html`
          <e-app-card
            .appName=${item.name}
            .displayName=${item.displayName}
            .descriptionLong=${item.descriptionLong}
            .descriptionShort=${item.descriptionShort}
            .children=${item.childApps}
            .favoriteState=${item.favoriteState}
            .isExternal=${isExternal}
            .route=${item.route}
            .isCompactView=${isCompactView}
            .showFavorite=${showFavorite}
          ></e-app-card>
        `;
      },
    );
  }

  viewAllClickHandler(event) {
    this.bubble('handle-view-all-cards', event);
  }

  _toggleExpandedState() {
    this.isExpanded = !this.isExpanded;
  }

  render() {
    const { isExpanded, isRecentSection, i18n } = this;
    const expandLinkText = isExpanded ? i18n.COLLAPSE : i18n.EXPAND;
    const viewAllText = isRecentSection ? i18n.VIEW_ALL_APPS : i18n.VIEW_ALL;
    const viewAllLink =
      (this.limitNumberOfCards && this.items.length > LANDING_CARD_COUNT) || isRecentSection
        ? html`
            <span class="viewAllLink" @click=${this.viewAllClickHandler}>${viewAllText}</span>
          `
        : nothing;
    const items = this.limitNumberOfCards ? this.items.slice(0, LANDING_CARD_COUNT) : this.items;

    const expandLink =
      this.isExpandable && this.items.length > COLLAPSED_CARD_COUNT
        ? html`
            <eui-link
              subtle="true"
              @click=${this._toggleExpandedState}
              href="javascript:void(0)"
              class="expandLink"
            >
              ${expandLinkText}
            </eui-link>
          `
        : nothing;

    return html`
      <div class="container">
        <div class="groupContainer">
          <h3 class="groupName">${this.groupName}</h3>
          ${viewAllLink}
        </div>
        <div class="cardContainer">${this.renderCards(items)}</div>
        <div></div>
        ${expandLink}
      </div>
    `;
  }
}

definition('e-card-container', {
  style,
  props: {
    productName: {
      type: String,
      default: null,
      attribute: true,
    },
    groupName: {
      type: String,
      default: '',
      attribute: true,
    },
    isProducts: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    items: {
      type: Array,
      default: [],
      attribute: false,
    },
    limitNumberOfCards: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isExpandable: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isCompactView: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    isRecentSection: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    showFavorite: {
      type: Boolean,
      default: true,
      attribute: false,
    },
  },
})(CardContainer);

export default CardContainer;
