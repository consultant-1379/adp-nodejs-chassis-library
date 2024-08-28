import { LitComponent, html, definition, nothing, classMap } from '@eui/lit-component';
import style from './list-item.css';

import appItemMixin from '../../mixins/appItemMixin/appItemMixin.js';
import favoriteItemMixin from '../../mixins/favoriteItemMixin/favoriteItemMixin.js';
import expandableItemMixin from '../../mixins/expandableItemMixin/expandableItemMixin.js';
import baseItemMixin from '../../mixins/baseItemMixin/baseItemMixin.js';
import infoIconMixin from '../../mixins/infoIconMixin/infoIconMixin.js';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';
import CONSTANTS from '../../constants.js';
import CardMenu from '../card-menu/card-menu.js';
import BaseLink from '../base-link/base-link.js';

import defaultI18n from './locale/en-us.json';

const { FAVORITE_STATE } = CONSTANTS;

/**
 * Component ListItem is defined as `<e-list-item>`.
 *
 * @class
 * @name ListItem
 * @extends LitComponent
 *
 *
 * @example
 * //Imperatively create component.
 * let component = new ListItem();
 *
 * //Declaratively create component
 * <e-list-item></e-list-item>
 */

class ListItem extends i18nMixin(
  defaultI18n,
  appItemMixin(favoriteItemMixin(expandableItemMixin(infoIconMixin(baseItemMixin(LitComponent))))),
) {
  static get components() {
    return {
      ...(super.components ?? {}),
      'e-card-menu': CardMenu,
      'e-base-link': BaseLink,
      'e-list-item': ListItem, // needed for displaying children
    };
  }

  didChangeProps(changedProps) {
    if (changedProps.has('displayName')) {
      this.isExpanded = false;
    }
  }

  get meta() {
    return import.meta;
  }

  renderTitleWithTooltip() {
    const { displayName, descriptionShort, descriptionLong, isChild, isCompactView } = this;
    const displayNameSpan = html`
      <span class="child-title">${displayName}</span>
    `;
    return html`
      <div class="title pointer">
        ${isChild
          ? this.renderTooltip(displayNameSpan, {
              descriptionShort,
              descriptionLong,
            })
          : displayName}
        ${this.renderExternalIcon()}
      </div>
      <span class="subtitle">${!isCompactView && !isChild ? descriptionShort : ''}</span>
    `;
  }

  handleItemClick() {
    this.shadowRoot.querySelector('e-base-link').triggerLink();
  }

  renderIcons() {
    const { descriptionShort, descriptionLong, favoriteState, isChild, showFavorite } = this;
    return html`
      <div class="icons">
        ${isChild
          ? nothing
          : this.renderTooltip(this.renderInfoIcon(), {
              descriptionShort,
              descriptionLong,
            })}
        ${showFavorite ? this.renderFavoriteIcon(favoriteState) : nothing}
      </div>
    `;
  }

  renderMenu() {
    const { i18n, menuItems, showFavorite } = this;
    const filteredMenuItems = showFavorite
      ? menuItems
      : menuItems.filter((menuItem) => menuItem.label !== i18n.FAVORITE);
    return html`
      <e-card-menu slot="action" .menuItems=${filteredMenuItems}></e-card-menu>
    `;
  }

  render() {
    const { isExpanded, isExternal, isCompactView, isChild, route, children } = this;
    return html`
      <e-base-link url="${route}" @click="${this.handleLinkClick}" ?new-tab="${isExternal}">
        <div
          class="item-container ${classMap({ isChild })}"
          @keydown=${this.handleKeyboard}
          tabindex="0"
          slot="content"
        >
          <div class="header ${classMap({ isChild })}">
            <div class="accordion">${this.renderExpandArrow()}</div>
            ${this.renderTitleWithTooltip()}
            ${isCompactView ? this.renderMenu() : this.renderIcons()}
          </div>
          <div slot="content">
            <div class=${classMap({ expandContainer: true, hidden: !isExpanded })}>
              ${this.renderChildren(children)}
            </div>
          </div>
      </e-base-link>
    `;
  }
}

definition('e-list-item', {
  style,
  props: {
    appName: {
      type: String,
      default: '',
      attribute: true,
    },
    displayName: {
      type: String,
      default: '',
      attribute: true,
    },
    descriptionShort: {
      type: String,
      default: '',
      attribute: true,
    },
    descriptionLong: {
      type: String,
      default: '',
      attribute: true,
    },
    route: {
      type: String,
      default: '',
      attribute: true,
    },
    isExternal: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isExpanded: {
      type: Boolean,
      attribute: false,
    },
    favoriteState: {
      type: String,
      default: FAVORITE_STATE.NOT_FAVORITE,
      attribute: true,
    },
    children: {
      type: Array,
      default: [],
      attribute: false,
    },
    isChild: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isInfoVisible: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isCompactView: {
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
})(ListItem);

export default ListItem;
