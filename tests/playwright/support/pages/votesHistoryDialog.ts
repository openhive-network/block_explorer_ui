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
  readonly votesHistoryDialogDatepickerCalender: Locator;
  readonly votesHistoryDialogDatepickerMonth: Locator;
  readonly votesHistoryDialogDatepickerYear: Locator;
  readonly votesHistoryDialogDatepickerDayNotMuted: Locator;
  readonly votesHistoryDialogDatepicekrTime: Locator;
  readonly votesHistoryDialogDatepicekrTimeHours: Locator;
  readonly votesHistoryDialogDatepicekrTimeMinutes: Locator;
  readonly votesHistoryDialogDatepicekrTimeSeconds: Locator;
  readonly votesHistoryDialogVoterColumn: Locator;
  readonly votesHistoryDialogVoteArrowColumn: Locator;
  readonly votesHistoryDialogCurrentVoterPowerColumn: Locator;
  readonly votesHistoryDialogCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.votesHistoryDialog = page.getByTestId('votes-history-dialog');
    this.votesHistoryDialogWitnessName = page.getByTestId('votes-history-dialog-witness-name');
    this.votesHistoryDialogVestsHivePowerButton = page.getByTestId('votes-history-dialog-vests-hivepower-button');
    this.votesHistoryDialogFromDatepicker = page.getByTestId('datepicker-trigger').first();
    this.votesHistoryDialogToDatepicker = page.getByTestId('datepicker-trigger').last();
    this.votesHistoryDialogDatepickerCalender = page.getByTestId('datepicker-calender');
    this.votesHistoryDialogDatepickerMonth = page.locator('select[name="months"]');
    this.votesHistoryDialogDatepickerYear = page.locator('select[name="years"]');
    this.votesHistoryDialogDatepickerDayNotMuted = this.votesHistoryDialogDatepickerCalender.locator('button:not([class*="text-muted-foreground"])');
    this.votesHistoryDialogDatepicekrTime = page.locator('[data-testid="datepicker-time"]');
    this.votesHistoryDialogDatepicekrTimeHours = this.votesHistoryDialogDatepicekrTime.locator('input').first();
    this.votesHistoryDialogDatepicekrTimeMinutes = this.votesHistoryDialogDatepicekrTime.locator('input').nth(1);
    this.votesHistoryDialogDatepicekrTimeSeconds = this.votesHistoryDialogDatepicekrTime.locator('input').last();
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
  }

  async validateWitnessName(witnessName: string) {
    await expect(this.votesHistoryDialogWitnessName).toHaveText(witnessName);
  }
}
