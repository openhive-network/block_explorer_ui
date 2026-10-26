const { TestEnvironment } = require("jest-environment-node");

// Runs a test file in the time zone named by its docblock, e.g.
//   @jest-environment-options {"timeZone": "America/New_York"}
// A time zone set inside the test itself never reaches Date, because Jest hands
// each file a copy of process.env.
class TimeZoneEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    this.timeZone = config.projectConfig.testEnvironmentOptions?.timeZone;
  }

  async setup() {
    this.previousTz = process.env.TZ;
    if (this.timeZone) process.env.TZ = this.timeZone;
    await super.setup();
  }

  async teardown() {
    if (this.previousTz === undefined) delete process.env.TZ;
    else process.env.TZ = this.previousTz;
    await super.teardown();
  }
}

module.exports = TimeZoneEnvironment;
