import { html, nothing, classMap } from '@eui/lit-component';
import { Tooltip } from '@eui/base';
import { Icon } from '@eui/theme';
import CONSTANTS from '../../constants.js';

const { SPACE_KEY, EXTERNAL_TYPE } = CONSTANTS;

const expandableItemMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this.handleArrowClick = this.handleArrowClick.bind(this);
    }

    static get components() {
      return {
        ...(super.components ?? {}),
        'eui-icon': Icon,
        'eui-tooltip': Tooltip,
        // 'e-list-item': ListItem, // ListItem can't be imported here as this mixin also used by ListItem, and it would create cyclic dependencies
      };
    }

    handleKeyboard(event) {
      super.handleKeyboard(event);
      if (event.key === SPACE_KEY) {
        // toggle expandable content
        this.handleArrowClick(event);
      }
    }

    _hasChildren() {
      const { children } = this;
      return children && children.length;
    }

    handleArrowClick(event) {
      event.stopPropagation();
      event.preventDefault();
      if (this._hasChildren()) {
        this.isExpanded = !this.isExpanded;
      }
    }

    renderExpandArrow() {
      const { i18n, isExpanded } = this;
      if (!this._hasChildren()) {
        return nothing;
      }

      return html`
        <eui-tooltip
          message=${isExpanded ? i18n.CONTRACT_ITEM : i18n.EXPAND_ITEM}
          position="top-end"
        >
          <eui-icon
            class=${classMap({ icon: true, pointer: true })}
            name=${isExpanded ? 'chevron-up' : 'chevron-down'}
            @click=${this.handleArrowClick}
          ></eui-icon>
        </eui-tooltip>
      `;
    }

    renderChildren(children) {
      return children.map((child) => {
        const isExternal = child.type === EXTERNAL_TYPE;
        return html`
          <e-list-item
            .displayName=${child.displayName}
            .appName=${child.name}
            .route=${child.route}
            .favoriteState=${child.favoriteState}
            .descriptionShort=${child.descriptionShort}
            .descriptionLong=${child.descriptionLong}
            .isExternal=${isExternal}
            is-child="true"
          ></e-list-item>
        `;
      });
    }
  };

export default expandableItemMixin;
