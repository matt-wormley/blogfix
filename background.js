var urlRegex = /https:\/\/www.blogger.com\/blogger.g.*editor\/target=post/;

// A function to use as callback
function printHrefs(hrefs) {
}

// When the browser-action button is clicked...
chrome.browserAction.onClicked.addListener(function (tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'report_back'});
    }
});

