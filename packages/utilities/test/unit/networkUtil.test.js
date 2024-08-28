import { expect } from 'chai';
import {
  normalizeURLEnding,
  normalizeURLSegment,
  parseJsonRequestBody,
} from '../../src/network/networkUtil.js';

const REQUEST = {
  method: 'POST',
  url: 'dummy-url',
  body: {
    permission: ['#GET', '#POST', 'resource_name'],
    response_mode: 'decision',
    realm: 'oam',
  },
};

const ORIGINAL_REQUEST = {
  method: 'POST',
  url: 'dummy-url',
};

const EXPECTED_PARSED_BODY =
  'permission=%23GET&permission=%23POST&permission=resource_name&response_mode=decision&realm=oam';

describe('Unit tests for networkUtil.js', () => {
  describe('Testing URL functions', () => {
    it('should remove tailing slash from URL', () => {
      const originalURL1 = 'http://google.com/';
      const expectedURL1 = 'http://google.com';
      const normalizedURL1 = normalizeURLEnding(originalURL1);

      const originalURL2 = 'http://yahoo.com';
      const expectedURL2 = 'http://yahoo.com';
      const normalizedURL2 = normalizeURLEnding(originalURL2);

      expect(normalizedURL1).to.be.equal(expectedURL1);
      expect(normalizedURL2).to.be.equal(expectedURL2);
    });

    it('should add leading slash to URL', () => {
      const originalURL1 = 'launcher/';
      const expectedURL1 = '/launcher';
      const normalizedURL1 = normalizeURLSegment(originalURL1);

      const originalURL2 = '/launcher/';
      const expectedURL2 = '/launcher';
      const normalizedURL2 = normalizeURLSegment(originalURL2);

      expect(normalizedURL1).to.be.equal(expectedURL1);
      expect(normalizedURL2).to.be.equal(expectedURL2);
    });
  });

  describe('Testing JSON body functions', () => {
    it('can parse JSON body to URL encoded format', async () => {
      const parsedRequest = parseJsonRequestBody(REQUEST);
      expect(parsedRequest.body.toString()).to.eq(EXPECTED_PARSED_BODY);
    });

    it('can handle request without body', async () => {
      const parsedRequest = parseJsonRequestBody(ORIGINAL_REQUEST);
      expect(parsedRequest).to.eq(ORIGINAL_REQUEST);
    });
  });
});
