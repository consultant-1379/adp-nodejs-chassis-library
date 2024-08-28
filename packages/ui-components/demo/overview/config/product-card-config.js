const EXAMPLE_PROPS_1 = {
  displayName: 'GUI Aggregator',
  descriptionShort: 'Short description, displays as subtitle and as part of the info tooltip',
  isCompactView: true,
};

const EXAMPLE_PROPS_2 = {
  displayName: 'EEA Product',
  descriptionShort: 'Secondary Info',
  route: '/#main-page/app-card',
};

export default {
  props: [
    {
      name: 'productName',
      type: 'String',
      default: "''",
      attribute: false,
      description: 'Unique name of the product.',
    },
    {
      name: 'displayName',
      type: 'String',
      default: "''",
      attribute: false,
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
      name: 'descriptionShort',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Short description, displays as subtitle and as part of the info tooltip.',
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
      name: 'product-selected',
      description: 'Triggered each time the card is clicked. Bubbles `productName` property.',
    },
  ],
  examples: [{ props: EXAMPLE_PROPS_1 }, { props: EXAMPLE_PROPS_2 }],
};
