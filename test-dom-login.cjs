const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000/');
  
  // Set localStorage to fake a logged-in user
  await page.evaluate(() => {
    localStorage.setItem('player-storage', JSON.stringify({
      state: {
        user: { uid: 'test', email: 'test@test.com' },
        profiles: [{ id: 'p1', name: 'Test Profile', isKidsMode: false, avatarUrl: '' }],
        currentChannel: null,
        channels: [],
        favorites: [],
        recentlyWatched: []
      },
      version: 0
    }));
  });
  
  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard', {waitUntil: 'networkidle0'});
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("BODY HTML LENGTH:", html.length);
  console.log("BODY HTML PREVIEW:", html.substring(0, 1000));
  
  await browser.close();
})();
