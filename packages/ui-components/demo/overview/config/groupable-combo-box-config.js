const EXAMPLE_CODE_1 = `
<e-groupable-combo-box
  data-type='single'
  no-result-label='Concentrate and ask again'
  placeholder='Ask your question'
></e-groupable-combo-box>
`;

const EXAMPLE_PROPS_1 = {
  data: [
    {
      label: 'Applications',
      value: 'apps',
    },
    {
      label: 'Products',
      value: 'props',
    },
  ],
  dataType: 'single',
  noResultLabel: 'Keep trying...',
  placeholder: 'Enter something',
};

export default {
  props: [
    {
      name: 'dataType',
      type: 'String',
      default: '',
      attribute: true,
      description: 'Possible values are: single and multi.',
    },
    {
      name: 'noResultLabel',
      type: 'String',
      default: '',
      attribute: true,
      description: 'Default text which shows if search result is empty.',
    },
    {
      name: 'placeholder',
      type: 'String',
      default: '',
      attribute: true,
      description: 'Default text which shows if search result is empty.',
    },
    {
      name: 'data',
      type: 'Array',
      default: '[]',
      attribute: false,
      description: 'List ot items to show in search combobox.',
    },
    {
      name: 'hasInput',
      type: 'Boolean',
      default: false,
      attribute: false,
      description: 'Whether something was typed in the input.',
    },
  ],
  events: [
    {
      name: 'eui-combobox:click',
      description: 'Triggered each time the combobox list item is clicked.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { props: EXAMPLE_PROPS_1 }],
};
