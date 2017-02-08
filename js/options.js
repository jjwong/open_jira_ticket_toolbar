// Saves options to chrome.storage.sync.
function save_options() {
  var input_url = document.getElementById('inputURL').value;
  var input_default_project = document.getElementById('inputDefaultProject').checked;
  chrome.storage.sync.set({
    useURL: input_url,
    useDefaultProject: input_default_project
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
// Defined values are defaults.
function restore_options() {
  chrome.storage.sync.get({
    useURL: "http://jiraland.issues.com",
    useDefaultProject: "STACK"
  }, function(items) {
    document.getElementById('useURL').value = items.useURL;
    document.getElementById('inputDefaultProject').value = items.useDefaultProject;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);