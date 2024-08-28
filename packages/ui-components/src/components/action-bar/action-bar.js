/**
 * Component ActionBar is defined as `<e-action-bar>`.
 *
 * @class
 * @name ActionBar
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component
 * let component = new ActionBar();
 *
 * // Declaratively create component
 * <e-action-bar></e-action-bar>
 */

import { LitComponent, html, definition, nothing, ref, createRef } from '@eui/lit-component';
import { Pill, MenuItem, Dropdown } from '@eui/base';
import { Icon } from '@eui/theme';
import style from './action-bar.css';

import SearchComponent from '../search-component/search-component';
import IconDropdown from '../icon-dropdown/icon-dropdown';
import CONSTANTS from '../../constants.js';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';

import defaultI18n from './locale/en-us.json';

const { FOCUS_SEARCH_BAR_EVENT, VIEW_TYPE, GROUPPING_TYPE } = CONSTANTS;

class ActionBar extends i18nMixin(defaultI18n, LitComponent) {
  constructor() {
    super();
    this.searchComponentRef = createRef();
    this.handleShowFavoritesOnlyChange = this.handleShowFavoritesOnlyChange.bind(this);
    this.handleGroupingTypeChange = this.handleGroupingTypeChange.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
    this.handleComboBoxSelection = this.handleComboBoxSelection.bind(this);
    this.focusSearchBarEventHandler = this.focusSearchBarEventHandler.bind(this);
  }

  static get components() {
    return {
      'eui-pill': Pill,
      'eui-menu-item': MenuItem,
      'eui-dropdown': Dropdown,
      'eui-icon': Icon,
      'e-icon-dropdown': IconDropdown,
      'e-search-component': SearchComponent,
    };
  }

  get meta() {
    return import.meta;
  }

  renderControls() {
    return html`
      <div class="controls">
        ${this.renderFavoritePill()} ${this.renderGroupingTypeDropdown()}
        ${this.renderViewTypeDropdown()}
      </div>
    `;
  }

  handleShowFavoritesOnlyChange(event) {
    this.bubble('handle-favorites-change', event.detail);
  }

  handleKeyboard(event) {
    this.bubble('handle-keyboard', event);
  }

  handleGroupingTypeChange(event) {
    this.bubble('handle-grouping-change', event.detail);
  }

  handleViewTypeChange(event) {
    this.bubble('handle-view-change', event.detail);
  }

  renderFavoritePill() {
    const { showFavorite, showFavoritesOnly, i18n } = this;
    if (!showFavorite) {
      return nothing;
    }
    return html`
      <eui-pill
        class="favorite-pill"
        icon="favorite-solid"
        color="var(--yellow-43)"
        ?unselected=${!showFavoritesOnly}
        @click=${this.handleShowFavoritesOnlyChange}
        @keydown=${this.handleKeyboard}
      >
        ${i18n.FAVORITES}
      </eui-pill>
    `;
  }

  renderGroupingTypeDropdown() {
    const { showGroupingType, groupingType, i18n } = this;
    if (!showGroupingType) {
      return nothing;
    }
    const groupingTypes = [
      {
        value: GROUPPING_TYPE.CATEGORY,
        label: i18n.CATEGORIES,
      },
      {
        value: GROUPPING_TYPE.ALPHABETICAL,
        label: i18n.ALPHABETICAL,
      },
    ];

    const groupingMenuItems = groupingTypes.map(
      (type) => html`
        <eui-menu-item
          label=${type.label}
          value=${type.value}
          ?selected=${type.value === groupingType}
        ></eui-menu-item>
      `,
    );
    const selectedLabel = groupingTypes.find((item) => item.value === groupingType)?.label;
    return html`
      <div class="groupingType-dropdown">
        <eui-dropdown
          @eui-dropdown:change=${this.handleGroupingTypeChange}
          label=${selectedLabel}
          data-type="single"
          width="120px"
        >
          ${groupingMenuItems}
        </eui-dropdown>
      </div>
    `;
  }

  renderViewTypeDropdown() {
    const { viewType, i18n } = this;
    const viewMenuItems = [
      {
        label: i18n.TILES,
        icon: 'view-tiles',
        value: VIEW_TYPE.TILE,
      },
      {
        label: i18n.LIST,
        icon: 'view-list',
        value: VIEW_TYPE.LIST,
      },
    ].map(
      (type) => html`
        <eui-menu-item
          label=${type.label}
          label-icon=${type.icon}
          ?selected=${type.value === viewType}
          value=${type.value}
        >
          <eui-icon class="item-icon" slot="left" name=${type.icon}></eui-icon>
        </eui-menu-item>
      `,
    );
    return html`
      <e-icon-dropdown
        @eui-dropdown:change=${this.handleViewTypeChange}
        class="viewType-dropdown"
        data-type="single"
        width="65px"
      >
        ${viewMenuItems}
      </e-icon-dropdown>
    `;
  }

  handleComboBoxSelection(event) {
    this.bubble('handle-search-selection', event.detail);
  }

  didConnect() {
    super.didConnect();
    const { focusSearchBarEventHandler } = this;
    this.addEventListener(FOCUS_SEARCH_BAR_EVENT, focusSearchBarEventHandler);
  }

  didDisconnect() {
    super.didDisconnect();
    const { focusSearchBarEventHandler } = this;
    this.removeEventListener(FOCUS_SEARCH_BAR_EVENT, focusSearchBarEventHandler);
  }

  focusSearchBarEventHandler() {
    const { searchComponentRef } = this;
    searchComponentRef.value.dispatchEvent(new Event(FOCUS_SEARCH_BAR_EVENT));
  }

  renderSearchComponent() {
    const { data, searchComponentRef } = this;
    return html`
      <div class="search-item">
        <e-search-component
          ${ref(searchComponentRef)}
          class="search-component"
          .data=${data}
          @handle-combobox-selection=${this.handleComboBoxSelection}
        ></e-search-component>
      </div>
    `;
  }

  render() {
    const { isProductView, isSearchable } = this;
    return html`
      <div class="box">
        ${isSearchable ? this.renderSearchComponent() : nothing}
        <div class="control-item">${isProductView ? nothing : this.renderControls()}</div>
      </div>
    `;
  }
}

definition('e-action-bar', {
  style,
  props: {
    data: {
      type: Array,
      default: [],
      attribute: false,
    },
    isCompactView: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isProductView: {
      type: Boolean,
      default: false,
      attribute: true,
    },
    isSearchable: {
      type: Boolean,
      default: true,
      attribute: true,
    },
    groupingType: {
      type: String,
      default: null,
      attribute: true,
    },
    showFavoritesOnly: {
      type: Boolean,
      default: false,
      attribute: false,
    },
    showFavorite: {
      type: Boolean,
      default: true,
      attribute: false,
    },
    showGroupingType: {
      type: Boolean,
      default: true,
      attribute: false,
    },
  },
})(ActionBar);

export default ActionBar;
