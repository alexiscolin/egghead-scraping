const puppeteer = require('puppeteer');
const chalk = require('chalk');
const download = require('download');
const env = require('./env.js');
const URL = process.argv[2]; // get URL to scrape

(async () => {
  // DOM element selectors
  const USERNAME_SELECTOR = '#login_field';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';
  const EGGHEAD_VIDEO_BTN = '#App-react-component > div > div:nth-child(2) > section > div > div.relative.w-100 > section.w-100.pt2.pb3.pt0-l.pb0-l.css-ic4s7x > div > div.w-100.w-70-l.false > div.relative.items-center.justify-between.pv2.flex.css-1kldd4v > div.flex.items-center > div.ml3.dn.db-l > div';

  // Puppeteer action
  const browser = await puppeteer.launch({ headless: false }); // no headless because of chromium bug https://bugs.chromium.org/p/chromium/issues/detail?id=696481
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 700 })
  await page.goto('https://egghead.io/users/sign_in');

  // Egghead login (via github)
  await page.click('a[href="/users/auth/github"]');
  await page.waitFor('body');
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(env.GITHUB_ID);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(env.GITHUB_PWD);
  await page.click(BUTTON_SELECTOR);

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await page.waitFor('body'); // time for launching ddl button -> need it because of SPA...
  await page.goto(URL);

  // Get course title and create folder
  const courseTitle = await page.evaluate(() => {
    const titlePath = '#App-react-component > div > div.flex.flex-column.bg-base-secondary > div > div.bg-white.pb5-ns.pb4-m.pb4 > div > div.cf.pt3.flex.flex-row-l.flex-column > div.fl.w-100.w-100-m.w-60-ns.pa2.order-2.order-0-l.flex.false > div > div.flex-none.flex-m.flex-column.tc.tl-ns > h1';
    return document.querySelector(titlePath).innerText;
  });

  // Get all lessons URL
  const lessonURLS = await page.evaluate(() => {
    const EGGHEAD_URLS = '#App-react-component > div > div.flex.flex-column.bg-base-secondary > div > div.mt3.bg-gray.w-100.flex.items-center.justify-center > div > div > div > div div.flex.flex-column.flex-grow-1.ph2.pv3 > a';
    return [...document.querySelectorAll(EGGHEAD_URLS)].map(link => link.href);
  });

  // count generator function
  const lessonsCount = lessonURLS.length;
  const generator = function* () {
    for(let y = 1; y <= lessonsCount; y++){
      yield y;
    }
  };
  const progress = generator();

  // get link informations
  const findLink = async function(url) {
    // Multi pages -> increase speed
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(1000);
    await page.waitFor('body'); // Time for launching ddl button -> need it because of SPA...

    // Get the ddl link
    const pagedata = await page.evaluate(() => {
      const data = JSON.parse(document.querySelector('.js-react-on-rails-component').innerText);
      return data.lesson.download_url;
    });

    // Then, go there and download !
    await page.goto(pagedata);
    await page.waitFor('pre');
    await page.waitFor(1000);
    await page.evaluate(() => document.querySelector('pre').innerText).then(ddlURL => {
      download(ddlURL, `${env.DDL_FILE}${courseTitle}`).then(() => {
        const currentProgress = progress.next();
        console.log('')
        console.log(ddlURL);
        console.log(chalk.green(`download done! — video ${currentProgress.value}/${lessonsCount}`)); // Display infos and progress

        currentProgress.value === lessonsCount && browser.close();  // Finaly, close the browser
      });
    });
  }

  // Action !
  await Promise.all(lessonURLS.map(url => findLink(url)));
})();
