const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the cookie (replace values with your cookie's details)
  const cookie = {
    name: 'your_cookie_name', // Cookie name
    value: 'your_cookie_value', // Cookie value
    domain: 'example.com', // Domain for the cookie (ensure it matches the site)
    path: '/', // Path for the cookie
    httpOnly: false, // Set to true if the cookie is HttpOnly
    secure: false, // Set to true if the cookie is Secure
    expires: -1 // Set to -1 for session cookie
  };

  await page.setCookie(cookie);

  // Navigate to the desired URL
  await page.goto('https://example.com', { waitUntil: 'networkidle2' }); // Replace with your URL

  // Capture full page height and set viewport width
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  const viewportWidth = 1200; // Width for the screenshot

  // Set viewport size to accommodate the full content
  await page.setViewport({ width: viewportWidth, height: height });

  // Take a full-page screenshot
  const screenshotPath = 'full_content_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Create PDF with the screenshot
  const pdfPath = 'output.pdf';
  const screenshotBuffer = fs.readFileSync(screenshotPath);
  const base64Image = screenshotBuffer.toString('base64');

  // Create HTML content for the PDF
  const pdfContent = `
    <html>
      <body style="margin: 0; display: flex; justify-content: center;">
        <img src="data:image/png;base64,${base64Image}" style="width: 100%; max-width: 100%;">
      </body>
    </html>
  `;

  // Create a new page for the PDF content
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(pdfContent, { waitUntil: 'networkidle0' });

  // Generate the PDF
  await pdfPage.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px'
    }
  });

  // Cleanup
  await pdfPage.close();
  await browser.close();

  // Optionally, remove the screenshot file
  fs.unlinkSync(screenshotPath);
})();
