const EXAMPLE_CODE_1 = `
<e-icon-dropdown
  data-type='single'
  label-icon='settings'
  label='Settings'
></e-icon-dropdown>
`;

export default {
  props: [
    {
      name: 'labelIcon',
      type: 'String',
      default: 'null',
      attribute: true,
      description: "Icon's name.",
    },
    {
      name: 'label',
      type: 'String',
      default: 'null',
      attribute: true,
      description: '?? Check.',
    },
  ],
  events: [
    {
      name: '@eui-dropdown:change',
      description: 'Triggered when click on a dropdown menu item.',
    },
  ],
  slots: [
    {
      name: '',
      description: 'Default slot. Elements slotted into the default slot appear as dropdown menu',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }],
};
