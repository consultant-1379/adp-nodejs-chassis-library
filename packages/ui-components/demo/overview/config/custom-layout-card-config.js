const EXAMPLE_CODE_1 = `
<e-custom-layout-card
  card-title="Favourite app"
  title-icon-name="Test Card"
  title-icon-type="settings"
  has-accordion-holder
>
  <div slot="accordion">&nbsp;</div>
  <div slot="content">
    Main content
  </div>
</e-custom-layout-card>
`;

const EXAMPLE_PROPS_1 = {
  cardTitle: 'EEA Products',
  titleIconType: 'settings',
  titleIconName: 'Custom card',
  isCompactView: true,
  hasAccordionHolder: true,
};

export default {
  props: [
    {
      name: 'cardTitle',
      type: 'String',
      attribute: 'true',
      default: "''",
      description: 'Title in the header of the card.',
    },
    {
      name: 'titleIconType',
      type: 'String',
      attribute: 'true',
      default: "''",
      description: 'Name of the icon that will be displayed near the title.',
    },
    {
      name: 'titleIconName',
      type: 'String',
      attribute: 'true',
      default: "''",
      description: "Tooltip text that will be shown on icon's hover.",
    },
    {
      name: 'hasAccordionHolder',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: 'Generates accordion slot.',
    },
    {
      name: 'hasProductIconHolder',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: "Generates 'product__icon' slot.",
    },
    {
      name: 'embedSubTitle',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: '',
    },
    {
      name: 'isCompactView',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: 'If true shows the card in a compact way. (check if this property is needed).',
    },
  ],
  events: [
    {
      name: 'keydown',
      description: 'Triggered each time keyboard key is pressed.',
    },
  ],
  slots: [
    {
      name: 'content',
      description: 'Named slot. This is a placeholder for the content below the card header.',
    },
    {
      name: 'accordion',
      description: 'Named slot. This is a placeholder for the accordion icon.',
    },
    {
      name: 'product__icon',
      description: 'Named slot. Displays as a left column from all card content.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { props: EXAMPLE_PROPS_1 }],
};
