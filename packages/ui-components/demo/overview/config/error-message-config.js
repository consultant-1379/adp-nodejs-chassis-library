const EXAMPLE_CODE_1 = `
<e-error-message title="Something went wrong!">
  <div slot="content">
    <div>Error occurred while performing the operation.</div>
    <div>
      <dl>
        <dt>Possible reasons:</dt>
        <dd>- Configuration issue</dd>
        <dd>- Environment issue</dd>
      </dl>
    </div>
  </div>
</e-error-message>
`;

export default {
  props: [
    {
      name: 'title',
      type: 'String',
      attribute: 'false',
      default: "''",
      description: 'The title row of the error message.',
    },
  ],
  events: [],
  slots: [
    {
      name: 'content',
      description: 'Named slot for the detailed message, can be plain string or HTML text.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }],
};
