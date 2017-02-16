function isDefaultProject(string) {
  // If there are only numbers at the beginning, we can assume this is a default project
  // There is a chance someone could type in 123BAD, but it will default to STACK-123
  // I think this is okay, since 123BAD is considered invalid. 
  // We can add more error handling if needed
  var regex = new RegExp('(^\\d+)', 'i');
  var isDefault = string.match(regex);  

  if (isDefault) {
      return true;
  } else {
      return false;
  }

}

function sanitizeTicket(userInput) {
  // JIRA tickets only takes [a-z], -, d+
  var fullTicketRegex = new RegExp('([a-z]{1,}-\\d+)', 'i');
  var semiTicketRegex = new RegExp('([a-z]{1,}\\d+)', 'i');
  var numbersOnlyRegex = new RegExp('(\\d+)', 'i');
  
  var fullTicketText = userInput.match(fullTicketRegex);

  if (fullTicketText) {
      return fullTicketText[0];
  } else if (userInput.match(semiTicketRegex)) {
    // TODO: cleanup this mess
      var jprojectRegex = new RegExp('([a-z]{1,})', 'i');
      var jprojectText = userInput.match(jprojectRegex);
      var jprojectNumber = userInput.match(numbersOnlyRegex);
      //Form ticket 
      var ticketID = jprojectText[0].concat("-", jprojectNumber[0]);
      return ticketID;
  } else if (userInput.match(numbersOnlyRegex)) {
      var defaultTicket = userInput.match(numbersOnlyRegex);
      return defaultTicket[0];
  } else {
      return "invalid ticket"
  }

}

function openNewTicket(ticket) {
  addHistory(ticket);

  var sanitizedTicket = sanitizeTicket(ticket);
  if (sanitizedTicket == "invalid ticket") {
    // TODO: We should handle this before it even opens a new tab
  }

	chrome.storage.sync.get(function(items) {
		var url = items.useURL;
		var defaultProject = items.useDefaultProject;
    var sanitizedTicket = sanitizeTicket(ticket);

    if(isDefaultProject(ticket)) {
      window.open(url + "/" + defaultProject + "-" + sanitizedTicket, "_blank", "", false);        
    } else {
      window.open(url + "/" + sanitizedTicket, "_blank", "", false);
    }

	});

}

function retrieveHistory() {
  // Set default useHistory if undefined
  chrome.storage.sync.get({"useHistory": []}, function(items) {
    var historyStorage = items.useHistory;
    var historyList = document.getElementById("historyList");
    // Build history list
    historyStorage.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
    }); //end foreach
  }); //end sync
} //end retrieveHistory

function addHistory(searchString) {
    chrome.storage.sync.get({"useHistory": []}, function (result) {
        var useHistory = result.useHistory;
        // We only want the last 5 results
        // max ?@#?
        while (useHistory.length >= 5) {
          useHistory.pop();
          chrome.storage.sync.set({useHistory: useHistory}, function () { });
        }
        // Add 1 to the top of the list
        var sanitizedTicket = sanitizeTicket(searchString);
        if (sanitizedTicket == "invalid ticket") {
          var invalidMsg = "Invalid ticket: " + "'" + searchString + "'";
          useHistory.unshift(invalidMsg);
        } else {
          useHistory.unshift(sanitizedTicket);  
        }
        
        chrome.storage.sync.set({useHistory: useHistory}, function () {});      
    });
};

document.addEventListener('keydown', function(key) {
  // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
  if (key.keyCode == 13) {
    var userInput = document.getElementById("ticket").value;
    openNewTicket(userInput.trim());
  }
});

window.addEventListener('load', function() {
  retrieveHistory();
});

chrome.omnibox.onInputEntered.addListener(function (userInput) {
  openNewTicket(userInput.trim());
});