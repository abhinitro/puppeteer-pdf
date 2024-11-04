const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to the desired width and height
  await page.setViewport({ width: 1200, height: 720 });

  // Navigate to the desired URL
  await page.goto('https://www.careinsurance.com', { waitUntil: ['networkidle0','domcontentloaded'] });

  // Wait for a specific selector to ensure the page is fully loaded
  await page.waitForSelector('body');

  // Create an array to store screenshot paths
  const screenshotPaths = [];

  // Get the total scrollable height
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  // Scroll through the page and take screenshots
  for (let scrollY = 0; scrollY < height; scrollY += 720) {
    await page.evaluate(scrollY => {
      window.scrollTo(0, scrollY);
    }, scrollY);

    // Wait for the scroll to settle
    //await page.waitForTimeout(500); // Adjust timeout as necessary

    // Take a screenshot and save it
    const screenshotPath = `screenshot-${scrollY}.png`;
    await page.screenshot({ path: screenshotPath });
    screenshotPaths.push(screenshotPath);
  }

  // Create a PDF with the screenshots
  const pdfPath = 'output.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      
    }
  });

  // Optionally, cleanup the screenshots after PDF creation
  const fs = require('fs');
  screenshotPaths.forEach(path => fs.unlinkSync(path));

  // Cleanup
  await browser.close();
})();
