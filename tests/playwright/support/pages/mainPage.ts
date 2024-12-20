import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly page: Page;
  readonly headBlockCard: Locator;
  readonly lastBlockWidget: Locator;
  readonly SearchesSection: Locator;
  readonly topWitnessesSidebar: Locator;
  readonly witnessesName: Locator;
  readonly seeMoreBtn: Locator;

  readonly headBlockCardBlockLink: Locator;
  readonly headBlockCardWitnessLink: Locator;
  readonly headBlockCardWitnessName: Locator;
  readonly headBlockCardFundAndSupplyExpandableList: Locator;
  readonly headBlockCardHiveParametersExpandableList: Locator;
  readonly headBlockCardBlockchainDatesExpandableList: Locator;
  readonly contentFundAndSupplyExpandableList: Locator;
  readonly contentHiveParametersExpandableList: Locator;
  readonly contentBlockchainDatesExpandableList: Locator;
  readonly blockSearchBtn: Locator;
  readonly blocksearchResultHeader: Locator;
  readonly blockSearchResultSection: Locator;
  readonly resultBlock: Locator;
  readonly firstResultBlock: Locator;
  readonly accountNameInput: Locator;
  readonly blockSearchPropertiesFilterBtn: Locator;
  readonly blockSearchPropertiesOption: Locator;
  readonly headblockNumber: Locator;
  readonly datetimePicker: Locator;
  readonly calendarNavigationLabel: Locator;
  readonly calendarNavigationNextButton: Locator;
  readonly monthViewDays: Locator;
  readonly monthName: Locator;
  readonly dayName: Locator;
  readonly operationsTypesBtn: Locator;
  readonly RawJsonViewToggle: Locator;
  readonly operationsTypesWindow: Locator;
  readonly pickPropertyBtn: Locator;
  readonly pickPropertyBtnBlocked: Locator;
  readonly accountSearchSection: Locator;
  readonly searchButtonInAccount: Locator;
  readonly accountNameInputAccountSection: Locator;
  readonly operationsCardResult: Locator;
  readonly goToResultPageBtn: Locator;
  readonly lastBlockBtn: Locator;
  readonly lastDaysWeeksMonths: Locator;
  readonly blockRange: Locator;
  readonly timeRange: Locator;
  readonly commentSearchSection: Locator;
  readonly searchButtonInComment: Locator;
  readonly accountNameInputCommentSection: Locator;
  readonly noOperationsMatchingTextSection: string;
  readonly detailedOperationCard: Locator;
  readonly commentPermlinkInout: Locator;
  readonly currentWitnessName: Locator;
  readonly datePickerTriggerFromDate: Locator;
  readonly datePickerTriggerToDate: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headBlockCard = page.getByTestId('head-block-card');
    this.lastBlockWidget = page.getByTestId('last-block-widget');
    this.SearchesSection = page.getByTestId('block-search-section');
    this.topWitnessesSidebar = page.getByTestId('top-witnesses-sidebar');
    this.witnessesName = page.getByTestId('witnesses-name')
    this.seeMoreBtn = page.getByTestId('see-more-btn')
    this.headBlockCardBlockLink = this.headBlockCard.getByTestId('block-number-link');
    this.headBlockCardWitnessLink = this.headBlockCard.getByTestId('current-witness-link');
    this.headBlockCardWitnessName = this.headBlockCard.getByTestId('current-witness-name');
    this.headBlockCardFundAndSupplyExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Fund and Supply');
    this.headBlockCardHiveParametersExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Hive Parameters');
    this.headBlockCardBlockchainDatesExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Blockchain Dates');
    this.contentFundAndSupplyExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').first();
    this.contentHiveParametersExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').nth(1);
    this.contentBlockchainDatesExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').last();
    this.blockSearchBtn = page.getByTestId('block-search-btn');
    this.blocksearchResultHeader = page.getByTestId('result-section-header');
    this.blockSearchResultSection = page.getByTestId('result-section');
    this.firstResultBlock = page.getByTestId('result-block').first();
    this.accountNameInput = page.getByTestId('account-name-input');
    this.blockSearchPropertiesFilterBtn = page.locator('[role="combobox"]').first();
    this.blockSearchPropertiesOption = page.locator('[role="option"]');
    this.headblockNumber = page.getByTestId('headblock-number');
    this.resultBlock = page.getByTestId('result-block');
    this.datetimePicker = page.locator('.react-datetime-picker__inputGroup__input.react-datetime-picker__inputGroup__year').first();
    this.calendarNavigationLabel = page.locator('.react-calendar__navigation__label');
    this.calendarNavigationNextButton = page.locator('.react-calendar__navigation__arrow.react-calendar__navigation__next-button');
    this.monthViewDays = page.locator('.react-calendar__tile.react-calendar__month-view__days__day').nth(7);
    this.monthName = page.locator('[name="month"]').first();
    this.dayName = page.locator('[name="day"]').first();
    this.operationsTypesBtn = page.getByTestId('operations-types-btn')
    this.RawJsonViewToggle = page.getByTestId('toggle').locator('.w-10')
    this.operationsTypesWindow = page.locator('[role="dialog"]').last()
    this.pickPropertyBtn = page.locator('button').filter({ hasText: 'Pick a property' })
    this.pickPropertyBtnBlocked = page.locator('.text-blocked')
    this.accountSearchSection = page.getByRole('button', { name: 'Account search' })
    this.searchButtonInAccount = page.getByTestId('search-button')
    this.accountNameInputAccountSection = page.getByPlaceholder('Account name *')
    this.operationsCardResult = page.getByTestId('operations-card')
    this.goToResultPageBtn = page.getByTestId('go-to-result-page')
    this.lastBlockBtn = page.getByTestId('block-search-section').getByText('Last blocks')
    this.lastDaysWeeksMonths = page.getByText('Last days/weeks/months')
    this.blockRange = page.getByText('Block range')
    this.timeRange = page.getByLabel('Time range')
    this.commentSearchSection = page.getByRole('button', { name: 'Comment search' })
    this.searchButtonInComment = page.getByTestId('search-button')
    this.accountNameInputCommentSection = page.getByTestId('account-name')
    this.noOperationsMatchingTextSection = '.flex.justify-center.w-full.text-black'
    this.detailedOperationCard = page.getByTestId('detailed-operation-card')
    this.commentPermlinkInout = page.getByTestId('permlink-input')
    this.currentWitnessName = page.getByTestId('current-witness-name')
    this.datePickerTriggerFromDate = page.locator('[data-testid="datepicker-trigger"]').first();
    this.datePickerTriggerToDate = page.locator('[data-testid="datepicker-trigger"]').last();
  }

  async gotoBlockExplorerPage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoToThePage(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  async validateMainPageIsLoaded() {
    // await this.page.waitForLoadState("networkidle");
    await expect(this.headBlockCard).toBeVisible();
    await expect(this.lastBlockWidget).toBeVisible();
    await expect(this.SearchesSection).toBeVisible();
    await expect(this.topWitnessesSidebar).toBeVisible();
  }

  async getElementCssPropertyValue(element: Locator, cssProperty: string) {
    const property = await element.evaluate((ele, css) => {
      return window.getComputedStyle(ele).getPropertyValue(css);
    }, cssProperty);
    // return value of element's css property
    return property;
  }

  async getOptionfromDropdownOptions(text: string) {
    this.blockSearchPropertiesOption.getByText(text).click()
  }

  async choosePropertyOption(option: string){
    this.page.getByLabel(option, { exact: true }).click()
  }
}
