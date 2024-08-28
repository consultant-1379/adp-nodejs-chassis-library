import { LitComponent, html, definition, classMap, nothing } from '@eui/lit-component';
import BaseLink from '../base-link/base-link.js';
import CardMenu from '../card-menu/card-menu.js';
import CustomLayoutCard from '../custom-layout-card/custom-layout-card.js';
import ListItem from '../list-item/list-item.js';
import style from './app-card.css';

import appItemMixin from '../../mixins/appItemMixin/appItemMixin.js';
import expandableItemMixin from '../../mixins/expandableItemMixin/expandableItemMixin.js';
import baseItemMixin from '../../mixins/baseItemMixin/baseItemMixin.js';
import favoriteItemMixin from '../../mixins/favoriteItemMixin/favoriteItemMixin.js';
import infoIconMixin from '../../mixins/infoIconMixin/infoIconMixin.js';
import CONSTANTS from '../../constants.js';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';

import defaultI18n from './locale/en-us.json';

const { FAVORITE_STATE } = CONSTANTS;

let zIndex = 10;

/**
 * Component AppCard is defined as `<e-app-card>`.
 *
 * @class
 * @name AppCard
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new AppCard();
 *
 * // Declaratively create component
 * <e-app-card></<e-app-card>
 */

class AppCard extends i18nMixin(
  defaultI18n,
  appItemMixin(favoriteItemMixin(expandableItemMixin(infoIconMixin(baseItemMixin(LitComponent))))),
) {
  constructor() {
    super();
    this._closeAccordionWhenClickedOutside = this._closeAccordionWhenClickedOutside.bind(this);
  }

  static get components() {
    return {
      ...(super.components ?? {}),
      'e-base-link': BaseLink,
      'e-custom-layout-card': CustomLayoutCard,
      'e-card-menu': CardMenu,
      'e-list-item': ListItem, // needed for displaying children
    };
  }

  get meta() {
    return import.meta;
  }

  didChangeProps(changedProps) {
    if (changedProps.has('displayName')) {
      this.isExpanded = false;
    }
  }

  _calculateZIndex() {
    // Makes the last opened card the one on top.
    zIndex += 1;
    return zIndex;
  }

  renderActions() {
    const { favoriteState, descriptionLong, descriptionShort, showFavorite } = this;
    return html`
      ${this.renderTooltip(this.renderInfoIcon(), {
        descriptionShort,
        descriptionLong,
      })}
      ${showFavorite ? this.renderFavoriteIcon(favoriteState) : nothing}
    `;
  }

  handleItemClick() {
    this.shadowRoot.querySelector('e-base-link').triggerLink();
  }

  _closeAccordionWhenClickedOutside(event) {
    const card = this.shadowRoot.querySelector('e-base-link');
    if (!event.composedPath().includes(card)) {
      this.isExpanded = false;
    }
  }

  didConnect() {
    super.didConnect();
    document.addEventListener('mousedown', this._closeAccordionWhenClickedOutside);
  }

  didDisconnect() {
    super.didDisconnect();
    document.removeEventListener('mousedown', this._closeAccordionWhenClickedOutside);
  }

  render() {
    const {
      i18n,
      displayName,
      descriptionShort,
      isExternal,
      isExpanded,
      route,
      isCompactView,
      showFavorite,
      menuItems,
      children,
    } = this;
    const externalIconType = 'launch';
    const filteredMenuItems = showFavorite
      ? menuItems
      : menuItems.filter((menuItem) => menuItem.label !== i18n.FAVORITE);
    const customLayoutCardClass = classMap({ card: true, expanded: isExpanded, pointer: true });
    const customLayoutCardStyle = `z-index: ${isExpanded ? this._calculateZIndex() : 'auto'}`;
    const cardMenu = isCompactView
      ? html`
          <e-card-menu slot="action" .menuItems=${filteredMenuItems}></e-card-menu>
        `
      : html`
          <div slot="action" class="icons" position="top">${this.renderActions()}</div>
        `;
    return html`
      <e-base-link url="${route}" @click="${this.handleLinkClick}" ?new-tab="${isExternal}">
        <e-custom-layout-card
          slot="content"
          class=${customLayoutCardClass}
          style=${customLayoutCardStyle}
          @keydown=${this.handleKeyboard}
          card-title=${displayName}
          subtitle=${isExpanded || isCompactView ? '' : descriptionShort}
          title-icon-name=${isExternal ? i18n.EXTERNAL_APP_TOOLTIP : ''}
          title-icon-type=${isExternal ? externalIconType : ''}
          has-accordion-holder
          tabindex="0"
          .isCompactView=${isCompactView}
        >
          <div slot="accordion" class="accordion" position="top">${this.renderExpandArrow()}</div>
          ${cardMenu}
          <div slot="content">
            <div class=${classMap({ expandContainer: true, hidden: !isExpanded })}>
              ${this.renderChildren(children)}
            </div>
          </div>
        </e-custom-layout-card>
      </e-base-link>
    `;
  }
}

definition('e-app-card', {
  style,
  props: {
    appName: {
      type: String,
      default: '',
      attribute: false,
    },
    route: {
      type: String,
      default: '',
      attribute: false,
    },
    favoriteState: {
      type: String,
      default: FAVORITE_STATE.NOT_FAVORITE,
      attribute: true,
    },
    descriptionLong: {
      type: String,
      default: '',
      attribute: true,
    },
    descriptionShort: {
      type: String,
      default: '',
      attribute: true,
    },
    displayName: {
      type: String,
      default: '',
      attribute: true,
    },
    isExternal: {
      type: Boolean,
      default: true,
      attribute: true,
    },
    isExpanded: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    children: {
      type: Array,
      default: [],
      attribute: false,
    },
    isInfoVisible: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isCompactView: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    showFavorite: {
      type: Boolean,
      default: true,
      attribute: false,
    },
  },
})(AppCard);

export default AppCard;
