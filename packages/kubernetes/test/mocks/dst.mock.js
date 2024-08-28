const dstMock = {
  extractContext() {
    return {};
  },
  injectContext() {
    return {};
  },
  createSpan() {
    return {
      span: {
        end: () => {},
      },
    };
  },
  setHttpResponseSpanOptions() {
    return {};
  },
};

export default dstMock;
