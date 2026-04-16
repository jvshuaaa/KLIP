import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const messages = [];

  page.on('console', msg => {
    messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    messages.push({ type: 'pageerror', text: err.message });
  });

  try {
    const response = await page.goto('http://localhost:5173/test', { waitUntil: 'networkidle' });
    const content = await page.content();
    console.log('HTTP status:', response?.status());
    console.log('Page content snippet:', content.slice(0, 500));
    console.log('Console messages:', JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();