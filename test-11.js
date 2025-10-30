import { Builder } from 'selenium-webdriver';
import assert from 'assert';
import chrome from 'selenium-webdriver/chrome.js';

import fs from 'fs';
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import page_login from '../pages/page_login.js';

describe('Saucedemo Automation + Visual Test', function () {
    let driver;
    this.timeout(50000);

    async function startBrowser(headless = false) {
        let options = new chrome.Options();
        if (headless) options.addArguments("--headless");
        return await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    }

    afterEach(async function () {
        if (this.currentTest.state === 'failed') {
            let ss_full = await driver.takeScreenshot();
            fs.writeFileSync("ss failed: " + this.currentTest.title + ".png", Buffer.from(ss, "base64"));
        }
    });

    it('Login sukses dan cek page title', async function () {
        driver = await startBrowser();

        await driver.get('https://www.saucedemo.com');
        assert.strictEqual(await driver.getTitle(), 'Swag Labs');

        await driver.findElement(page_login.inputUsername).sendKeys('standard_user');
        await driver.findElement(page_login.inputPassword).sendKeys('secret_sauce');
        await driver.findElement(page_login.btnLogin).click();

        const cart = driver.findElement(page_login.btnCart);
        assert.ok(await cart.isDisplayed(), "Cart tidak tampil");

        assert.strictEqual(await driver.findElement(page_login.textLogo).getText(), 'Swag Labs');

        await driver.quit();
    });

    it('Screenshot (Full & Element)', async function () {
        driver = await startBrowser(true);

        await driver.get('https://www.saucedemo.com');

        fs.writeFileSync("full.png", Buffer.from(await driver.takeScreenshot(), "base64"));

        const inputUsername = await driver.findElement(page_login.inputUsername);
        fs.writeFileSync("username.png", Buffer.from(await inputUsername.takeScreenshot(), "base64"));

        await driver.quit();
    });

    it.only('Visual Regression Test - Login Page', async function () {
        driver = await startBrowser();
        await driver.get('https://www.saucedemo.com');

        const imgCurrent = Buffer.from(await driver.takeScreenshot(), "base64");
        fs.writeFileSync("current.png", imgCurrent);

        if (!fs.existsSync("baseline.png")) fs.copyFileSync("current.png", "baseline.png");

        const img1 = PNG.sync.read(fs.readFileSync("baseline.png"));
        const img2 = PNG.sync.read(fs.readFileSync("current.png"));
        const diff = new PNG({ width: img1.width, height: img1.height });

        const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
        fs.writeFileSync("diff.png", PNG.sync.write(diff));

        assert.strictEqual(diffPixels, 0, `Visual mismatch detected: ${diffPixels} pixels berbeda`);
        await driver.quit();
    });
});
