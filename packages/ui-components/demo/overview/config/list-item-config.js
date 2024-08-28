const EXAMPLE_CODE_1 = `
<e-list-item
  app-name='App 2'
  display-name='List item 2'
  description-short='A few simple words'
  description-long='Long description of an app-card'
  route="/#main-page/base-link"
  favorite-state='partially-favorite'
  is-info-visible
></e-list-item>
`;
const EXAMPLE_CODE_2 = `
<e-list-item
  app-name='App 1'
  display-name='List item 1'
  description-short='A few simple words'
  description-long='Long description of an app-card'
  route="/#main-page/base-link"
  is-external
  favorite-state='favorite'
  is-child
></e-list-item>
`;

export default {
  props: [
    {
      name: 'appName',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Name of an app (check if this property is needed).',
    },
    {
      name: 'displayName',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Title of the item.',
    },
    {
      name: 'descriptionShort',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Short description, displays as subtitle and as part of the info tooltip.',
    },
    {
      name: 'descriptionLong',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Full description, displays in the info tooltip.',
    },
    {
      name: 'route',
      type: 'String',
      default: "''",
      attribute: true,
      description: 'Link to open.',
    },
    {
      name: 'isExternal',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: 'Whether open link in a new browser tab.',
    },
    {
      name: 'isExpanded',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: "Whether show item's children or not.",
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
      name: 'children',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'Array of children objects.',
    },
    {
      name: 'isChild',
      type: 'Boolean',
      default: false,
      attribute: true,
      description: 'If true, item will be displayed as a child of the upper level list.',
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
      description: '?? If true shows the card in a compact way.',
    },
    {
      name: 'showFavorite',
      type: 'Boolean',
      default: true,
      attribute: false,
      description: 'Whether show or not a favourite icon.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { code: EXAMPLE_CODE_2 }],
};
