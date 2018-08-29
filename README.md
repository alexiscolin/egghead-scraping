# 📥 Egghead Scraping

Really simple Egghead video downloader (thanks [Puppeteer](https://pptr.dev/)).

It scrapes every Egghead courses' lessons, create a folder into the download folder and get each video.
Curently working with Github auth.

*Because Puppeteer scrape the Egghead website thanks to their website DOM structure, it may be impossible to get videos course anymore if they change that structure*

## Getting Started

Choose the course you want to scrape, copy the course url (eg: https://egghead.io/courses/build-a-desktop-application-with-electron).

Change the id, psw and download folder path variables inside the `src/env.js` file.

Clone the repo, enter the downloaded folder, then **run the magic command `yarn get <myCourseURL>`.** Let Chromium start, parse the course and download every video, one by one.

After the last download and 1min of inactivity Puppeteer will shut down the browser.

```bash

yarn get https://egghead.io/courses/build-a-desktop-application-with-electron

```

Due to a [bug](https://bugs.chomium.org/p/chromium/issues/detail?id=696481) in Chromium, be sure to keep the Chromium window available on your computer screen. That's why headless mode is disabled here.
