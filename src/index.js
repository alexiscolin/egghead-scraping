const puppeteer = require('puppeteer');
const env = require('./env.js');
const URL = process.argv[2];

(async () => {
  // dom element selectors
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

  // await page.waitFor(1500);  // time for loading SPA -> need it because of SPA...
  await page.goto(URL);

  // get all lessons URL
  const lessonURLS = await page.evaluate(() => {
    const EGGHEAD_URLS = '#App-react-component > div > div.flex.flex-column.bg-base-secondary > div > div.mt3.bg-gray.w-100.flex.items-center.justify-center > div > div > div > div div.flex.flex-column.flex-grow-1.ph2.pv3 > a';
    return [...document.querySelectorAll(EGGHEAD_URLS)].map(link => link.href);
  });

  // Generator for parsing every Lessons's URL
  function* lessonURLSGen () {
    for (let i = 1; i < lessonURLS.length; i++) {
      getLessonVideo(lessonURLS[i]);
      yield lessonURLS[i];
    }
  }

  // Initialize iterator
  const lessonURLSIterator = lessonURLSGen();
  const getLessonVideo = async function(url) {
    await page.goto(url); // go to the next video page
    await page.waitFor('body'); // time for launching ddl button -> need it because of SPA...
    await page.click(EGGHEAD_VIDEO_BTN).then(()=> console.log('Download video :' + url)) // ddl and log
    await page.waitFor(1500); // time for launching download -> need to be in front of browser
    await lessonURLSIterator.next().done && await page.waitFor(1000 * 60).then(() => browser.close()); // if no more video -> shut down chromium -> 1min before closing
  }

  // Let's start scrapping
  await getLessonVideo(lessonURLS[0]);
})();
