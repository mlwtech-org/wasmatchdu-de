const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Catch errors within the page
    page.on('pageerror', err => {
      console.error('PAGE ERROR:', err.toString());
      process.exit(1);
    });

    console.log("Navigating to index...");
    await page.goto('http://localhost:3000/');
    
    // Inject mock auth state into local storage
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
    
    console.log("Navigating to dashboard...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    if (bodyText.includes("Something went wrong")) {
      console.error("TEST FAILED: ErrorBoundary caught a crash.");
      process.exit(1);
    }
    
    console.log("Dashboard loaded successfully!");
    console.log("BODY PREVIEW:", bodyText.substring(0, 150));
    
    // Check specific components
    const hasMiniPlayer = await page.evaluate(() => document.querySelector('.fixed.bottom-4') !== null);
    console.log("MiniPlayer present:", hasMiniPlayer);
    
    process.exit(0);
  } catch (err) {
    console.error("TEST FATAL ERROR:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
