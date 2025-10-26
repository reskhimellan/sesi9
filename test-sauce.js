const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Saucedemo Automation Test', function () {
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

    it('Login sukses dan cek page title', async function () {
        await driver.get('https://www.saucedemo.com');

        // Inputs credentials
        const Username = await driver.findElement(By.css('[data-test="username"]'));
        const Password = await driver.findElement(By.css('[data-test="password"]'));
        const buttonLogin = await driver.findElement(By.css('[data-test="login-button"]'));

        await Username.sendKeys('standard_user');
        await Password.sendKeys('secret_sauce');
        await buttonLogin.click();

        // Tunggu sampai elemen Products muncul
        await driver.wait(until.elementLocated(By.css('.title')), 10000);
        const titleText = await driver.findElement(By.css('.title')).getText();

        // Assertion: pastikan user berhasil login
        assert.strictEqual(titleText, 'Products');
    });

    it('Urutkan produk dari Z ke A dan validasi hasil sorting', async function () {
        // Tunggu dropdown muncul
        const sortDropdown = await driver.findElement(By.css('[data-test="product-sort-container"]'));
        await sortDropdown.click();

        // Pilih urutan Z → A
        await sortDropdown.findElement(By.css('option[value="za"]')).click();

        // Ambil semua nama produk di halaman
        const productElements = await driver.findElements(By.css('.inventory_item_name'));
        const productNames = [];

        for (let el of productElements) {
            const name = await el.getText();
            productNames.push(name);
        }

        console.log('Nama produk di UI:', productNames);

        // Buat array baru yang diurutkan manual dari Z → A
        const sortedNames = [...productNames].sort().reverse();

        // Assertion: pastikan urutan produk sesuai (Z→A)
        assert.deepStrictEqual(productNames, sortedNames);
    });
});
