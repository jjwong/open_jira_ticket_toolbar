//TODO: Export breaks the testing pipeline, need to get that addressed.

function isDefaultProject(string) {
  // If there are only numbers at the beginning, we can assume this is a default project
  // There is a chance someone could type in 123BAD, but it will default to STACK-123
  // I think this is okay, since 123BAD is considered invalid.
  // We can add more error handling if needed
  var regex = new RegExp("(^\\d+)", "i");
  var isDefault = string.match(regex);

  if (isDefault) {
    return true;
  } else {
    return false;
  }
}

function sanitizeTicket(userInput) {
  /* JIRA tickets only takes [a-z], -, _, d+
   We currently only - configurations
   JIRA can support a few different prefix styles such as R2D2 and R2_D2_D3 prefixes.
   TODO: Add support for variants outside of standard a-z ticket prefixes
   Potential solution - [a-z]([a-z0-9_]{0,})-\d+ , but this will break core23-23 or semiTicket only
    detection.
    Supporting documentation - https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
   */

  // Trim and uppercase user input
  let cleanUserInput = userInput.toString().toUpperCase().trim();

  const fullTicketWithNumberRegex = new RegExp(
    "[A-Z]*\\d*[A-Z]{1,}\\d{0,2}[A-Z]{0,2}-\\d+",
    "i"
  );

  const fullTicketRegex = new RegExp("([A-Z]{1,}-\\d+)", "i");
  const semiTicketRegex = new RegExp("([A-Z]{1,}\\d+)", "i");

  const spaceTicketRegex = new RegExp("([A-Z]{1,}(\\s+)\\d+)", "i");

  const numbersOnlyRegex = new RegExp("(\\d+)", "i");

  const fullTicketText = cleanUserInput.match(fullTicketRegex);

  let sanitizedOutput = "";

  if (cleanUserInput.match(fullTicketWithNumberRegex)) {
    sanitizedOutput = cleanUserInput.match(fullTicketWithNumberRegex)[0];
  } else if (fullTicketText) {
    sanitizedOutput = fullTicketText[0];
  } else if (cleanUserInput.match(semiTicketRegex)) {
    var semiTicket = cleanUserInput.match(semiTicketRegex)[0];
    var jprojectRegex = new RegExp("([A-Z]{1,})", "i");
    var jprojectText = semiTicket.match(jprojectRegex);
    var jprojectNumber = semiTicket.match(numbersOnlyRegex);
    //Form ticket
    sanitizedOutput = jprojectText[0].concat("-", jprojectNumber[0]);
  } else if (cleanUserInput.match(spaceTicketRegex)) {
    sanitizedOutput = cleanUserInput.replace(/\s+/g, "-");
  } else if (cleanUserInput.match(numbersOnlyRegex)) {
    var defaultTicket = cleanUserInput.match(numbersOnlyRegex);
    sanitizedOutput = defaultTicket[0];
  } else {
    sanitizedOutput = "invalid ticket";
  }

  return sanitizedOutput;
}

function openNewTicket(ticket, sourceType) {
  const SANITIZED_TICKET = sanitizeTicket(ticket);

  chrome.storage.sync.get(function (items) {
    const PROJECT_SELECTED = items.useProjectTracker;

    let USER_HOST_URL = items.useURL;
    let DEFAULT_PROJECT = items.useDefaultProject;

    if (PROJECT_SELECTED == 2) {
      USER_HOST_URL = items.useSecondaryURL;
      DEFAULT_PROJECT = items.useSecondaryProject;
    } else {
      USER_HOST_URL = items.useURL;
      DEFAULT_PROJECT = items.useDefaultProject;
    }

    const fullTicketID = getFullJiraID(DEFAULT_PROJECT, SANITIZED_TICKET);

    let formURL = formTicketURL(USER_HOST_URL, fullTicketID);

    saveHistory(fullTicketID);
    saveUsage();
    chrome.tabs.create({ url: formURL });
  }); //end get sync
} //end openNewTicket

function saveHistory(userStringInput) {
  chrome.storage.sync.get(
    { userHistory: [], useDefaultProject: "PL" },
    function (result) {
      let userHistory = result.userHistory;
      let defaultProject = result.useDefaultProject;
      let jiraTicketID;

      jiraTicketID = getFullJiraID(defaultProject, userStringInput);

      let checkTicketIndex = userHistory.indexOf(jiraTicketID);
      // Check if string is in index, if so. Remove it first, then add it back in later.
      if (checkTicketIndex > -1) {
        // Remove only 1 instance in the array
        userHistory.splice(checkTicketIndex, 1);
      }

      //Add ticket to the top of the list.
      userHistory.unshift(jiraTicketID);

      // Pop the last item in the list
      while (userHistory.length > 10) {
        userHistory.pop();
      }

      chrome.storage.sync.set({ userHistory: userHistory }, function () {});
    }
  ); //end get sync
} //end saveHistory

function getFullJiraID(defaultProject, ticket) {
  let sanitizedTicket = sanitizeTicket(ticket);

  if (ticket === "invalid ticket") {
    console.error("Invalid ticket reached getFullJiraID.");
  } else {
    // Add default project to history
    if (isDefaultProject(sanitizedTicket)) {
      let defaultTicket = defaultProject + "-" + sanitizedTicket;
      return defaultTicket;
    } else {
      return sanitizedTicket;
    }
  }
}

function formTicketURL(url, ticket) {
  //TODO - verify ticket is valid
  return url + "/browse/" + ticket;
}

function saveUsage() {
  chrome.storage.sync.get({ userUsage: 0 }, function (result) {
    let userUsage = result.userUsage;

    userUsage += 1;

    chrome.storage.sync.set({ userUsage: userUsage }, function () {});
  }); //end get sync
} //end saveUsage

export { openNewTicket, sanitizeTicket, formTicketURL };
