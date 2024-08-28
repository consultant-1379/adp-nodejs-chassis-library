import CONSTANTS from '../../constants.js';

const items = [
  {
    displayName: 'App 1',
    descriptionShort: 'Secondary text 1',
    descriptionLong: 'Long description of the App 1',
    favoriteState: CONSTANTS.FAVORITE_STATE.PARTIALLY_FAVORITE,
    type: CONSTANTS.EXTERNAL_TYPE,
    childApps: [
      {
        name: 'child-1',
        displayName: 'Child 1',
        descriptionShort: 'A few words about child 1',
        route: '/#main-page/action-bar',
        favoriteState: CONSTANTS.FAVORITE_STATE.PARTIALLY_FAVORITE,
      },
      {
        name: 'child-2',
        displayName: 'Child 2',
        descriptionShort: 'A few words about child 2',
        descriptionLong: 'Long description of child 2',
        route: '/#main-page/base-link',
        favoriteState: CONSTANTS.FAVORITE_STATE.FAVORITE,
      },
    ],
  },
  {
    displayName: 'App 2',
    descriptionLong: 'Long description of the App 1',
    route: '/#main-page/groupable-combo-box',
    favoriteState: CONSTANTS.FAVORITE_STATE.FAVORITE,
  },
  {
    displayName: 'App 3',
    descriptionShort: 'Secondary text 3',
    descriptionLong: 'Long description of the App 3',
    route: '/#main-page/app-card',
    favoriteState: CONSTANTS.FAVORITE_STATE.NOT_FAVORITE,
  },
  {
    displayName: 'App 4',
    descriptionShort: 'Secondary text 4',
    descriptionLong: 'Long description of the App 4',
    route: '/#main-page/card-container',
    favoriteState: CONSTANTS.FAVORITE_STATE.PARTIALLY_FAVORITE,
    type: CONSTANTS.EXTERNAL_TYPE,
  },
];

const EXAMPLE_PROPS_1 = {
  productName: 'EEA Apps',
  groupName: 'EEA App Group',
  items,
};

const EXAMPLE_PROPS_2 = {
  productName: 'EEA Apps',
  groupName: 'EEA App Group',
  items,
  isCompactView: true,
};

export default {
  props: [
    {
      name: 'groupName',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Title of the list.',
    },
    {
      name: 'items',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'List if items to be displayed in a list.',
    },
    {
      name: 'productName',
      type: 'String',
      default: 'null',
      attribute: true,
      description: 'Sets to each item of the list.',
    },
    {
      name: 'isCompactView',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: "If true shows a list's item in a compact way.",
    },
    {
      name: 'showFavorite',
      type: 'Boolean',
      default: true,
      attribute: false,
      description: 'Sets to each item of the list.',
    },
  ],
  examples: [{ props: EXAMPLE_PROPS_1 }, { props: EXAMPLE_PROPS_2 }],
};
