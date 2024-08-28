import { expect } from 'chai';
import dateFormatter from '../../src/utils/dateFormatter.js';

const INPUT_FORMATS = [1638373299, '2021-12-01T15:41:39.000Z', 'Wed, 01 Dec 2021 15:41:39 GMT'];
const FORMATTED_DATES = INPUT_FORMATS.map((inputDate) => {
  const dateObj = new Date(typeof inputDate === 'number' ? inputDate * 1000 : inputDate);
  return `2021. dec. 1. ${dateObj.getHours()}:${dateObj.getMinutes()}`;
});

const TEST_LOCALE = 'hu-HU';
const INVALID_DATE = 'Invalid date';

const ISO_STRING_FORMAT_1 = '20211209091037Z';
const ISO_STRING_FORMAT_2 = '2021-12-09T09:10:37.000Z';

describe('Unit test for dateFormatter module', () => {
  let envBackup;

  after(() => {
    process.env = envBackup;
  });

  const testCases = () => {
    it('can format Unix timestamp dates', () => {
      expect(dateFormatter.formatDayMonthYearTimeShort(INPUT_FORMATS[0])).to.eq(FORMATTED_DATES[0]);
    });

    it('can format ISO string dates', () => {
      expect(dateFormatter.formatDayMonthYearTimeShort(INPUT_FORMATS[1])).to.eq(FORMATTED_DATES[1]);
    });

    it('can format UTC string dates', () => {
      expect(dateFormatter.formatDayMonthYearTimeShort(INPUT_FORMATS[2])).to.eq(FORMATTED_DATES[2]);
    });

    it('can handle invalid dates', () => {
      expect(dateFormatter.formatDayMonthYearTimeShort(INVALID_DATE)).to.eq(INVALID_DATE);
    });

    it('can convert ISO string from one format to the other', () => {
      expect(dateFormatter.convertISODate(ISO_STRING_FORMAT_1)).to.eq(ISO_STRING_FORMAT_2);
    });
  };

  describe('Unit tests for Node env', () => {
    before(() => {
      envBackup = process.env;
      process.env = { LANG: TEST_LOCALE };
    });

    testCases();
  });

  describe('Unit tests for browser', () => {
    before(() => {
      process.env = {};
      global.navigator = {};
      navigator.language = TEST_LOCALE;
    });

    testCases();
  });
});
