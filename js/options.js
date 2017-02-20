function showErrorText(string) {
  var displayStatus = document.getElementById('status');
  displayStatus.style.color = "red";
  displayStatus.innerText = string;
  setTicketPreview("Invalid options set.");
  throw "invalid";
}

function setTicketPreview(string) {
  document.getElementById('ticketPreview').innerText = string;
}

function sanitizeURL() {
  // We are only removing the trailing slash for now.
  var input_url = document.getElementById('inputURL').value;

  if (isBlank(input_url)) {
    showErrorText("Please enter a URL!");
  }

  var trailing_regex = new RegExp('\/+$', 'ig');
  var sanitized_url = input_url.replace(trailing_regex, "");
  return sanitized_url;
}

function sanitizeProject() {
  var input_default_project = document.getElementById('inputDefaultProject').value;
  if (isBlank(input_default_project)) {
    showErrorText("Please enter a default project!");
  }
  var only_text_regex = new RegExp('[a-z]+', 'i');
  var sanitized_project = input_default_project.match(only_text_regex);
  return sanitized_project[0].toUpperCase();
}

function isBlank(string) {
  var trimString = string.trim();
  return (!trimString || 0 === trimString.length)
}

// Saves options to chrome.storage.sync.
function save_options() {
  var input_url = sanitizeURL();
  var input_default_project = sanitizeProject();
  chrome.storage.sync.set({
    useURL: input_url,
    useDefaultProject: input_default_project
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.style.color = "#33cc33";
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
    restore_options();
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
    document.getElementById('inputURL').value = items.useURL;
    document.getElementById('inputDefaultProject').value = items.useDefaultProject;
    setTicketPreview(items.useURL + "/browse/" + items.useDefaultProject);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);