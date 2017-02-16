function formCustomProject(string) {
  // Default ticket pattern
  var regex = new RegExp('([a-z]{2,}-\\d+)', 'i');
  var text_found = string.match(regex);

  if (text_found) {
      return text_found;
  }

  // TODO:Ticket pattern, but missing the -
  var regex = new RegExp('([a-z]{2,}\\d+)', 'i');
  var text_found = string.match(regex);  

}

function isDefaultProject(string) {
  // TODO: Only Numbers - use default
  var regex = new RegExp('(^\\d+)', 'i');
  var isDefault = string.match(regex);  

  if (isDefault) {
      return true;
  } else {
      return false;
  }

}

function openNewTicket(ticket) {
  addHistory(ticket);

	chrome.storage.sync.get(function(items) {
		var url = items.useURL;
		var defaultProject = items.useDefaultProject;

    if(isDefaultProject(ticket)) {
      window.open(url + "/" + defaultProject + "-" + ticket, "_blank", "", false);        
    } else {
      // TODO: Form custom url ^^
      window.open(url + "/b" + defaultProject + "-" + ticket, "_blank", "", false);    
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
        while (useHistory.length >= 5) {
          useHistory.pop();
          chrome.storage.sync.set({useHistory: useHistory}, function () { });
        }
        // Add 1 to the top of the list
        useHistory.unshift(searchString);
        chrome.storage.sync.set({useHistory: useHistory}, function () {});      
    });
};

document.addEventListener('keydown', function(key) {
  // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
  if (key.keyCode == 13) {
    var user_input = document.getElementById("ticket").value;
    openNewTicket(user_input.trim());
  }
});

window.addEventListener('load', function() {
  retrieveHistory();
});

chrome.omnibox.onInputEntered.addListener(function (user_input) {
  openNewTicket(user_input.trim());
});