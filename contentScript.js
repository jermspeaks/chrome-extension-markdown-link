// This function sends a message to the background script to clean the URL
function cleanURL(url, callback) {
  chrome.runtime.sendMessage(
    { action: "cleanURL", url: url },
    function (response) {
      callback(response.cleanedUrl);
    }
  );
}

// Function that formats the title and URL into Markdown, adding an exclamation point for YouTube or Twitter links
function formatMarkdown(title, cleanUrl) {
  // Array of domain patterns to match for special formatting
  // const specialDomains = ["youtube.com", "twitter.com"];

  // We need to check if the youtube URL has a video ID in it
  const isYoutubeURL = cleanUrl.includes("youtube.com");
  const isTwitterURL = cleanUrl.includes("twitter.com");

  // If the URL is a YouTube URL, we need to extract the video ID
  let videoId = "";
  let shortsId = "";
  if (isYoutubeURL) {
    const youtubeVideoRegex =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const youtubeShortsRegex = /^.*(youtu\.be\/shorts\/|shorts\/)([^#\&\?]*).*/;

    const videoIdsMatch = youtubeVideoRegex.exec(cleanUrl);
    if (videoIdsMatch && videoIdsMatch[2].length == 11) {
      videoId = videoIdsMatch[2];
    }
    const shortsIdsMatch = youtubeShortsRegex.exec(cleanUrl);
    if (shortsIdsMatch && shortsIdsMatch[2].length == 11) {
      shortsId = shortsIdsMatch[2];
    }
  }

  if (videoId) {
    // If the URL is a YouTube URL and the video ID is present, we need to add an exclamation mark to the Markdown format
    markdownFormat = `![${title}](https://youtu.be/${videoId})`;
  } else if (shortsId) {
    // If the URL is a YouTube URL and the video ID is present, we need to add an exclamation mark to the Markdown format
    markdownFormat = `![${title}](https://youtube.com/watch?v=${shortsId})`;
  } else if (isTwitterURL) {
    // If the URL is a Twitter URL, we need to add an exclamation mark to the Markdown format
    markdownFormat = `![${title}](${cleanUrl})`;
  } else {
    markdownFormat = `[${title}](${cleanUrl})`;
  }

  return markdownFormat;
}

// Function to format the URL and title in Markdown and copy to clipboard
function copyMarkdownLink(title, cleanUrl) {
  const markdownFormat = formatMarkdown(title, cleanUrl);
  navigator.clipboard.writeText(markdownFormat).then(
    function () {
      // If copying is successful, show a confirmation
      showConfirmation(`Link copied in Markdown format: ${markdownFormat}`);
    },
    function (err) {
      // If there is an error in copying to the clipboard, show an alert
      showAlert("Failed to copy the link to the clipboard. Error: " + err);
    }
  );
}

// Function to show a confirmation message
function showConfirmation(message) {
  const confirmationDiv = document.createElement("div");
  confirmationDiv.textContent = message;
  applyStyles(confirmationDiv, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px",
    backgroundColor: "green",
    color: "white",
    zIndex: "1000",
    borderRadius: "5px",
  });
  document.body.appendChild(confirmationDiv);
  setTimeout(() => confirmationDiv.remove(), 3000);
}

// Function to show an error alert
function showAlert(message) {
  const alertDiv = document.createElement("div");
  alertDiv.textContent = message;
  applyStyles(alertDiv, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px",
    backgroundColor: "red",
    color: "white",
    zIndex: "1000",
    borderRadius: "5px",
  });
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

// Utility function to apply multiple CSS styles to an element
function applyStyles(element, styles) {
  for (const property in styles) {
    element.style[property] = styles[property];
  }
}

// This function is called to initiate the copy process
function initiateCopyProcess() {
  const title = document.title;
  const url = window.location.href;

  cleanURL(url, (cleanedUrl) => {
    copyMarkdownLink(title, cleanedUrl);
  });
}

// Listen for the message from the background script or popup to initiate copying
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "copyMarkdownLink") {
    initiateCopyProcess();
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getMarkdownLink") {
    const title = document.title;
    const url = window.location.href;

    cleanURL(url, (cleanedUrl) => {
      const markdownFormat = formatMarkdown(title, cleanedUrl);
      sendResponse({ markdownFormat: markdownFormat });
    });

    return true; // Indicates you wish to send a response asynchronously
  }
});

// If the script is injected via the popup, it may be needed to trigger the copy process directly
if (window.hasRun) {
  initiateCopyProcess();
} else {
  window.hasRun = true;
}
