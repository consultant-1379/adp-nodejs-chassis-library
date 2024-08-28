import { LitComponent, html, definition } from '@eui/lit-component';
import { Switch } from '@eui/base';
import style from './lang-switcher.css';

export default class LangSwitcher extends LitComponent {
  static get components() {
    return {
      'eui-switch': Switch,
    };
  }

  get theme() {
    return localStorage.getItem('theme');
  }

  _handleThemeToggle(e) {
    const theme = e.detail.on ? 'dark' : 'light';
    this.bubble('eui-theme-change', { theme });
  }

  render() {
    return html`
      <eui-switch
        label-on="Dark"
        label-off="Light"
        ?on=${this.theme === 'dark'}
        @eui-switch:change=${this._handleThemeToggle}
      ></eui-switch>
    `;
  }
}

definition('e-lang-switcher', {
  style,
})(LangSwitcher);

LangSwitcher.register();
