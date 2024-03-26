// Function to clean the URL by removing query parameters like `utm`
function cleanURL(url) {
  try {
    let urlObj = new URL(url);
    let searchParams = urlObj.searchParams;

    // Parameters to remove
    const paramsToRemove = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];

    // Remove specified search parameters
    paramsToRemove.forEach((param) => searchParams.delete(param));

    // Reconstruct the URL without the removed parameters
    urlObj.search = searchParams.toString();

    return urlObj.toString();
  } catch (error) {
    console.error("Error cleaning the URL:", error);
    return url; // Return the original URL if there's an error
  }
}

// Listen for the command from the shortcut
chrome.commands.onCommand.addListener(function (command) {
  if (command === "copy-markdown-link") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Send a message to the content script in the active tab
      chrome.tabs.sendMessage(tabs[0].id, { action: "copyMarkdownLink" });
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "cleanURL") {
    // Call cleanURL and return the cleaned URL to the sender
    sendResponse({ cleanedUrl: cleanURL(request.url) });
  }
});
