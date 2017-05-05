const CDP = require('chrome-remote-interface');
//const argv = require('minimist')(process.argv.slice(2));
const file = require('fs');

const spawn = require('child_process').spawn;

function launchHeadlessChrome(url) {
  return new Promise((resolve, reject) => {
    // Assuming MacOSx.
    const CHROME = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome';
    spawn(`${CHROME}`, [
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--disable-background-timer-throttling',
      '--kiosk',
      '--hide-scrollbars',
      url])
    setInterval(resolve, 5000);
  })
}


function initialize(argv){
    return new Promise((resolve, reject) => {
        // CLI Args
        const url = argv.url || 'https://www.google.com';
        const format = argv.format === 'jpeg' ? 'jpeg' : 'png';
        const viewportWidth = argv.viewportWidth || 1680;
        const viewportHeight = argv.viewportHeight || 1050;
        const aspectRatio = viewportWidth / viewportHeight;
        const imgWidth = argv.imgWidth || viewportWidth;
        const imgHeight = Math.floor(imgWidth / aspectRatio);
        const delay = argv.delay || 0;
        const userAgent = argv.userAgent;
        const fullPage = argv.full;

        // Start the Chrome Debugging Protocol
        CDP(async function(client) {
          // Extract used DevTools domains.
          const {DOM, Emulation, Network, Page, Runtime, Browser, Debugger} = client;
          // Enable events on domains we are interested in.
          await Page.enable();
          await DOM.enable();
          await Runtime.enable();

          // If user agent override was specified, pass to Network domain
          if (userAgent) {
            await Network.setUserAgentOverride({userAgent});
          }


          /*Browser.setWindowBounds({bounds:{
            windowState: 'fullscreen'
          }})*/

          // Set up viewport resolution, etc.
          const deviceMetrics = {
            width: viewportWidth,
            height: viewportHeight,
            deviceScaleFactor: 0,
            mobile: false,
            fitWindow: true,
          };
          //await Emulation.setDeviceMetricsOverride(deviceMetrics);
          await Emulation.setVisibleSize({width: imgWidth, height: imgHeight});

          await Debugger.setSkipAllPauses({skip:true})
          
          // Navigate to target page
          await Page.navigate({url});

          // Wait for page load event to take screenshot
          Page.loadEventFired(async () => {
            // If the `full` CLI option was passed, we need to measure the height of
            // the rendered page and use Emulation.setVisibleSize
            if (fullPage) {
              const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
              const {nodeId: bodyNodeId} = await DOM.querySelector({
                selector: 'body',
                nodeId: documentNodeId,
              });
              const {model: {height}} = await DOM.getBoxModel({nodeId: bodyNodeId});

              await Emulation.setVisibleSize({width: imgWidth, height: height});
              // This forceViewport call ensures that content outside the viewport is
              // rendered, otherwise it shows up as grey. Possibly a bug?
              await Emulation.forceViewport({x: 0, y: 0, scale: 1});
            }
            resolve(client);
          });
        }).on('error', err => {
          console.error('Cannot connect to browser:', err);
        });
    });
}

function screenCast(client, nthFrame, handler) {
    const {Page} = client;
    Page.startScreencast({
      format: 'png',
      everyNthFrame: nthFrame
    });
    
    Page.screencastFrame((frame) => {
        Page.screencastFrameAck({sessionId:frame.sessionId})
        handler(frame)
    });
}

module.exports = {
  initialize: initialize,
  launchHeadlessChrome: launchHeadlessChrome,
  screenCast: screenCast
}