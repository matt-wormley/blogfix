// Listen for messages
function extractFilenameFromURL(url) {
  const imgURL = new URL(url);
  var filename = imgURL.pathname.split('/').pop();
  var filename = decodeURIComponent(decodeURIComponent(decodeURIComponent(filename)));
  filename = filename.replace("_thumb", "").replace(/\[.*\]/,"").replace(/\+/g, " ").toLowerCase();

  if (!filename.match(/\./)) {
    filename = filename + '.jpg';
  }

  return filename;
}

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

      var scrape = imgElements.map((img) => {
        return {
          filename: extractFilenameFromURL(img.src)
        };
      });

      var insertInDiv = document.getElementsByClassName('optionHolder')[0];
      var oldFixdiv = document.getElementsByClassName('fixdiv');
      if (oldFixdiv.length > 0) {
        insertInDiv.removeChild(oldFixdiv[0]);
      }
      var fixdiv = document.createElement('div');
      fixdiv.className = "fixdiv";
      insertInDiv.appendChild(fixdiv);

      for (s in scrape) {
        var filename = scrape[s].filename;
        var pictureData = pictureIndex[filename];

        var title = document.createElement('p');
        title.textContent = '_______ ' +  filename + ' _______';
        fixdiv.appendChild(title);

        var dates = document.createElement('ul');
        fixdiv.appendChild(dates);

        for (p in pictureData) {
          function setupA(pictureData) {
            var date = document.createElement('li');
            var a = document.createElement('a');
            a.target = "_blank";
            var href = 'http://localhost:8887/' +  pictureData.picturePath;
            a.href = href;
            a.textContent = pictureData.date;
            a.onmouseover = () => { document.getElementById('blogfixPreview').src = href };
            a.onmouseout = () => { document.getElementById('blogfixPreview').src = 'http://localhost:8887/1x1.png'; };
            date.appendChild(a);
            dates.appendChild(date);
          }
          setupA(pictureData[p]);
        }
      }

      var imgParagraph = document.createElement('p');
      var img = document.createElement('img');
      img.id = "blogfixPreview";
      img.width = "250";
      img.height = "250";
      fixdiv.appendChild(img);

      var repairButton = document.createElement('div');
      repairButton.textContent = "[[[Repair Corrupt Links]]]";
      repairButton.onclick = () => {
        var postHtml = document.getElementById('postingHtmlBox').value;
        var parser = new DOMParser();
        var post = parser.parseFromString(postHtml, 'text/html').children[0].children[1];

        var replacements = {};
        for (let i = 0; i < post.children.length; ) {
          var e = post.children[i];
          if (e.tagName == "A" && e.children.length == 1 && e.children[0].tagName == "IMG") {
            var img = e.children[0];
            var filename = extractFilenameFromURL(e.href);
            var filenameParts = filename.match(/([0-9]*) (.*) ([^/]*)/);

            if (!filenameParts) {
              alert("Unable to parse the number, description, and image name from filename: " + filename);
            }
            replacements[filenameParts[3]] = {
              a_href: e.href,
              img_src: img.src,
              img_ordinal: filenameParts[1],
              title: filenameParts[2]
            };
            post.removeChild(e);
          } else {
            i++;
          }
        }

        var anchorElements = Array.from(post.getElementsByTagName('a'));
        for (let i = 0; i < anchorElements.length; i++) {
          a = anchorElements[i];
          filename = extractFilenameFromURL(a.href);
          if (filename in replacements && a.children.length == 1 && a.children[0].tagName == "IMG") {
            a.href = replacements[filename].a_href;
            a.children[0].src = replacements[filename].img_src;
            a.children[0].title = replacements[filename].title;
            a.children[0].alt = replacements[filename].title;
          }
        }

        document.getElementById('postingHtmlBox').value = post.innerHTML;
      };
      fixdiv.appendChild(repairButton);

      var postHtml = document.getElementById('postingHtmlBox').value;

      console.log("success");
      sendResponse({retry: false});
    } catch(error) {
      console.log("failure");
      sendResponse({retry: false});
    }

    return true;
  }
});
