import { Locator, Page, expect } from "@playwright/test";

export class VotersDialog {
  readonly page: Page;
  readonly votersDialog: Locator;
  readonly votersDialogWitnessName: Locator;
  readonly votersDialogVestsHivePowerButton: Locator;
  readonly votersDialogTableBody: Locator;
  readonly votersDialogVoterName: Locator;
  readonly votersDialogVotesValue: Locator;
  readonly votersDialogAccountValue: Locator;
  readonly votersDialogProxiedValue: Locator;
  readonly votersDialogCloseButton: Locator;
  readonly votersDialogHeaderVoterButton: Locator;
  readonly votersDialogHeaderVotesButton: Locator;
  readonly votersDialogHeaderAccountButton: Locator;
  readonly votersDialogHeaderProxyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.votersDialog = page.getByTestId('voters-dialog');
    this.votersDialogWitnessName = page.getByTestId('voters-dialog-witness-name');
    this.votersDialogVestsHivePowerButton = page.getByTestId('voters-dialog-vests-hivepower-button');
    this.votersDialogTableBody = page.getByTestId('voters-dialog-table-body');
    this.votersDialogVoterName = page.getByTestId('voter-name');
    this.votersDialogVotesValue = page.getByTestId('vote-power');
    this.votersDialogAccountValue = page.getByTestId('account-power');
    this.votersDialogProxiedValue = page.getByTestId('proxied-power');
    this.votersDialogCloseButton = page.getByTestId('close-dialog-button');
    this.votersDialogHeaderVoterButton = this.votersDialog.locator('thead').getByText('Voter');
    this.votersDialogHeaderVotesButton = this.votersDialog.locator('thead').getByText('Votes');
    this.votersDialogHeaderAccountButton = this.votersDialog.locator('thead').getByText('Account');
    this.votersDialogHeaderProxyButton = this.votersDialog.locator('thead').getByText('Proxy');
  }

  async validateVotersDialogIsLoaded() {
    await expect(this.votersDialog).toBeVisible();
    await expect(this.votersDialogVestsHivePowerButton).toBeVisible();
    await expect(this.votersDialogTableBody).toBeVisible();
  }

  async validateWitnessName(witnessName: string) {
    await expect(this.votersDialogWitnessName).toHaveText(witnessName);
  }
}
