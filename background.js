var urlRegex = /https:\/\/www.blogger.com\/blogger.g.*editor\/target=post/;

console.log("fetching...");
fetch('https://raw.githubusercontent.com/matt-wormley/blogfix/master/picture_index.html')
  .then(function (response) {
    return response.text();
  })
  .then(function (picture_index_html) {
    var parser = new DOMParser();
    console.log("DONE");
    var piDOM = parser.parseFromString(picture_index_html, "text/html").children[0];
    var trElements = piDOM.getElementsByTagName('tr');

    var pictureIndex = {};
    var datePuller = /\((.*)\)/;
    for (let i = 0; i < trElements.length; i++) {
      const filename = trElements[i].children[0].textContent.trim().toLowerCase();
      const hrefURL = new URL(trElements[i].children[1].children[0].href);
      const title = trElements[i].children[1].children[0].textContent;
      const date = title.match(datePuller)[1]

      if (!pictureIndex.hasOwnProperty(filename)) {
        pictureIndex[filename] = [];
      }
      pictureIndex[filename].push({
        picturePath: hrefURL.pathname.substring(1),
        date: date
      });
    }

    console.log("DONE");

    // When the browser-action button is clicked...
    chrome.browserAction.onClicked.addListener(function (tab) {
      // ...check the URL of the active tab against our pattern and...
      if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {text: 'filterPictureIndex', pictureIndex: pictureIndex});
      }
    });

    chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
      if (changeInfo.status == 'complete' && tab.active) {
        function tryPictureIndex() {
          chrome.tabs.sendMessage(tab.id, {text: 'filterPictureIndex', pictureIndex: pictureIndex}, (response) => {
            if (response.retry) {
              tryPictureIndex();
            }
          });
        };

        tryPictureIndex();
      };
    });
  });
