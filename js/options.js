const OPTIONS_NEED_URL = "OPTIONS_NEED_URL";
const OPTIONS_NEED_HTTP = "OPTIONS_NEED_HTTP";
const OPTIONS_NEED_KEY = "OPTIONS_NEED_KEY";
const RANKS = [
  "Explorer",
  "JIRA Opener",
  "Agile Apprentice",
  "Scrum Master",
  "Fastest JIRA finder",
  "Agile Adept",
  "Keyboard Pro",
  "Agile Master",
  "Supreme Agile Chief Keyboard Pro",
  "Supreme Agile Chief Scrum Master Keyboard Pro",
];

function showErrorText(string, project_tracker_id) {
  removeError();

  var displayStatus = document.getElementById("status");

  newContent = document.createElement("div");
  var newDiv = displayStatus.appendChild(newContent);
  newDiv.setAttribute("id", "error");

  if (string === OPTIONS_NEED_URL) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsUrl");
  } else if (string === OPTIONS_NEED_HTTP) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsHttp");
  } else if (string === OPTIONS_NEED_KEY) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsKey");
  }

  displayStatus.style.color = "red";
  if (project_tracker_id == 1) {
    setPreviewError("ticketPreview", "badOptions");
  } else {
    setPreviewError("ticketSecondaryPreview", "badSecondaryOptions");
  }

  setTimeout(function () {
    newDiv.remove();
  }, 3000);
  throw "invalid";
}

function showSuccessText() {
  removeSuccess();
  // Need to generate a new div within status for the localization to work
  var displayStatus = document.getElementById("status");
  newContent = document.createElement("div");
  var newDiv = displayStatus.appendChild(newContent);
  newDiv.style.color = "#33cc33";
  newDiv.textContent = chrome.i18n.getMessage("optionsSuccess");
  setTimeout(function () {
    newDiv.remove();
  }, 3000);
}

function removeError() {
  if (document.getElementById("error")) {
    document.getElementById("error").remove();
  }
}

function removeSuccess() {
  if (document.getElementById("success")) {
    document.getElementById("success").remove();
  }
}

function setPreviewError(error_display_id, preview_id) {
  var badOptionsText = document.getElementById(error_display_id);
  badOptionsText.style.color = "red";
  badOptionsText.style.visibility = "visible";
  setTicketPreview("N/A", "red", preview_id);
}

function setTicketPreview(string, color, element_id) {
  var ticketPreview = document.getElementById(element_id);
  ticketPreview.style.color = color;
  ticketPreview.innerText = string;
}

function sanitizeURL(element_id, project_tracker_id) {
  // We are only removing the trailing slash for now.
  var input_url = document.getElementById(element_id).value;

  // rule set 1 - unchanged, requirements are needed for default project
  if (project_tracker_id == 1) {
    if (isBlank(input_url)) {
      showErrorText(OPTIONS_NEED_URL, project_tracker_id);
    } else if (!checkHttp(input_url)) {
      showErrorText(OPTIONS_NEED_HTTP, project_tracker_id);
    }
  }

  // rule set 2
  if (project_tracker_id == 2) {
    if (!isBlank(input_url) && !checkHttp(input_url)) {
      showErrorText(OPTIONS_NEED_HTTP, project_tracker_id);
    }
  }

  var trailing_regex = new RegExp("/+$", "ig");
  var sanitized_url = input_url.replace(trailing_regex, "");
  return sanitized_url;
}

function checkHttp(string) {
  var http_regex = new RegExp("^https?://.*$", "i");
  if (string.match(http_regex)) {
    return true;
  } else {
    return false;
  }
}

function sanitizeProject(element_id, project_tracker_id) {
  var input_default_project = document.getElementById(element_id).value;

  // rule set 1
  if (project_tracker_id == 1) {
    if (isNumberAtStart(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    if (isBlank(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    var only_text_regex = new RegExp("[a-z]+\\d*[a-z]*\\d*", "i");
    var sanitized_project = input_default_project.match(only_text_regex);
    return sanitized_project[0].toUpperCase();
  }

  //rule set 2
  if (project_tracker_id == 2 && !isBlank(input_default_project)) {
    if (isNumberAtStart(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    var only_text_regex = new RegExp("[a-z]+\\d*[a-z]*\\d*", "i");
    var sanitized_project = input_default_project.match(only_text_regex);
    return sanitized_project[0].toUpperCase();
  } else if (isBlank(input_default_project)){
    return null
  }
}

function isBlank(string) {
  var trimString = string.trim();
  return !trimString || 0 === trimString.length;
}

// Saves options to chrome.storage.sync.
function save_options() {
  let input_url = sanitizeURL("inputURL", 1);
  let input_default_project = sanitizeProject("inputDefaultProject", 1);
  let input_secondary_url = sanitizeURL("inputSecondaryURL", 2);
  let input_secondary_project = sanitizeProject("inputSecondaryProject", 2);
  // var input_language = document.getElementById("inputLanguageOptions").value;
  let input_world_clock = document.getElementById("worldClock").checked;
  let input_fiscal_quarter = document.getElementById("fiscalQuarter").checked;
  let input_history_preference =
    document.getElementById("historyPreference").checked;
  chrome.storage.sync.set(
    {
      useURL: input_url,
      useDefaultProject: input_default_project,
      useSecondaryURL: input_secondary_url,
      useSecondaryProject: input_secondary_project,
      useWorldClock: input_world_clock,
      useFiscalQuarter: input_fiscal_quarter,
      useHistoryPreference: input_history_preference,
      // useLanguage: input_language,
    },
    function () {
      // Update status to let user know options were saved.
      showSuccessText();
      restore_options();
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
// Defined values are defaults.
function restore_options() {
  var badOptionsText = document.getElementById("badOptions");
  badOptionsText.style.visibility = "hidden";
  chrome.storage.sync.get(
    {
      useURL: "http://jiraland.issues.com",
      useDefaultProject: "STACK",
      useLanguage: "en",
      useWorldClock: false,
      useFiscalQuarter: false,
      useHistoryPreference: true,
      useSecondaryURL: "",
      useSecondaryProject: "",
    },
    function (items) {
      document.getElementById("inputURL").value = items.useURL;
      document.getElementById("inputDefaultProject").value =
        items.useDefaultProject;
      document.getElementById("inputSecondaryURL").value =
        items.useSecondaryURL;
      document.getElementById("inputSecondaryProject").value =
        items.useSecondaryProject;
      document.getElementById("worldClock").checked = items.useWorldClock;
      document.getElementById("fiscalQuarter").checked = items.useFiscalQuarter;
      document.getElementById("historyPreference").checked =
        items.useHistoryPreference;

      // default project preview
      setTicketPreview(
        items.useURL + "/browse/" + items.useDefaultProject,
        "green",
        "ticketPreview"
      );

      console.log(items.useSecondaryURL + items.useSecondaryProject);

      // don't display preview if secondary is not set.
      if (items.useSecondaryURL != null && items.useSecondaryProject != null) {
        //secondary project preview
        setTicketPreview(
          items.useSecondaryURL + "/browse/" + items.useSecondaryProject,
          "green",
          "ticketSecondaryPreview"
        );
      }
    }
  );
  retrieveUsageOptionDisplay();
}

function retrieveUsageOptionDisplay() {
  chrome.storage.sync.get({ userUsage: 0 }, function (items) {
    let userUsage = items.userUsage;
    let optionsUsage = document.getElementById("usageNumber");

    optionsUsage.textContent = userUsage;
    setRankDisplay(userUsage);
  }); //end get sync
} //end retrieveUsageOptionDisplay

function setRankDisplay(usage) {
  const rankElement = document.getElementById("rank");
  let rankName;
  let rankNumber;

  if (usage < 100) {
    rankName = RANKS[0];
  } else if (usage < 200) {
    rankName = RANKS[1];
  } else if (usage < 500) {
    rankName = RANKS[2];
  } else if (usage < 1000) {
    rankName = RANKS[3];
  } else if (usage < 5000) {
    rankName = RANKS[4];
  } else if (usage < 10000) {
    rankName = RANKS[5];
  } else if (usage < 20000) {
    rankName = RANKS[6];
  } else if (usage < 30000) {
    rankName = RANKS[7];
  } else if (usage <= 49999) {
    rankName = RANKS[8];
  } else if (usage >= 50000) {
    rankName = RANKS[9];
  }

  rankNumber = RANKS.indexOf(rankName);
  rankElement.textContent = rankNumber + " - " + rankName;
}

document.addEventListener("DOMContentLoaded", restore_options);
window.onload = function () {
  document.getElementById("save").addEventListener("click", save_options);
};

function isNumberAtStart(string) {
  // number only regex
  const number_at_start_regex = new RegExp("^\\d+", "i");
  const string_results = string.match(number_at_start_regex);

  if (string_results == null) {
    return false;
  } else {
    return true;
  }
}
