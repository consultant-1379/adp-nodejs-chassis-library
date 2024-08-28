const items = [
  {
    displayName: 'App 1',
    descriptionShort: 'Secondary text 1',
  },
  {
    displayName: 'App 2',
    descriptionShort: 'Secondary text 2',
  },
  {
    displayName: 'App 3',
    descriptionShort: 'Secondary text 3',
  },
  {
    displayName: 'App 4',
    descriptionShort: 'Secondary text 4',
  },
  {
    displayName: 'App 5',
    descriptionShort: 'Secondary text 5',
  },
  {
    displayName: 'App 6',
    descriptionShort: 'Secondary text 6',
  },
  {
    displayName: 'App 7',
    descriptionShort: 'Secondary text 7',
  },
  {
    displayName: 'App 8',
    descriptionShort: 'Secondary text 8',
  },
  {
    displayName: 'App 9',
    descriptionShort: 'Secondary text 9',
  },
];

const EXAMPLE_PROPS_1 = {
  productName: 'EEA Apps',
  groupName: 'EEA App Group',
  items,
  limitNumberOfCards: true,
};

const EXAMPLE_PROPS_2 = {
  productName: 'EEA Products',
  groupName: 'EEA Product Group',
  isProducts: true,
  items,
  isExpandable: true,
};

export default {
  props: [
    {
      name: 'productName',
      type: 'String',
      default: 'null',
      attribute: true,
      description: 'Name of the product.',
    },
    {
      name: 'groupName',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Name of the card group.',
    },
    {
      name: 'isProducts',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: "If true, cards will be displayed as 'product-card', otherwise as 'app-card'.",
    },
    {
      name: 'items',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'List if items to be displayed as cards.',
    },
    {
      name: 'limitNumberOfCards',
      type: 'Boolean',
      default: false,
      attribute: true,
      description:
        "Limits the number of cards displayed by default if the total amount of cards is >8, and adds a link that bubble 'handle-view-all-cards' event.",
    },
    {
      name: 'isExpandable',
      type: 'Boolean',
      default: false,
      attribute: false,
      description:
        'Limits the number of cards displayed by default if the total amount of cards is >4, and adds an option to show hidden ones.',
    },
    {
      name: 'isExpanded',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: 'Whether hidden cards are displayed or not.',
    },
    {
      name: 'isCompactView',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: 'If true shows the card in a compact way.',
    },
    {
      name: 'isRecentSection',
      type: 'Boolean',
      default: false,
      attribute: false,
      description:
        "Adds a link that bubble 'handle-view-all-cards' event without any limit on the number of cards.",
    },
  ],
  events: [
    {
      name: 'handle-view-all-cards',
      description: 'Triggered each time the show all cards link is clicked.',
    },
  ],
  examples: [{ props: EXAMPLE_PROPS_1 }, { props: EXAMPLE_PROPS_2 }],
};
