const OPTIONS_NEED_URL = "OPTIONS_NEED_URL";
const OPTIONS_NEED_HTTP = "OPTIONS_NEED_HTTP";
const OPTIONS_NEED_KEY = "OPTIONS_NEED_KEY";
const RANKS = [
  "Explorer",
  "JIRA Opener",
  "Agile Apprentice",
  "Scrum Scout",
  "Fastest JIRA Finder",
  "Agile Adept",
  "Keyboard Pro",
  "Sprint Strategist",
  "Agile Master",
  "Supreme Agile Chief Keyboard Pro",
  "Supreme Agile Chief Scrum Master Keyboard Pro",
  "Workflow Whisperer",
  "Backlog Baron",
  "Epic Executor",
  "JIRA Juggernaut",
  "Velocity Virtuoso",
  "Sprint Sorcerer",
  "Kanban Commander",
  "JIRA Overlord",
  "Chief Ticket Alchemist",
  "Legendary Agile Archmage",
];

function showErrorText(string, project_tracker_id) {
  removeError();

  var displayStatus = document.getElementById("status");

  newContent = document.createElement("div");
  var newDiv = displayStatus.appendChild(newContent);
  newDiv.setAttribute("id", "error");

  if (string === OPTIONS_NEED_URL) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsUrl");
    // Highlight the URL field
    if (project_tracker_id == 1) {
      document.getElementById("inputURL").classList.add("error");
    } else {
      document.getElementById("inputSecondaryURL").classList.add("error");
    }
  } else if (string === OPTIONS_NEED_HTTP) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsHttp");
    // Highlight the URL field
    if (project_tracker_id == 1) {
      document.getElementById("inputURL").classList.add("error");
    } else {
      document.getElementById("inputSecondaryURL").classList.add("error");
    }
  } else if (string === OPTIONS_NEED_KEY) {
    newDiv.textContent = chrome.i18n.getMessage("errorOptionsKey");
    // Highlight the project field
    if (project_tracker_id == 1) {
      document.getElementById("inputDefaultProject").classList.add("error");
    } else {
      document.getElementById("inputSecondaryProject").classList.add("error");
    }
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
  badOptionsText.classList.remove("hidden");
  setTicketPreview("N/A", "red", preview_id);

  // Update preview section styling
  if (preview_id === "ticketPreview") {
    document.querySelector(".preview-section").classList.add("error");
  } else if (preview_id === "ticketSecondaryPreview") {
    document.querySelectorAll(".preview-section")[1].classList.add("error");
  }
}

function setTicketPreview(string, color, element_id) {
  var ticketPreview = document.getElementById(element_id);
  ticketPreview.style.color = color;
  ticketPreview.innerText = string;

  // Clear error messages and styling when preview is valid
  if (color === "green") {
    if (element_id === "ticketPreview") {
      document.getElementById("badOptions").classList.add("hidden");
      document.querySelector(".preview-section").classList.remove("error");
    } else if (element_id === "ticketSecondaryPreview") {
      document.getElementById("badSecondaryOptions").classList.add("hidden");
      document
        .querySelectorAll(".preview-section")[1]
        .classList.remove("error");
    }
  }
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
  var allow_underscores = document.getElementById("allowUnderscores").checked;

  // rule set 1
  if (project_tracker_id == 1) {
    if (isNumberAtStart(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    if (isBlank(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    // Use different regex based on underscore setting
    var only_text_regex = allow_underscores
      ? new RegExp("[a-z0-9_]+", "i")
      : new RegExp("[a-z]+\\d*[a-z]*\\d*", "i");

    var sanitized_project = input_default_project.match(only_text_regex);
    return sanitized_project[0].toUpperCase();
  }

  //rule set 2
  if (project_tracker_id == 2 && !isBlank(input_default_project)) {
    if (isNumberAtStart(input_default_project)) {
      showErrorText(OPTIONS_NEED_KEY, project_tracker_id);
    }

    // Use different regex based on underscore setting
    var only_text_regex = allow_underscores
      ? new RegExp("[a-z0-9_]+", "i")
      : new RegExp("[a-z]+\\d*[a-z]*\\d*", "i");

    var sanitized_project = input_default_project.match(only_text_regex);
    return sanitized_project[0].toUpperCase();
  } else if (isBlank(input_default_project)) {
    return null;
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
  let input_work_hours = document.getElementById("workHours").checked;
  let input_fiscal_quarter = document.getElementById("fiscalQuarter").checked;
  let input_history_preference =
    document.getElementById("historyPreference").checked;
  let input_allow_underscores =
    document.getElementById("allowUnderscores").checked;
  let input_options_link = document.getElementById("optionsLink").checked;
  let input_primary_project_color = document.getElementById(
    "primaryProjectColor"
  ).value;
  let input_secondary_project_color = document.getElementById(
    "secondaryProjectColor"
  ).value;
  let input_primary_project_text_color = document.getElementById(
    "primaryProjectTextColor"
  ).value;
  let input_secondary_project_text_color = document.getElementById(
    "secondaryProjectTextColor"
  ).value;

  // set tracker to 1 if either secondary option is empty
  if (input_secondary_url == null || input_secondary_project == null) {
    chrome.storage.sync.set({ useProjectTracker: 1 }, function () {});
  }

  // Get work hours settings
  let work_hours_settings = {
    LA: {
      start: document.getElementById("workHoursLAStart").value,
      end: document.getElementById("workHoursLAEnd").value
    },
    NY: {
      start: document.getElementById("workHoursNYStart").value,
      end: document.getElementById("workHoursNYEnd").value
    },
    UTC: {
      start: document.getElementById("workHoursUTCStart").value,
      end: document.getElementById("workHoursUTCEnd").value
    },
    India: {
      start: document.getElementById("workHoursIndiaStart").value,
      end: document.getElementById("workHoursIndiaEnd").value
    },
    Singapore: {
      start: document.getElementById("workHoursSingaporeStart").value,
      end: document.getElementById("workHoursSingaporeEnd").value
    },
    Sydney: {
      start: document.getElementById("workHoursSydneyStart").value,
      end: document.getElementById("workHoursSydneyEnd").value
    }
  };

  // Get working days settings
  let working_days = {
    monday: document.getElementById("workDayMonday").checked,
    tuesday: document.getElementById("workDayTuesday").checked,
    wednesday: document.getElementById("workDayWednesday").checked,
    thursday: document.getElementById("workDayThursday").checked,
    friday: document.getElementById("workDayFriday").checked,
    saturday: document.getElementById("workDaySaturday").checked,
    sunday: document.getElementById("workDaySunday").checked
  };

  // set all the options
  chrome.storage.sync.set(
    {
      useURL: input_url,
      useDefaultProject: input_default_project,
      useSecondaryURL: input_secondary_url,
      useSecondaryProject: input_secondary_project,
      useWorldClock: input_world_clock,
      useWorkHours: input_work_hours,
      workHoursSettings: work_hours_settings,
      workingDays: working_days,
      useFiscalQuarter: input_fiscal_quarter,
      useHistoryPreference: input_history_preference,
      useAllowUnderscores: input_allow_underscores,
      useOptionsLink: input_options_link,
      usePrimaryProjectColor: input_primary_project_color,
      useSecondaryProjectColor: input_secondary_project_color,
      usePrimaryProjectTextColor: input_primary_project_text_color,
      useSecondaryProjectTextColor: input_secondary_project_text_color,
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
  var badSecondaryOptionsText = document.getElementById("badSecondaryOptions");
  badOptionsText.classList.add("hidden");
  badSecondaryOptionsText.classList.add("hidden");

  // Clear error styling from preview sections
  document.querySelectorAll(".preview-section").forEach((section) => {
    section.classList.remove("error");
  });

  // Clear error highlighting from input fields
  const inputFields = [
    "inputURL",
    "inputDefaultProject",
    "inputSecondaryURL",
    "inputSecondaryProject",
  ];

  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("error");
    }
  });
  chrome.storage.sync.get(
    {
      useURL: "http://jiraland.issues.com",
      useDefaultProject: "STACK",
      useLanguage: "en",
      useWorldClock: false,
      useWorkHours: false,
      workHoursSettings: {
        LA: { start: "09:00", end: "17:00" },
        NY: { start: "09:00", end: "17:00" },
        UTC: { start: "09:00", end: "17:00" },
        India: { start: "09:00", end: "17:00" },
        Singapore: { start: "09:00", end: "17:00" },
        Sydney: { start: "09:00", end: "17:00" }
      },
      workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      useFiscalQuarter: false,
      useHistoryPreference: true,
      useAllowUnderscores: false,
      useOptionsLink: true,
      usePrimaryProjectColor: "#ffffff",
      useSecondaryProjectColor: "#2c3e50",
      usePrimaryProjectTextColor: "#000000",
      useSecondaryProjectTextColor: "#ffffff",
      useSecondaryURL: "",
      useSecondaryProject: "",
      useProjectTracker: 1,
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
      document.getElementById("workHours").checked = items.useWorkHours;
      document.getElementById("fiscalQuarter").checked = items.useFiscalQuarter;
      document.getElementById("historyPreference").checked =
        items.useHistoryPreference;
      document.getElementById("allowUnderscores").checked =
        items.useAllowUnderscores;
      document.getElementById("optionsLink").checked = items.useOptionsLink;
      document.getElementById("primaryProjectColor").value =
        items.usePrimaryProjectColor;
      document.getElementById("secondaryProjectColor").value =
        items.useSecondaryProjectColor;
      document.getElementById("primaryProjectTextColor").value =
        items.usePrimaryProjectTextColor;
      document.getElementById("secondaryProjectTextColor").value =
        items.useSecondaryProjectTextColor;

      // default project preview
      setTicketPreview(
        items.useURL + "/browse/" + items.useDefaultProject,
        "green",
        "ticketPreview"
      );

      // don't display preview if secondary is not set.
      if (items.useSecondaryURL != null && items.useSecondaryProject != null) {
        //secondary project preview
        setTicketPreview(
          items.useSecondaryURL + "/browse/" + items.useSecondaryProject,
          "green",
          "ticketSecondaryPreview"
        );
      }

      // Restore work hours settings
      if (items.workHoursSettings) {
        document.getElementById("workHoursLAStart").value = items.workHoursSettings.LA.start;
        document.getElementById("workHoursLAEnd").value = items.workHoursSettings.LA.end;
        document.getElementById("workHoursNYStart").value = items.workHoursSettings.NY.start;
        document.getElementById("workHoursNYEnd").value = items.workHoursSettings.NY.end;
        document.getElementById("workHoursUTCStart").value = items.workHoursSettings.UTC.start;
        document.getElementById("workHoursUTCEnd").value = items.workHoursSettings.UTC.end;
        document.getElementById("workHoursIndiaStart").value = items.workHoursSettings.India.start;
        document.getElementById("workHoursIndiaEnd").value = items.workHoursSettings.India.end;
        document.getElementById("workHoursSingaporeStart").value = items.workHoursSettings.Singapore.start;
        document.getElementById("workHoursSingaporeEnd").value = items.workHoursSettings.Singapore.end;
        document.getElementById("workHoursSydneyStart").value = items.workHoursSettings.Sydney.start;
        document.getElementById("workHoursSydneyEnd").value = items.workHoursSettings.Sydney.end;
      }

      // Restore working days settings
      if (items.workingDays) {
        document.getElementById("workDayMonday").checked = items.workingDays.monday;
        document.getElementById("workDayTuesday").checked = items.workingDays.tuesday;
        document.getElementById("workDayWednesday").checked = items.workingDays.wednesday;
        document.getElementById("workDayThursday").checked = items.workingDays.thursday;
        document.getElementById("workDayFriday").checked = items.workingDays.friday;
        document.getElementById("workDaySaturday").checked = items.workingDays.saturday;
        document.getElementById("workDaySunday").checked = items.workingDays.sunday;
      }

      // Handle work hours dependency on world clock
      updateWorkHoursVisibility(items.useWorldClock);
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

  if (usage < 50) {
    rankName = RANKS[0];
  } else if (usage < 100) {
    rankName = RANKS[1];
  } else if (usage < 200) {
    rankName = RANKS[2];
  } else if (usage < 500) {
    rankName = RANKS[3];
  } else if (usage < 1000) {
    rankName = RANKS[4];
  } else if (usage < 2000) {
    rankName = RANKS[5];
  } else if (usage < 5000) {
    rankName = RANKS[6];
  } else if (usage < 10000) {
    rankName = RANKS[7];
  } else if (usage < 20000) {
    rankName = RANKS[8];
  } else if (usage < 30000) {
    rankName = RANKS[9];
  } else if (usage < 50000) {
    rankName = RANKS[10];
  } else if (usage < 75000) {
    rankName = RANKS[11];
  } else if (usage < 100000) {
    rankName = RANKS[12];
  } else if (usage < 150000) {
    rankName = RANKS[13];
  } else if (usage < 200000) {
    rankName = RANKS[14];
  } else if (usage < 300000) {
    rankName = RANKS[15];
  } else if (usage < 500000) {
    rankName = RANKS[16];
  } else if (usage < 750000) {
    rankName = RANKS[17];
  } else if (usage < 1000000) {
    rankName = RANKS[18];
  } else if (usage < 2000000) {
    rankName = RANKS[19];
  } else if (usage >= 2000000) {
    rankName = RANKS[20];
  }

  rankNumber = RANKS.indexOf(rankName);
  rankElement.textContent = rankNumber + " - " + rankName;
}

document.addEventListener("DOMContentLoaded", restore_options);
window.onload = function () {
  document.getElementById("save").addEventListener("click", save_options);
  document.getElementById("resetColors").addEventListener("click", resetColors);
  initScrollIndicator();

  // Add event listeners to clear error highlighting when user starts typing
  const inputFields = [
    "inputURL",
    "inputDefaultProject",
    "inputSecondaryURL",
    "inputSecondaryProject",
  ];

  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("input", function () {
        this.classList.remove("error");
      });
      field.addEventListener("focus", function () {
        this.classList.remove("error");
      });
    }
  });

  // Add rating button functionality with browser detection
  const ratingButton = document.getElementById("rateExtension");
  const ratingText = document.querySelector(".rating-section p");
  const ratingTitle = document.querySelector(".rating-section h3");

  if (ratingButton && ratingText && ratingTitle) {
    // Detect browser
    const isEdge = navigator.userAgent.includes("Edg");
    const isChrome =
      navigator.userAgent.includes("Chrome") &&
      !navigator.userAgent.includes("Edg");

    if (isEdge) {
      // Edge Add-ons store
      ratingTitle.textContent = "Enjoying the extension?";
      ratingText.textContent =
        "Rate us 5 stars on the Microsoft Edge Add-ons store!";
      ratingButton.textContent = "Rate on Edge Add-ons";
      ratingButton.addEventListener("click", function (e) {
        e.preventDefault();
        chrome.tabs.create({
          url: "https://microsoftedge.microsoft.com/addons/detail/open-jira-ticket/mcgalgcbedknfbohhhnngnbofngoifkm",
        });
      });
    } else if (isChrome) {
      // Chrome Web Store
      ratingTitle.textContent = "Enjoying the extension?";
      ratingText.textContent = "Rate us 5 stars on the Chrome Web Store!";
      ratingButton.textContent = "Rate on Chrome Web Store";
      ratingButton.addEventListener("click", function (e) {
        e.preventDefault();
        chrome.tabs.create({
          url: "https://chrome.google.com/webstore/detail/open-jira-ticket/blblhnpjhhjdbgbcgmmldohpalmbedci",
        });
      });
    } else {
      // Fallback for other browsers
      ratingTitle.textContent = "Enjoying the extension?";
      ratingText.textContent = "Rate us 5 stars on the Chrome Web Store!";
      ratingButton.textContent = "Rate Extension";
      ratingButton.addEventListener("click", function (e) {
        e.preventDefault();
        chrome.tabs.create({
          url: "https://chrome.google.com/webstore/detail/open-jira-ticket/blblhnpjhhjdbgbcgmmldohpalmbedci",
        });
      });
    }
  }
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

function resetColors() {
  // Reset to default colors
  document.getElementById("primaryProjectColor").value = "#ffffff";
  document.getElementById("secondaryProjectColor").value = "#2c3e50";
  document.getElementById("primaryProjectTextColor").value = "#000000";
  document.getElementById("secondaryProjectTextColor").value = "#ffffff";

  // Save the reset colors immediately
  chrome.storage.sync.set(
    {
      usePrimaryProjectColor: "#ffffff",
      useSecondaryProjectColor: "#2c3e50",
      usePrimaryProjectTextColor: "#000000",
      useSecondaryProjectTextColor: "#ffffff",
    },
    function () {
      showSuccessText();
    }
  );
}

function initScrollIndicator() {
  const formContainer = document.querySelector(".form-container");
  const scrollIndicator = document.getElementById("scrollIndicator");

  if (!formContainer || !scrollIndicator) return;

  function checkScroll() {
    const { scrollTop, scrollHeight, clientHeight } = formContainer;
    const maxScroll = scrollHeight - clientHeight;

    // Show indicator if there's more content to scroll and we're not at the bottom
    if (scrollHeight > clientHeight && scrollTop < maxScroll - 50) {
      scrollIndicator.classList.add("show");
    } else {
      scrollIndicator.classList.remove("show");
    }
  }

  // Check on load
  checkScroll();

  // Check on scroll
  formContainer.addEventListener("scroll", checkScroll);

  // Check on window resize
  window.addEventListener("resize", checkScroll);

  // Add work hours dependency logic
  const worldClockCheckbox = document.getElementById("worldClock");
  const workHoursCheckbox = document.getElementById("workHours");
  const workHoursSection = document.getElementById("workHoursSection");

  if (worldClockCheckbox && workHoursCheckbox) {
    worldClockCheckbox.addEventListener("change", function() {
      updateWorkHoursVisibility(this.checked);
    });

    workHoursCheckbox.addEventListener("change", function() {
      const workHoursSection = document.getElementById("workHoursSection");
      if (this.checked) {
        workHoursSection.style.display = "block";
      } else {
        workHoursSection.style.display = "none";
      }
    });
  }
}

// Function to update work hours visibility based on world clock setting
function updateWorkHoursVisibility(worldClockEnabled) {
  const workHoursCheckbox = document.getElementById("workHours");
  const workHoursSection = document.getElementById("workHoursSection");
  const workHoursLabel = document.getElementById("workHoursLabel");

  if (worldClockEnabled) {
    workHoursCheckbox.disabled = false;
    workHoursLabel.classList.remove("disabled");
    
    if (workHoursCheckbox.checked) {
      workHoursSection.style.display = "block";
    } else {
      workHoursSection.style.display = "none";
    }
  } else {
    workHoursCheckbox.disabled = true;
    workHoursCheckbox.checked = false;
    workHoursLabel.classList.add("disabled");
    workHoursSection.style.display = "none";
  }
}
