import { DateTime } from 'luxon';
import CONSTANTS from '../config/constants.js';

const { FALLBACK_LOCALE } = CONSTANTS;

class DateFormatter {
  /**
   * Returns the locale from the environment.
   *
   * @returns {string} The locale from the environment.
   */
  get locale() {
    let locale = FALLBACK_LOCALE;
    if (typeof navigator === 'object') {
      locale = navigator.language;
    } else {
      const { env } = process;
      const lang = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
      const detectedLocale = lang.split('.')[0];
      // The C locale, also known as the POSIX locale, is the POSIX system default locale for all POSIX-compliant systems
      locale = detectedLocale === 'C' ? locale : detectedLocale;
    }

    return locale;
  }

  /**
   * Parses a unix timestamp string or returns the date string as is.
   *
   * @param {string} inputDate - A date string.
   * @returns {string|number} Returns the date string or a unix timestamp as an integer.
   */
  _inputHandler(inputDate) {
    return /^-?\d+$/.test(inputDate) ? parseInt(inputDate, 10) * 1000 : inputDate;
  }

  /**
   * Tells if the `inputString` is a valid date string.
   *
   * @param {string} inputDate - A date string.
   * @returns {boolean} Whether the date string is valid or not.
   */
  isInputInvalid(inputDate) {
    const date = new Date(this._inputHandler(inputDate));
    return Number.isNaN(date.getTime());
  }

  /**
   * Parses the date string and returns a `DateTime` object with the locale set.
   *
   * @param {string} inputDate - A date string.
   * @returns {DateTime} A `DateTime` object with the locale set.
   */
  _getDateTimeWithLocale(inputDate) {
    const date = new Date(this._inputHandler(inputDate));
    return DateTime.fromISO(date.toISOString()).setLocale(this.locale);
  }

  /**
   * Converts the `inputDate` to ISO string format.
   *
   * @param {string} inputDate - A date string.
   * @returns {string} ISO string of the date string.
   */
  getIsoString(inputDate) {
    const date = new Date(this._inputHandler(inputDate));
    return date.toISOString();
  }

  /**
   * Formats the date string to a local time string (e.g.: 'Oct 14, 1983, 9:30 AM').
   *
   * @param {string} inputDate - A date string.
   * @returns {string} A locale formatted date string.
   */
  formatDayMonthYearTimeShort(inputDate) {
    if (this.isInputInvalid(inputDate)) {
      return 'Invalid date';
    }
    return this._getDateTimeWithLocale(inputDate).toLocaleString(DateTime.DATETIME_MED);
  }

  /**
   * Converts ISO string format from `YYYYMMDDHHMMSSZ` to `YYYY-MM-DDTHH:MM:SS.000Z`.
   *
   * @param {string} isoString - ISO string in the compact format.
   * @returns {string} ISO string in the extended format.
   */
  convertISODate(isoString) {
    return `${isoString.substring(0, 4)}-${isoString.substring(4, 6)}-${isoString.substring(
      6,
      8,
    )}T${isoString.substring(8, 10)}:${isoString.substring(10, 12)}:${isoString.substring(
      12,
      14,
    )}.000Z`;
  }
}

export default new DateFormatter();
