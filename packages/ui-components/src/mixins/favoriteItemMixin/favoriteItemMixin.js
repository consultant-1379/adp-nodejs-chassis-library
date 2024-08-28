import { html, classMap } from '@eui/lit-component';
import { Tooltip } from '@eui/base';
import { Icon } from '@eui/theme';
import CONSTANTS from '../../constants.js';

const { IS_FAVORITE, FAVORITE_STATE, FAVORITE_COLOR } = CONSTANTS;

const favoriteItemMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this.handleFavoriteChange = this.handleFavoriteChange.bind(this);
    }

    static get components() {
      return {
        ...(super.components ?? {}),
        'eui-icon': Icon,
        'eui-tooltip': Tooltip,
      };
    }

    handleFavoriteChange(event) {
      event.stopPropagation();
      event.preventDefault();
      const { appName } = this;
      this.bubble('app-status-change', {
        appName,
        changed: { [IS_FAVORITE]: !this.isFavorite() },
      });
    }

    isFavorite() {
      const { favoriteState } = this;
      return favoriteState === FAVORITE_STATE.FAVORITE;
    }

    isPartiallyFavorite() {
      const { favoriteState } = this;
      return [FAVORITE_STATE.FAVORITE, FAVORITE_STATE.PARTIALLY_FAVORITE].includes(favoriteState);
    }

    getFavoriteIconParams() {
      return {
        name: this.isFavorite() ? 'favorite-solid' : 'favorite',
        color: this.isPartiallyFavorite() ? FAVORITE_COLOR : '',
        clickHandler: this.handleFavoriteChange,
      };
    }

    renderFavoriteIcon() {
      const { i18n } = this;
      const favoriteIconParams = this.getFavoriteIconParams();

      return html`
        <eui-tooltip
          class="favorite-icon"
          message=${i18n.TOGGLE_FAVORITE_TOOLTIP}
          position="top-end"
        >
          <eui-icon
            class=${classMap({ icon: true, pointer: true })}
            name=${favoriteIconParams.name}
            color=${favoriteIconParams.color}
            @click=${favoriteIconParams.clickHandler}
          ></eui-icon>
        </eui-tooltip>
      `;
    }
  };

export default favoriteItemMixin;
