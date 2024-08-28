const reasons = ['Server temporarily unavailable.', 'There is intermittent environment issue.'];

const EXAMPLE_PROPS_1 = {
  message: 'The operation cannot be completed due to an unexpected problem.',
  reasons,
  tryAgain: true,
};

const EXAMPLE_PROPS_2 = {
  message: 'There is a serious malfunction, you need to reinstall everything.',
  reasons: [],
  tryAgain: false,
};

export default {
  props: [
    {
      name: 'message',
      type: 'String',
      attribute: 'false',
      default: "''",
      description: 'The main heading of the error message.',
    },
    {
      name: 'reasons',
      type: 'Object',
      attribute: 'false',
      default: [],
      description: 'Array of possible reason strings.',
    },
    {
      name: 'tryAgain',
      type: 'Boolean',
      attribute: 'false',
      default: false,
      description: 'Whether to append try again message at the end.',
    },
  ],
  events: [],
  examples: [{ props: EXAMPLE_PROPS_1 }, { props: EXAMPLE_PROPS_2 }],
};
