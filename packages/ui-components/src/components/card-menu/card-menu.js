import { LitComponent, html, definition, nothing } from '@eui/lit-component';
import { MenuItem, Menu, Tooltip } from '@eui/base';
import { Icon } from '@eui/theme';
import style from './card-menu.css';

/**
 * Component is defined as `<e-card-menu>`.
 *
 * @class
 * @name CardMenu
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new CardMenu();
 *
 * // Declaratively create component
 * <e-card-menu></e-card-menu>
 */

class CardMenu extends LitComponent {
  constructor() {
    super();
    this.showPopup = {};
    this.handleIconClick = this.handleIconClick.bind(this);
    this.tooltipHandler = this.tooltipHandler.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
    this._closeMenuWhenClickedOutside = this._closeMenuWhenClickedOutside.bind(this);
  }

  static get components() {
    return {
      'eui-menu': Menu,
      'eui-menu-item': MenuItem,
      'eui-icon': Icon,
      'eui-tooltip': Tooltip,
    };
  }

  handleIconClick(event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.showMenu) {
      this.showMenu = false;
      this.showPopup = {};
    } else {
      this.showMenu = true;
    }

    if (this.isTouchZoomActive()) {
      this._setMenuPositionOnZoom();
    } else {
      this._setMenuPosition();
    }
  }

  isTouchZoomActive() {
    // windows.innerWidth and innerHeight varies with zoom on touch devices
    const { clientHeight, clientWidth } = document.documentElement;
    const { innerHeight, innerWidth } = window;
    return clientHeight / innerHeight > 1 && clientWidth / innerWidth > 1;
  }

  _setMenuPosition() {
    const { x, y, height, width } = this.getBoundingClientRect();
    this.position = {
      x,
      y: y + height,
      height,
      width,
    };
  }

  _setMenuPositionOnZoom() {
    const box = this.getBoundingClientRect();
    const { body, documentElement: docEl } = document;
    const scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.scrollX || docEl.scrollLeft || body.scrollLeft;
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;
    this.position = {
      x: left,
      y: top + box.height,
      height: box.height,
      width: box.width,
    };
  }

  _isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  tooltipHandler(event, index, menuItem) {
    event.stopPropagation();
    event.preventDefault();
    this.showPopup = this._isEmptyObject(this.showPopup)
      ? {
          index,
          menuItem,
        }
      : {};
  }

  _renderMenuItems() {
    return this.menuItems.map((menuItem, index) =>
      menuItem.icon
        ? html`
            <eui-menu-item
              class="menu-item-title"
              label=${menuItem.label}
              @click=${menuItem.icon.clickHandler}
            >
              <eui-icon
                slot="left"
                name=${menuItem.icon.name}
                color=${menuItem.icon.color}
                @click=${menuItem.icon.clickHandler}
              ></eui-icon>
            </eui-menu-item>
          `
        : html`
            <eui-menu-item
              class="menu-item-title"
              label=${menuItem.label}
              @click=${(event) => this.tooltipHandler(event, index, menuItem)}
            >
              <eui-icon
                slot="left"
                name="info"
                @click=${(event) => this.tooltipHandler(event, index, menuItem)}
              ></eui-icon>
            </eui-menu-item>
          `,
    );
  }

  get tooltipMenuLabels() {
    return this.menuItems.filter((menuItem) => menuItem.tooltip).map((menuItem) => menuItem.label);
  }

  handleMenuItemClick(event) {
    const { menuItems } = event.detail;
    const menuItem = menuItems[0];
    this.showMenu = false;
    setTimeout(() => {
      this.showMenu = this.tooltipMenuLabels.includes(menuItem.label);
    }, 10);
  }

  determineMenuOvershoot(menuWidth) {
    const buffer = 16;
    const { x = 0 } = this.position;
    const { width = 0 } = this.position;

    const rightOvershoot = x + menuWidth + buffer - window.innerWidth;

    const leftOvershoot = x + width - buffer - menuWidth;

    let alignRight = true;

    if (rightOvershoot !== leftOvershoot * -1 && rightOvershoot > 0) {
      alignRight = rightOvershoot < leftOvershoot * -1;
    }

    return alignRight;
  }

  calculateTopValue(menuOffsetHeight, top, menuItemIndex) {
    const menuItemHeight = 34;
    const appCardHeight = 36;
    let calculatedTop;
    if (top + menuOffsetHeight + 8 > window.innerHeight) {
      calculatedTop = `${top - appCardHeight - (menuItemIndex + 1) * menuItemHeight}px`;
    } else {
      calculatedTop = `${top + (menuItemIndex + 1) * menuItemHeight}px`;
    }
    return calculatedTop;
  }

  didRender() {
    if (!this._isEmptyObject(this.showPopup) && this.showMenu) {
      const menuIconWidth = 16;
      const tooltip = this.shadowRoot.querySelector('eui-tooltip');
      const menu = this.shadowRoot.querySelector('eui-menu');
      const boundingRect = menu.getBoundingClientRect();
      const isMenuAlignedRight = this.determineMenuOvershoot(boundingRect.width);

      let { left } = boundingRect;
      const menuHalfWidth = boundingRect.width / 2;

      if (isMenuAlignedRight) {
        left += menuHalfWidth;
      } else {
        left = left - menuHalfWidth + menuIconWidth;
      }

      tooltip.style['z-index'] = 1501;
      tooltip.style.position = 'fixed';
      tooltip.style.top = this.calculateTopValue(
        menu.offsetHeight,
        boundingRect.top,
        this.showPopup.index,
      );
      tooltip.style.left = `${left}px`;
      tooltip.style.display = 'block';
    }
  }

  renderTooltip() {
    const { tooltip } = this.showPopup.menuItem;
    return html`
      <eui-tooltip class="card-menu-tooltip" visible="always" position="bottom-end">
        ${tooltip.content ?? nothing}
      </eui-tooltip>
    `;
  }

  didConnect() {
    const { _closeMenuWhenClickedOutside } = this;
    document.addEventListener('mousedown', _closeMenuWhenClickedOutside);
    document.addEventListener('wheel', _closeMenuWhenClickedOutside);
    window.addEventListener('resize', _closeMenuWhenClickedOutside);
    document.addEventListener('touchend', _closeMenuWhenClickedOutside);
    document.addEventListener('touchmove', _closeMenuWhenClickedOutside);
    document.addEventListener('scroll', _closeMenuWhenClickedOutside);
  }

  didDisconnect() {
    const { _closeMenuWhenClickedOutside } = this;
    document.removeEventListener('mousedown', _closeMenuWhenClickedOutside);
    document.removeEventListener('wheel', _closeMenuWhenClickedOutside);
    window.removeEventListener('resize', _closeMenuWhenClickedOutside);
    document.removeEventListener('touchend', _closeMenuWhenClickedOutside);
    document.removeEventListener('touchmove', _closeMenuWhenClickedOutside);
    document.removeEventListener('scroll', _closeMenuWhenClickedOutside);
  }

  _closeMenuWhenClickedOutside(event) {
    const menu = this.shadowRoot.querySelector('eui-menu');
    const menuIcon = this.shadowRoot.querySelector('#menu-icon');
    if (!event.composedPath().includes(menu) && !event.composedPath().includes(menuIcon)) {
      this.showMenu = false;
      this.showPopup = {};
    }
  }

  render() {
    const { handleIconClick, handleMenuItemClick, showMenu, showPopup, position } = this;

    return html`
      <eui-icon id="menu-icon" name="more" @click=${handleIconClick}></eui-icon>
      <eui-menu .show=${showMenu} .position=${position} @eui-menu:click=${handleMenuItemClick}>
        ${this._renderMenuItems()}
      </eui-menu>
      ${this._isEmptyObject(showPopup) ? nothing : this.renderTooltip()}
    `;
  }
}

definition('e-card-menu', {
  style,
  props: {
    menuItems: {
      type: Array,
      default: [],
      attribute: false,
    },
    showMenu: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    showPopup: {
      type: Object,
      default: {},
      attribute: false,
    },
  },
})(CardMenu);

export default CardMenu;
