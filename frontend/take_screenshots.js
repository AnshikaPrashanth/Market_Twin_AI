import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outDir = 'E:/epsilon/market_twin_ai/docs/screenshots';

// Ensure dir exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

const PAGES = [
  { name: 'command-center.png', path: '/' },
  { name: 'identity-map.png', path: '/global-identity' },
  { name: 'customer-twin.png', path: '/twin' },
  { name: 'ai-orchestration.png', path: '/orchestration' },
  { name: 'audience-intelligence.png', path: '/audience' },
  { name: 'measurement-dashboard.png', path: '/measurement' },
  { name: 'storefront-simulator.png', path: '/store' },
  { name: 'email-deliverability.png', path: '/demo/email' },
  { name: 'whatsapp-policy.png', path: '/demo/whatsapp' },
  { name: 'sms-push-gateway.png', path: '/demo/sms' },
];

async function run() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();

  console.log("Navigating to store to trigger demo...");
  await page.goto('http://localhost:3000/store', { waitUntil: 'networkidle0' });
  
  console.log("Clicking Run Demo...");
  // Find the button with text "Run Demo"
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Run Demo')) {
      await btn.click();
      console.log("Clicked! Waiting for demo to complete (15s)...");
      break;
    }
  }

  await sleep(15000); // wait for demo sequence to finish

  console.log("Taking screenshots...");
  for (let p of PAGES) {
    console.log(`Navigating to ${p.path} ...`);
    await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle0' });
    await sleep(2000); // give UI time to render charts/animations
    
    const dest = path.join(outDir, p.name);
    await page.screenshot({ path: dest, fullPage: true });
    console.log(`Saved ${dest}`);
  }

  await browser.close();
  console.log("Done!");
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
