import { Locator, Page, expect } from "@playwright/test";

export class AccountPageFilter {
  readonly page: Page;
  readonly filterDropdownList: Locator;
  readonly applyFiltersBtn: Locator;
  readonly clearFiltersBtn: Locator;
  readonly searchSelectOptionsList: Locator;
  readonly searchSelectOptLastBlocks: Locator;
  readonly searchSelectOptLastDaysWeeksMonths: Locator;
  readonly searchSelectOptionsListTimesUnits: Locator;
  readonly selectOptionHoursInLastTimesUnits: Locator;
  readonly selectOptionDaysInLastTimesUnits: Locator;
  readonly selectOptionWeeksInLastTimesUnits: Locator;
  readonly selectOptionMonthsInLastTimesUnits: Locator;
  readonly searchSelectOptBlockRange: Locator;
  readonly searchSelectOptTimeRange: Locator;
  readonly searchSelectOptDefault: Locator;
  readonly fromBlockInput: Locator;
  readonly toBlockInput: Locator;
  readonly datePickerTriggerFromDate: Locator;
  readonly datePickerTriggerToDate: Locator;
  readonly datePickerCalender: Locator;
  readonly datePickerMonth: Locator;
  readonly datePickerYear: Locator;
  readonly datePickerDays: Locator;
  readonly datePickerTime: Locator;
  readonly datePickerTimeHour: Locator;
  readonly datePickerTimeMinutes: Locator;
  readonly datePickerTimeSeconds: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterDropdownList = page.getByTestId("dropdown-list").first();
    this.applyFiltersBtn = page.getByTestId("apply-filters");
    this.clearFiltersBtn = page.getByTestId("clear-filters");
    this.searchSelectOptionsList = page.getByTestId("search-select-option");
    this.searchSelectOptLastBlocks =
      this.searchSelectOptionsList.getByText("Last blocks");
    this.searchSelectOptLastDaysWeeksMonths =
      this.searchSelectOptionsList.getByText(/^Last days\/weeks\/months$/);
    this.searchSelectOptionsListTimesUnits = page.getByTestId('dropdown-list').last();
    this.selectOptionHoursInLastTimesUnits = page.locator('[data-testid="select-time-option-units"]').getByLabel('Hours');
    this.selectOptionDaysInLastTimesUnits = page.locator('[data-testid="select-time-option-units"]').getByLabel('Days');
    this.selectOptionWeeksInLastTimesUnits = page.locator('[data-testid="select-time-option-units"]').getByLabel('Weeks');
    this.selectOptionMonthsInLastTimesUnits = page.locator('[data-testid="select-time-option-units"]').getByLabel('Months');
    this.searchSelectOptBlockRange =
      this.searchSelectOptionsList.getByText("Block range");
    this.searchSelectOptTimeRange =
      this.searchSelectOptionsList.getByText("Time range");
    this.searchSelectOptDefault = this.searchSelectOptionsList.getByText("---");
    this.fromBlockInput = page.getByTestId("from-block-input");
    this.toBlockInput = page.getByTestId("headblock-number");
    this.datePickerTriggerFromDate = page
      .locator('[data-testid="datepicker-trigger"]')
      .first();
    this.datePickerTriggerToDate = page
      .locator('[data-testid="datepicker-trigger"]')
      .last();
    this.datePickerCalender = page.getByTestId("datepicker-calender");
    this.datePickerMonth = this.datePickerCalender.locator(
      'select[name="months"]'
    );
    this.datePickerYear = this.datePickerCalender.locator(
      'select[name="years"]'
    );
    this.datePickerDays = this.datePickerCalender.locator('button[name="day"]:not(.day-outside)');
    this.datePickerTime = this.page.getByTestId("datepicker-time");
    this.datePickerTimeHour = this.datePickerTime.locator("input").first();
    this.datePickerTimeMinutes = this.datePickerTime.locator("input").nth(1);
    this.datePickerTimeSeconds = this.datePickerTime.locator("input").last();
  }

  async setDate(year: string, month: string, day: string, datePickerTrigger: Locator){
    await this.datePickerYear.click();
    await this.datePickerYear.selectOption(year);
    await this.datePickerMonth.click();
    await this.datePickerMonth.selectOption({ label: month });
    await this.datePickerMonth.click();
    const dayRegExp: string = `^${day}$`
    const dayNumber: RegExp = new RegExp(dayRegExp);
    await this.datePickerDays.getByText(dayNumber).click();
    await this.page.waitForTimeout(1000);
    await datePickerTrigger.click();
  }

  async setDateTime(year: string, month: string, day: string, hour: string, minute: string, second: string, datePickerTrigger: Locator) {
    await this.datePickerYear.click({force: true});
    await this.datePickerYear.selectOption(year);
    await this.datePickerMonth.click({force: true});
    await this.datePickerMonth.selectOption({ label: month });
    await this.datePickerMonth.click({force: true});
    const dayRegExp: string = `^${day}$`
    const dayNumber: RegExp = new RegExp(dayRegExp);
    await this.datePickerDays.getByText(dayNumber).click({force: true});
    await this.page.waitForTimeout(1000);

    await this.datePickerTimeHour.click();
    await this.datePickerTimeHour.fill(hour);
    await this.datePickerTimeMinutes.click();
    await this.datePickerTimeMinutes.fill(minute);
    await this.datePickerTimeSeconds.click();
    await this.datePickerTimeSeconds.fill(second);

    await datePickerTrigger.click();
  }
}
