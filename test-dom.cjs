const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/dashboard', {waitUntil: 'networkidle0'});
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML LENGTH:", html.length);
  console.log("BODY HTML PREVIEW:", html.substring(0, 500));
  
  await browser.close();
})();
