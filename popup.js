// This button will ask the content script to send back the markdown link
document.getElementById("copyBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Request the markdown link from the content script
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getMarkdownLink" },
      (response) => {
        if (response && response.markdownFormat) {
          document.getElementById("markdownLink").value =
            response.markdownFormat;
          document.getElementById("copyToClipboard").style.display = "block";
        }
      }
    );
  });
});

// This button will copy the content of the textarea to the clipboard
document.getElementById("copyToClipboard").addEventListener("click", () => {
  const copyText = document.getElementById("markdownLink");
  copyText.select();
  document.execCommand("copy");
});
