import { expect, fixture, html } from '@open-wc/testing';
import ErrorMessage from '../../../src/components/error-message/error-message.js';
import isRendered from '../../test-utils/isRendered.js';

const TITLE = 'Failed to complete the desired operation!';
const SIMPLE_CONTENT = 'An unexpected exception occurred.';

const cssPaths = {
  contentSlot: 'div[slot="content"]',
  titleDiv: '.title',
  icon: 'eui-icon',
};

async function renderErrorMessage(errorComponentTemplate) {
  const errorMessage = await fixture(errorComponentTemplate);
  await isRendered(errorMessage);
  return errorMessage;
}

describe('ErrorMessage Tests', () => {
  before(() => {
    ErrorMessage.register();
  });

  it('should render title only', async () => {
    const htmlTemplate = html`
      <e-error-message .title="${TITLE}"></e-error-message>
    `;

    const errorMessage = await renderErrorMessage(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const icon = shadowRoot.querySelector(cssPaths.icon);
    const titleDiv = shadowRoot.querySelector(cssPaths.titleDiv);

    expect(icon).not.to.be.null;
    expect(titleDiv.innerText).to.equal(`${TITLE}`);
  });

  it('should render content only', async () => {
    const htmlTemplate = html`
      <e-error-message>
        <div slot="content">${SIMPLE_CONTENT}</div>
      </e-error-message>
    `;

    const errorMessage = await renderErrorMessage(htmlTemplate);
    const contentDiv = errorMessage.querySelector(cssPaths.contentSlot);
    const { shadowRoot } = errorMessage;
    const icon = shadowRoot.querySelector(cssPaths.icon);

    expect(contentDiv.innerText).to.equal(`${SIMPLE_CONTENT}`);
    expect(icon).not.to.be.null;
  });

  it('should render title and content together', async () => {
    const htmlTemplate = html`
      <e-error-message .title="${TITLE}">
        <div slot="content">${SIMPLE_CONTENT}</div>
      </e-error-message>
    `;

    const errorMessage = await renderErrorMessage(htmlTemplate);
    const { shadowRoot } = errorMessage;
    const titleDiv = shadowRoot.querySelector(cssPaths.titleDiv);
    const contentDiv = errorMessage.querySelector(cssPaths.contentSlot);

    expect(titleDiv.innerText).to.equal(`${TITLE}`);
    expect(contentDiv.innerText).to.equal(`${SIMPLE_CONTENT}`);
  });

  it('should render html content', async () => {
    const htmlTemplate = html`
      <e-error-message .title="${TITLE}">
        <div slot="content">
          <div>
            <div>Task failed successfully.</div>
            <div>
              <dl>
                <dt>Possible reasons:</dt>
                <dd>- friday 13th</dd>
                <dd>- surprisingly the server somehow responded</dd>
              </dl>
            </div>
          </div>
        </div>
      </e-error-message>
    `;

    const errorMessage = await renderErrorMessage(htmlTemplate);
    const contentDiv = errorMessage.querySelector(cssPaths.contentSlot);

    expect(contentDiv.innerText).to.include('friday');
  });
});
