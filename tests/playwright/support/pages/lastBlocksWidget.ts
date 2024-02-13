import { Locator, Page, expect } from "@playwright/test";

export class LastBlocksWidget {
  readonly page: Page;
  readonly lastUser: Locator;
  readonly barsOfUsers: Locator;
  readonly lastBarOfLastUser: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lastUser = page.getByTestId('last-block-widget-user-link').last();
    this.barsOfUsers = page.locator('[class="recharts-layer recharts-bar-rectangle"]');
    this.lastBarOfLastUser = page.locator('[class="recharts-layer recharts-bar-rectangle"]').last();
  }

  async getUserNameFromChart() : Promise<string> {
    // Cut username from href image attribute
    const regexUuserFromHref: RegExp = /u\/\w+\//igm;
    await this.page.waitForTimeout(2000);
    const userHref: string = await this.lastUser.locator('image').getAttribute('href') || '';
    // console.log('User herf arg: ', userHref);
    const uuser: RegExpMatchArray = userHref.match(regexUuserFromHref) as RegExpMatchArray;
    // console.log('User with u: ', uuser);
    const regexUser: RegExp = /[-!#$%&'*+0-9=?A-Z^_`a-z{|}~]{2,}/igm; // signs allowed in the user name
    const userArray: RegExpMatchArray = uuser[0].match(regexUser) as RegExpMatchArray;
    const user: string = userArray[0];
    // console.log('User ', user);
    return await user;
  }

  async clickLastWitnessBar() : Promise<string> {
    let userName;
    let operationType = 4;

    while (operationType <= 14) {
      if (await this.page.locator(`[class="recharts-layer recharts-bar-rectangles"][clip-path="url(#clipPath-recharts-bar-${operationType})"] [class="recharts-layer recharts-bar-rectangle"]`).last().isVisible()) {
        userName = await this.getUserNameFromChart();
        await this.page.locator(`[class="recharts-layer recharts-bar-rectangles"][clip-path="url(#clipPath-recharts-bar-${operationType})"] [class="recharts-layer recharts-bar-rectangle"]`).last().click();
        break;
      }
      operationType += 2;
    }
    return await userName;
  }
}
