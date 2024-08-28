import { LitComponent, html, definition, repeat } from '@eui/lit-component';
import style from './list-container.css';
import ListItem from '../list-item/list-item.js';
import CONSTANTS from '../../constants.js';

const { EXTERNAL_TYPE } = CONSTANTS;

/**
 * Component ListContainer is defined as `<e-list-container>`.
 *
 * @class
 * @name ListContainer
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new ListContainer();
 *
 * // Declaratively create component
 * <e-list-container></e-list-container>
 */

class ListContainer extends LitComponent {
  static get components() {
    return {
      'e-list-item': ListItem,
    };
  }

  renderList(items) {
    const { productName, isCompactView, showFavorite } = this;
    return repeat(
      items,
      (item) => item.name,
      (item) => {
        const isExternal = item.type === EXTERNAL_TYPE;
        return html`
          <e-list-item
            product-name=${productName}
            app-name=${item.name}
            display-name=${item.displayName}
            description-short=${item?.descriptionShort ?? ''}
            description-long=${item?.descriptionLong ?? ''}
            route=${item?.route}
            .children=${item.childApps}
            .favoriteState=${item.favoriteState}
            .isCompactView=${isCompactView}
            ?is-external=${isExternal}
            .showFavorite=${showFavorite}
          ></e-list-item>
        `;
      },
    );
  }

  render() {
    const { groupName, items } = this;
    return html`
      <div class="container">
        <div class="group-name">${groupName}</div>
        <div class="list-container">${this.renderList(items)}</div>
        <div></div>
      </div>
    `;
  }
}

definition('e-list-container', {
  style,
  props: {
    groupName: {
      type: String,
      default: '',
      attribute: true,
    },
    items: {
      type: Array,
      default: [],
      attribute: false,
    },
    productName: {
      type: String,
      default: null,
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
})(ListContainer);

export default ListContainer;
