// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
      var parser = new DOMParser();
      var postHtml = document.getElementById("postingHtmlBox").value;
      var post = parser.parseFromString(postHtml, "text/html").children[0];

      var anchorElements = Array.from(post.getElementsByTagName('a'));
      var hrefs = anchorElements.map(a => a.href);

      for (i in hrefs) {
        console.log('HREF: ' + hrefs[i]);
      }
    }
});
