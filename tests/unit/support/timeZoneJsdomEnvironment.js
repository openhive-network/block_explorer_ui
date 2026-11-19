const { TestEnvironment } = require("jest-environment-jsdom");
const { withTimeZone } = require("./timeZoneEnvironment");

// timeZoneEnvironment for test files that need a DOM.
module.exports = withTimeZone(TestEnvironment);
