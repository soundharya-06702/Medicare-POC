const { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { ClinicPage } = require('../pages/clinic.page');

setDefaultTimeout(30 * 1000);

let browser;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: process.env.HEADED !== 'true' });
});

Before(async function () {
  this.context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(5000);
  this.clinic = new ClinicPage(this.page);
});

After(async function (scenario) {
  if (scenario.result && scenario.result.status === Status.FAILED) {
    const img = await this.page.screenshot({ fullPage: true });
    this.attach(img, 'image/png');
  }
  await this.context.close();
});

AfterAll(async function () {
  await browser.close();
});