/**
 * Component IconDropdown is defined as `<e-icon-dropdown>`.
 *
 * @class
 * @name IconDropdown
 * @extends Dropdown
 *
 * @example
 * // Imperatively create component
 * let component = new IconDropdown();
 *
 * // Declaratively create component
 * <e-icon-dropdown></e-icon-dropdown>
 */

import { definition, styleMap, html, ifDefined, nothing } from '@eui/lit-component';
import { Dropdown } from '@eui/base';
import style from './icon-dropdown.css';

class IconDropdown extends Dropdown {
  _renderLabelIcon() {
    const { labelIcon } = this;
    return html`
      <eui-icon class="label-icon" name=${labelIcon}></eui-icon>
    `;
  }

  /**
   * Set dropdown label icon.
   */
  _setDropdownLabel() {
    if (this.value && this.value[0]) {
      this.labelIcon = this.value[0].getAttribute('label-icon');
    } else {
      this.labelIcon = 'view-tiles';
    }
  }

  render() {
    const inlineWidth = this.width ? `${this.width}` : '';
    // &nbsp; in eui-button is used to stabilize the height of the button with font-size
    // and line-height
    const dropdownButton = this.more
      ? html`
          <eui-actionable-icon
            tabindex="0"
            class="more menu-button"
            name="more"
            @click="${this._toggleDropdownMenu}"
            @keydown="${this._toggleDropdownMenu}"
            ?disabled=${this.disabled}
          ></eui-actionable-icon>
        `
      : html`
          <eui-button
            tabindex="0"
            class="menu-button"
            @click="${this._toggleDropdownMenu}"
            @keydown="${this._toggleDropdownMenu}"
            ?disabled=${this.disabled}
            ?primary=${this.primary}
            icon="chevron-down"
            reverse
            align-edge
            style=${styleMap({ width: inlineWidth })}
          >
            <div class="icon-container">${this._renderLabelIcon()}&nbsp;</div>
            ${this._dynamicLabel}
          </eui-button>
        `;

    const slot = !this.data
      ? html`
          <slot @slotchange=${(event) => this._moveMenuItem(event)}></slot>
        `
      : nothing;

    return html`
      <div class="dropdown" style=${styleMap({ width: inlineWidth })} @eui-menu:hidden=${this}>
        ${dropdownButton} ${slot}
        <eui-menu
          type=${ifDefined(this.dataType)}
          @eui-menu:click=${this}
          select-all=${ifDefined(this.selectAll)}
          @eui-menu:change=${this}
        >
          ${this.data ? this._makeDropdownOptions() : nothing}
        </eui-menu>
      </div>
    `;
  }
}

definition('e-icon-dropdown', {
  style,
  props: {
    labelIcon: { attribute: true, type: String },
    label: { attribute: true, type: String, required: false },
  },
})(IconDropdown);

export default IconDropdown;
