import { Locator, Page, expect } from "@playwright/test";

export class BlockPage {
  readonly page: Page;
  readonly blockPageSearch: Locator;
  readonly blockPageBlockDetails: Locator;
  readonly blockPageOperationList: Locator;
  readonly blockDetailsBlockNumber: Locator;
  readonly producedData: Locator;
  readonly jsonView: Locator;
  readonly operationType: Locator;
  readonly blockProducer: Locator;
  readonly hash: Locator;
  readonly prevHash: Locator;
  readonly operations: Locator;
  readonly virtualOperations: Locator;
  readonly seeMoreDetailsBtn: Locator;
  readonly detailedOperationCard: Locator;
  readonly operationTypeTitle: Locator;
  readonly firstTransactionLink: Locator;
  readonly usernameInOperationDetails: Locator;
  readonly voteOperationPostLink: Locator;
  readonly operationsJsonFormat: Locator;
  readonly blockNumber: Locator;
  readonly nextBlockBtn: Locator;
  readonly dataTimePicker: Locator;
  readonly firstDayInDataPicker: Locator;
  readonly toVirtualOpsBtn: Locator;
  readonly virtualOperationsHeader: Locator;
  readonly toTopBtn: Locator;
  readonly expandDetailsBtn: Locator;
  readonly operationDetails: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.blockPageSearch = page.getByTestId('block-page-search');
    this.blockPageBlockDetails = page.getByTestId('block-page-block-details');
    this.blockPageOperationList = page.getByTestId('block-page-operation-list');
    this.blockDetailsBlockNumber = page.getByTestId('block-number');
    this.producedData = page.locator("[data-testid='produced-data'] > p:nth-of-type(2)")
    this.jsonView = page.locator('pre')
    this.operationType = page.getByTestId('operation-type')
    this.blockProducer = page.getByTestId('block-producer-name');
    this.hash = page.getByTestId('hash');
    this.prevHash = page.getByTestId('prev-hash');
    this.operations = page.locator('.my-2').nth(1);
    this.virtualOperations = page.locator('.my-2').nth(2);
    this.seeMoreDetailsBtn = page.getByRole('button', {name: "See more details"});
    this.detailedOperationCard = page.getByTestId("detailed-operation-card")
    this.operationTypeTitle = page.getByTestId("operation-type");
    this.firstTransactionLink = page.locator('a.text-explorer-turquoise').nth(2);
    this.usernameInOperationDetails = page.locator('span.text-explorer-turquoise').nth(1);
    this.voteOperationPostLink = page.locator('a.text-explorer-yellow').first();
    this.operationsJsonFormat = page.locator('pre');
    this.blockNumber = page.getByTestId('block-number-search');
    this.nextBlockBtn = page.getByTestId('next-block-btn');
    this.dataTimePicker = page.getByTestId("date-time-picker");
    this.firstDayInDataPicker = page.locator('.react-calendar__tile.react-calendar__month-view__days__day').first();
    this.toVirtualOpsBtn = page.getByRole('button', { name: 'To Virtual Ops' });
    this.virtualOperationsHeader = page.getByTestId('block-page-operation-list').getByText('Virtual Operations');
    this.toTopBtn = page.getByRole('button', { name: 'To Top' });
    this.expandDetailsBtn = page.locator('[data-testid="expand-details"]');
    this.operationDetails = page.locator('[data-testid="details"]');
  }

  async validateBlockPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.blockPageSearch).toBeVisible();
    await expect(this.blockPageBlockDetails).toBeVisible();
    await expect(this.blockPageOperationList).toBeVisible();
  }

  async validateBlockNumber(blockNumber: string){
    await expect(this.blockDetailsBlockNumber).toContainText(blockNumber);
  }

  async validateBlockProducerName(blockProducer: string){
    await expect(this.blockProducer).toContainText(blockProducer);
  }
}
