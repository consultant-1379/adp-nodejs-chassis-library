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
};

export default {
  props: [
    {
      name: 'data',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'Array of children objects.',
    },
  ],
  events: [
    {
      name: 'handle-combobox-selection',
      description:
        'Triggered each time the combobox list item is clicked or selected by Enter or Space.',
    },
  ],
  examples: [{ props: EXAMPLE_PROPS_1 }],
};
