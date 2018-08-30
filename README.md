# 📥 Egghead Scraping

Really simple Egghead video downloader (thanks [Puppeteer](https://pptr.dev/)).

It scrapes every Egghead courses' lessons, create a folder into the download folder and get each video.
Curently working with Github auth.

**V2 - Replacement of Yield generator function for Array.map in order to parallelize download !**

> Because Puppeteer scrape the Egghead website thanks to their website DOM structure, it may be impossible to get videos course anymore if they change that structure

## Getting Started

Choose the course you want to scrape, copy the course url (eg: https://egghead.io/courses/build-a-desktop-application-with-electron).

Change the id, psw and download folder path variables inside the `src/env.js` file.

Clone the repo, enter the downloaded folder, then **run the magic command `yarn get <myCourseURL>`.** Chromium starts, parses the course and downloads every video.

After the last download, Puppeteer will shut down the browser.

```bash

# Exemple -> change the url below by the one you want
yarn get https://egghead.io/courses/build-a-desktop-application-with-electron

```

## TODO

get every lessons that are not in course
