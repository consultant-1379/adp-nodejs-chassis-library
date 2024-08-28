/**
 * Rewiremock config file for common settings.
 * https://github.com/theKashey/rewiremock
 *
 * According to the docs the preferred way to have a common
 * file and include this from tests.
 */

const rewiremock = require('rewiremock/node');

// Here add plugins and do other setup if needed
// rewiremock.addPlugin(rewiremock.plugins.nodejs);

rewiremock.overrideEntryPoint(module); // this is important magic - see docs
module.exports = rewiremock;
