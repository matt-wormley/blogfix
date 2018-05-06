// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'filterPictureIndex') {
      console.log("trying");
      try {
        var pictureIndex = msg.pictureIndex;
        var postHtml = document.getElementById('postingHtmlBox').value;
        var parser = new DOMParser();
        var post = parser.parseFromString(postHtml, 'text/html').children[0];

        var anchorElements = Array.from(post.getElementsByTagName('a'));
        var imgElements = Array.from(post.getElementsByTagName('img'));

        if (imgElements.length == 0) {
          sendResponse({retry: true});
          return;
        }
        var scrape = anchorElements.map((a,i) => {
          return {
            href: a.href,
            alt: imgElements[i].alt.toLowerCase()
          };
        });

        var fixdiv = document.createElement('div');
        var insertInDiv = document.getElementsByClassName('optionHolder')[0]
        insertInDiv.appendChild(fixdiv);

        for (s in scrape) {
          var filename = scrape[s].alt + '.jpg';
          var pictureData = pictureIndex[filename];

          var title = document.createElement('p');
          title.textContent = '_______ ' +  filename + ' _______';
          fixdiv.appendChild(title);

          var dates = document.createElement('ul');
          fixdiv.appendChild(dates);

          for (p in pictureData) {
            var date = document.createElement('li');
            var a = document.createElement('a');
            a.textContent = filename + " taken " + pictureData[p].date;
            a.onmouseover = () => { document.getElementById('blogfixPreview').src ='file:///d:/' +  pictureData[p].picturePath; }
            a.onmouseout = () => { document.getElementById('blogfixPreview').src = 'file:///d:/1x1.png'; }
            date.appendChild(a);
            dates.appendChild(date);
          }
        }

        var imgParagraph = document.createElement('p');
        var img = document.createElement('img');
        img.id = "blogfixPreview";
        fixdiv.appendChild(img);

        console.log("success");
        sendResponse({retry: false});
      } catch(error) {
        console.log("failure");
        sendResponse({retry: false});
      }

      return true;
    }
});
