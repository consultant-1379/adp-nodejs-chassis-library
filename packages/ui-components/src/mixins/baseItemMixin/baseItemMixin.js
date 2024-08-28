import CONSTANTS from '../../constants.js';

const { ENTER_KEY, ESCAPE_KEY } = CONSTANTS;

const baseItemMixin = (Base) =>
  class extends Base {
    constructor() {
      super();
      this.handleKeyboard = this.handleKeyboard.bind(this);
    }

    static get components() {
      return {
        ...(super.components ?? {}),
      };
    }

    handleKeyboard(event) {
      // other mixins can add more keyboard interactions by overriding this
      switch (event.key) {
        case ENTER_KEY:
          this.handleItemClick(event);
          break;
        case ESCAPE_KEY:
          // remove item focus
          event.currentTarget.blur();
          break;
        default:
          break;
      }
    }
  };

export default baseItemMixin;
