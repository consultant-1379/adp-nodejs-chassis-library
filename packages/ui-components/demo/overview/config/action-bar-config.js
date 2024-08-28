import CONSTANTS from '../../constants.js';

const EXAMPLE_CODE_1 = `
<e-action-bar
  is-searchable=false
  grouping-type=${CONSTANTS.GROUPPING_TYPE.CATEGORY}
></e-action-bar>
`;

const EXAMPLE_PROPS_1 = {
  data: [
    {
      group: true,
      label: 'Applications',
      items: [
        {
          displayName: 'Call Browser',
          name: 'call_browser',
        },
        {
          displayName: 'Session Browser',
          name: 'session_browser',
        },
      ],
    },
    {
      group: true,
      label: 'Products',
      items: [
        {
          displayName: 'Ericsson Expert Analytics',
          version: '1.0.0',
          name: 'eea',
          type: 'product',
          descriptionLong:
            'Ericsson Expert Analytics (EEA) is a multi-vendor, customer-centric analytics product for mobile operators who want to capitalize on their network data.',
        },
      ],
    },
  ],
  groupingType: CONSTANTS.GROUPPING_TYPE.ALPHABETICAL,
  showFavoritesOnly: true,
  viewType: CONSTANTS.VIEW_TYPE.TILE,
};

export default {
  props: [
    {
      name: 'data',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'List ot items to show in search combobox.',
    },
    {
      name: 'isCompactView',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: 'If true, shows the component in a compact way.',
    },
    {
      name: 'isProductView',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: "If true, doesn't render controls.",
    },
    {
      name: 'isSearchable',
      type: 'Boolean',
      default: true,
      attribute: true,
      description: 'If true ,renders search field.',
    },
    {
      name: 'showGroupingType',
      type: 'Boolean',
      default: true,
      attribute: false,
      description: 'Show grouping type dropdown.',
    },
    {
      name: 'groupingType',
      type: 'String',
      default: 'null',
      attribute: true,
      description:
        'Set selected by default grouping type. Possible values are: category and alphabetical.',
    },
    {
      name: 'showFavorite',
      type: 'Boolean',
      default: true,
      attribute: false,
      description: "Show 'favorites' pill",
    },
    {
      name: 'showFavoritesOnly',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: "If true, 'favorites' pill will be displayed as selected.",
    },
    {
      name: 'viewType',
      type: 'Boolean',
      default: "''",
      attribute: false,
      description: 'Set selected by default view type. Possible values are: tile and list.',
    },
  ],
  events: [
    {
      name: 'handle-search-selection',
      description: 'Triggered each time you click on an item in the search results list.',
    },
    {
      name: 'handle-favorites-change',
      description: 'Triggered each time favourite pill is clicked.',
    },
    {
      name: 'handle-keyboard',
      description:
        'Triggered each time when favourite pill is focused and keyboard key is pressed.',
    },
    {
      name: 'handle-grouping-change',
      description: 'Triggered each time grouping type was changed.',
    },
    {
      name: 'handle-view-change',
      description: 'Triggered each time view type was changed.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { props: EXAMPLE_PROPS_1 }],
};
