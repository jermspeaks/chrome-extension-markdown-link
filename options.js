document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("saveOptions").addEventListener("click", saveOptions);

// Added function to get and display the current shortcut
function getCurrentShortcut() {
  chrome.commands.getAll(function (commands) {
    const commandForCopy = commands.find(
      (c) => c.name === "copy-markdown-link"
    );
    if (commandForCopy) {
      document.getElementById("shortcutKey").value =
        commandForCopy?.shortcut || "Not set";
    }
  });
}

function saveOptions() {
  var outputFormat = document.getElementById("outputFormat").value;
  chrome.storage.sync.set({ outputFormat }, function () {
    console.log("Options saved.");
    // Optionally, confirm to the user that options were saved.
  });
}

function restoreOptions() {
  chrome.storage.sync.get("outputFormat", function (data) {
    document.getElementById("outputFormat").value =
      data.outputFormat || "markdown";
  });
  // Call getCurrentShortcut to display the current shortcut on page load
  getCurrentShortcut();
}
