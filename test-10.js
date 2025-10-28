const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Saucedemo Automation Test Dengan Hooks', function () {
    let driver;
    this.timeout(50000);

    before(async function () {
        const options = new chrome.Options();
        options.addArguments('--incognito');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    after(async function () {
        await driver.quit();
    });

    beforeEach(async function () {
        await driver.get('https://www.saucedemo.com');

        const username = await driver.findElement(By.css('[data-test="username"]'));
        const password = await driver.findElement(By.css('[data-test="password"]'));
        const loginBtn = await driver.findElement(By.css('[data-test="login-button"]'));

        await username.sendKeys('standard_user');
        await password.sendKeys('secret_sauce');
        await loginBtn.click();

        await driver.wait(until.elementLocated(By.css('.title')), 10000);
    });

    it('Login sukses dan cek page title', async function () {
        const titleText = await driver.findElement(By.css('.title')).getText();
        assert.strictEqual(titleText, 'Products');
    });
 
    it('Urutkan produk dari Z ke A dan validasi hasil sorting', async function () {
        const sortDropdown = await driver.findElement(By.css('[data-test="product-sort-container"]'));
        await sortDropdown.findElement(By.css('option[value="za"]')).click();

        const productElements = await driver.findElements(By.css('.inventory_item_name'));
        const productNames = [];

        for (let el of productElements) {
            productNames.push(await el.getText());
        }

        const sortedNames = [...productNames].sort().reverse();
        assert.deepStrictEqual(productNames, sortedNames);
    });
});