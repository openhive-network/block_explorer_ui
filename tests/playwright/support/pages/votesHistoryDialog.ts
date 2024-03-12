import { Locator, Page, expect } from "@playwright/test";

export class VotesHistoryDialog {
  readonly page: Page;
  readonly votesHistoryDialog: Locator;
  readonly votesHistoryDialogWitnessName: Locator;
  readonly votesHistoryDialogVestsHivePowerButton: Locator;
  readonly votesHistoryDialogFromDatepicker: Locator;
  readonly votesHistoryDialogToDatepicker: Locator;
  readonly votesHistoryDialogTableBody: Locator;
  readonly votesHistoryDialogDateFormatColumn: Locator;
  readonly votesHistoryDialogVoterColumn: Locator;
  readonly votesHistoryDialogVoteArrowColumn: Locator;
  readonly votesHistoryDialogCurrentVoterPowerColumn: Locator;
  readonly votesHistoryDialogCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.votesHistoryDialog = page.getByTestId('votes-history-dialog');
    this.votesHistoryDialogWitnessName = page.getByTestId('votes-history-dialog-witness-name');
    this.votesHistoryDialogVestsHivePowerButton = page.getByTestId('votes-history-dialog-vests-hivepower-button');
    this.votesHistoryDialogFromDatepicker = page.getByTestId('votes-history-dialog-from-datepicker');
    this.votesHistoryDialogToDatepicker = page.getByTestId('votes-history-dialog-to-datepicker');
    this.votesHistoryDialogTableBody = page.getByTestId('votes-history-dialog-table-body');
    this.votesHistoryDialogDateFormatColumn = page.getByTestId('date-format');
    this.votesHistoryDialogVoterColumn = page.getByTestId('voter');
    this.votesHistoryDialogVoteArrowColumn = page.getByTestId('vote-arrow');
    this.votesHistoryDialogCurrentVoterPowerColumn = page.getByTestId('current-voter-power');
    this.votesHistoryDialogCloseButton = page.getByTestId('close-dialog-button');
  }

  async validateVotesHistoryDialogIsLoaded() {
    await expect(this.votesHistoryDialog).toBeVisible();
    await expect(this.votesHistoryDialogWitnessName).toBeVisible();
    await expect(this.votesHistoryDialogVestsHivePowerButton).toHaveAttribute('data-state', 'unchecked');
    await expect(this.votesHistoryDialogFromDatepicker).toBeVisible();
    await expect(this.votesHistoryDialogToDatepicker).toBeVisible();
    await expect(this.votesHistoryDialogTableBody).toBeVisible();
  }

  async validateWitnessName(witnessName: string) {
    await expect(this.votesHistoryDialogWitnessName).toHaveText(witnessName);
  }
}
