import { LitComponent, html, definition, classMap } from '@eui/lit-component';
import { Icon } from '@eui/theme';
import BaseLink from '../base-link/base-link.js';
import CustomLayoutCard from '../custom-layout-card/custom-layout-card.js';
import style from './product-card.css';

import baseItemMixin from '../../mixins/baseItemMixin/baseItemMixin.js';

/**
 * Component ProductCard is defined as `<e-product-card>`.
 *
 * @class
 * @name ProductCard
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new ProductCard();
 *
 * // Declaratively create component
 * <e-product-card></e-product-card>
 */

class ProductCard extends baseItemMixin(LitComponent) {
  constructor() {
    super();
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  static get components() {
    return {
      'eui-icon': Icon,
      'e-custom-layout-card': CustomLayoutCard,
      'e-base-link': BaseLink,
    };
  }

  render() {
    const { displayName, descriptionShort, route, handleItemClick, isCompactView } = this;
    return html`
      <e-base-link url="${route}">
        <e-custom-layout-card
          slot="content"
          class=${classMap({ card: true })}
          @keydown=${this.handleKeyboard}
          @click=${handleItemClick}
          card-title=${displayName}
          subtitle=${isCompactView ? '' : descriptionShort}
          has-product-icon-holder
          embed-sub-title
          tabindex="0"
          .isCompactView=${isCompactView}
        >
          <div
            slot="product__icon"
            class=${classMap({
              'productIconHolder-compact': isCompactView,
              productIconHolder: true,
            })}
          >
            <eui-icon
              name="network"
              class="productIcon"
              size=${isCompactView ? '18px' : '42px'}
              color="#f2f2f2"
            ></eui-icon>
          </div>
        </e-custom-layout-card>
      </e-base-link>
    `;
  }

  handleItemClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const { productName } = this;
    this.bubble('product-selected', productName);
  }
}

definition('e-product-card', {
  style,
  props: {
    productName: {
      type: String,
      default: '',
      attribute: true,
    },
    route: {
      type: String,
      default: '',
      attribute: true,
    },
    descriptionShort: {
      type: String,
      default: '',
      attribute: true,
    },
    isCompactView: {
      type: Boolean,
      default: false,
      attribute: true,
    },
  },
})(ProductCard);

export default ProductCard;
