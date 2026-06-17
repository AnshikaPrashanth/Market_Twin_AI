const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../docs/screenshots');

const pagesToScreenshot = [
  { path: '/', name: 'command-center.png' },
  { path: '/global-identity', name: 'identity-map.png' },
  { path: '/twin', name: 'customer-twin.png' },
  { path: '/orchestration', name: 'ai-orchestration.png' },
  { path: '/audience', name: 'audience-intelligence.png' },
  { path: '/measurement', name: 'measurement-dashboard.png' },
  { path: '/store', name: 'storefront-simulator.png' },
  { path: '/store', name: 'storefront-cart-products.png' },
  { path: '/demo/email', name: 'email-deliverability.png' },
  { path: '/demo/whatsapp', name: 'whatsapp-policy.png' },
  { path: '/demo/sms', name: 'sms-push-gateway.png' },
  { path: '/demo/impact', name: 'ai-impact-center.png' }
];

(async () => {
  if (!fs.existsSync(OUT_DIR)){
      fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to run demo...');
  await page.goto(`${URL}/store`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  try {
    console.log('Clicking Run Demo button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(b => b.textContent.includes('Run Demo'));
      if (demoBtn) demoBtn.click();
    });
    console.log('Waiting for demo to complete (approx 15 seconds)...');
    await new Promise(r => setTimeout(r, 15000));
  } catch (err) {
    console.error('Failed to run demo automatically.', err);
  }

  for (const item of pagesToScreenshot) {
    try {
      console.log(`Navigating to ${URL}${item.path}`);
      await page.goto(`${URL}${item.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
      // wait a bit for animations and state hydration
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(OUT_DIR, item.name), fullPage: true });
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Failed to screenshot ${item.name}`, err);
    }
  }

  await browser.close();
  console.log('Screenshots completed.');
})();
