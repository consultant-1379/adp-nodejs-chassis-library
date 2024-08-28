const EXAMPLE_CODE_1 = `
<e-base-link url="/#main-page/app-card" new-tab>
  <span slot="content">I'm clickable. Try click on me :)</span>
</e-base-link>
`;

export default {
  props: [
    {
      name: 'url',
      type: 'String',
      attribute: 'true',
      default: "''",
      description: 'Link to open.',
    },
    {
      name: 'newTab',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: 'Whether open link in a new browser tab.',
    },
  ],
  events: [
    {
      name: 'click',
      description: 'Triggered each time the element is clicked.',
    },
  ],
  slots: [
    {
      name: 'content',
      description:
        'Named slot. This is a placeholder for content to be wrapped by link and become clickable.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }],
};
