const menuItems = [
  {
    label: 'Option',
  },
  {
    label: 'Add',
    icon: {
      name: 'plus',
      color: 'green',
    },
  },
  {
    label: 'Delete',
    icon: {
      name: 'trashcan',
      color: 'red',
    },
  },
];

const EXAMPLE_PROPS_1 = {
  menuItems,
  showMenu: true,
};

export default {
  props: [
    {
      name: 'menuItems',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'List if items in the menu',
    },
    {
      name: 'showMenu',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: 'Shows or hides the menu.',
    },
  ],
  examples: [{ props: EXAMPLE_PROPS_1 }],
};
