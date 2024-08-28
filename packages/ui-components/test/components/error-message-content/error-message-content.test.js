import { expect, fixture, html } from '@open-wc/testing';
import ErrorMessageContent from '../../../src/components/error-message-content/error-message-content.js';
import isRendered from '../../test-utils/isRendered.js';
import defaultI18n from '../../../src/components/error-message-content/locale/en-us.json';

const MESSAGE = 'The operation cannot be completed due to an unexpected problem.';
const REASONS = ['Server temporarily unavailable.', 'There is intermittent environment issue.'];
const { TRY_AGAIN } = defaultI18n;

const cssPaths = {
  message: '.message',
  reasons: '.reasons',
  try: '.try',
};

async function renderErrorMessageContent(errorContentTemplate) {
  const errorMessageContent = await fixture(errorContentTemplate);
  await isRendered(errorMessageContent);
  return errorMessageContent;
}

describe('ErrorMessageContent Tests', () => {
  before(() => {
    ErrorMessageContent.register();
  });

  it('should render message only', async () => {
    const htmlTemplate = html`
      <e-error-message-content .message="${MESSAGE}"></e-error-message-content>
    `;

    const errorMessage = await renderErrorMessageContent(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const messageDiv = shadowRoot.querySelector(cssPaths.message);

    expect(messageDiv.innerText).to.equal(`${MESSAGE}`);
  });

  it('should render reasons only', async () => {
    const htmlTemplate = html`
      <e-error-message-content .reasons="${REASONS}"></e-error-message-content>
    `;

    const errorMessage = await renderErrorMessageContent(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const reasonsDiv = shadowRoot.querySelector(cssPaths.reasons);

    expect(reasonsDiv.innerText).to.include(`${REASONS[0]}`);
  });

  it('should render try again row only', async () => {
    const htmlTemplate = html`
      <e-error-message-content .tryAgain=${true}></e-error-message-content>
    `;

    const errorMessage = await renderErrorMessageContent(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const tryAgainDiv = shadowRoot.querySelector(cssPaths.try);

    expect(tryAgainDiv.innerText).to.equal(`${TRY_AGAIN}`);
  });

  it('should render message and reasons and try again', async () => {
    const htmlTemplate = html`
      <e-error-message-content
        .message="${MESSAGE}"
        .reasons="${REASONS}"
        .tryAgain=${true}
      ></e-error-message-content>
    `;

    const errorMessage = await renderErrorMessageContent(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const messageDiv = shadowRoot.querySelector(cssPaths.message);
    const reasonsDiv = shadowRoot.querySelector(cssPaths.reasons);
    const tryAgainDiv = shadowRoot.querySelector(cssPaths.try);

    expect(messageDiv.innerText).to.equal(`${MESSAGE}`);
    expect(reasonsDiv.innerText).to.include(`${REASONS[0]}`);
    expect(tryAgainDiv.innerText).to.equal(`${TRY_AGAIN}`);
  });

  it('should render empty component without unnecessary div elements', async () => {
    const htmlTemplate = html`
      <e-error-message-content></e-error-message-content>
    `;

    const errorMessage = await renderErrorMessageContent(htmlTemplate);
    expect(errorMessage).not.to.be.null;

    const { shadowRoot } = errorMessage;
    const messageDiv = shadowRoot.querySelector(cssPaths.message);
    const reasonsDiv = shadowRoot.querySelector(cssPaths.reasons);
    const tryAgainDiv = shadowRoot.querySelector(cssPaths.try);

    expect(messageDiv).to.be.null;
    expect(reasonsDiv).to.be.null;
    expect(tryAgainDiv).to.be.null;
  });
});
