import CONSTANTS from '../../constants.js';

const children = [
  {
    displayName: 'Child App 1',
    appName: 'App Name',
    route: 'wwww.test.com',
    favoriteState: CONSTANTS.FAVORITE_STATE.FAVORITE,
    descriptionShort: 'Child App 1 secondary Info',
    type: 'external',
  },
];

const EXAMPLE_CODE_1 = `
<e-app-card
  display-name='App one (display)'
  is-external
  favorite-state='${CONSTANTS.FAVORITE_STATE.PARTIALLY_FAVORITE}'
  description-long='Long description of an app-card'
  description-short='A few simple words'
  is-info-visible
  is-compact-view
></e-app-card>
`;

const EXAMPLE_PROPS_1 = {
  displayName: 'Test Card',
  descriptionLong: 'Very long test description for card',
  descriptionShort: 'Secondary Info',
  children,
  favoriteState: CONSTANTS.FAVORITE_STATE.PARTIALLY_FAVORITE,
  route: '/#main-page/action-bar',
};

const EXAMPLE_PROPS_2 = {
  displayName:
    'Test Card Compact with a long name (Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.)',
  descriptionLong: 'Very long test description for a compact card',
  descriptionShort: 'Secondary Info',
  children,
  route: '/#main-page/action-bar',
  isCompactView: true,
};

export default {
  props: [
    {
      name: 'appName',
      type: 'String',
      default: "''",
      attribute: false,
      description: 'Name of the app (check if this property is needed).',
    },
    {
      name: 'displayName',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Title in the header of the card.',
    },
    {
      name: 'route',
      type: 'String',
      default: "''",
      attribute: false,
      description: 'Link to open.',
    },
    {
      name: 'isExternal',
      type: 'Boolean',
      default: true,
      attribute: true,
      description: 'Whether open link in a new browser tab.',
    },
    {
      name: 'showFavorite',
      type: 'Boolean',
      default: true,
      attribute: false,
      description: 'Whether show or not a favourite state icon.',
    },
    {
      name: 'favoriteState',
      type: 'String',
      default: 'not-favorite',
      attribute: true,
      description:
        'The name of a favourite state icon. Possible values are: favorite, not-favorite and partially-favorite.',
    },
    {
      name: 'descriptionLong',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Full description, displays in the info tooltip.',
    },
    {
      name: 'descriptionShort',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Short description, displays as subtitle and as part of the info tooltip.',
    },
    {
      name: 'children',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'Array of children objects.',
    },
    {
      name: 'isExpanded',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: 'Hide description.',
    },
    {
      name: 'isInfoVisible',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: '?? Whether show description.',
    },
    {
      name: 'isCompactView',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: 'If true shows the card in a compact way.',
    },
  ],
  events: [
    {
      name: 'click',
      description: 'Triggered each time the element is clicked.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { props: EXAMPLE_PROPS_1 }, { props: EXAMPLE_PROPS_2 }],
};
