function sanitizeInput(string) {
  console.log("test");
}

function openNewTicket(ticket) {

	chrome.storage.sync.get(function(items) {
		var url = items.useURL;
		var defaultProject = items.useDefaultProject;

    window.open(url + "/" + defaultProject + "-" + ticket, "_blank", "", false);	
		
	});

}

document.addEventListener('keydown', function(key) {
	// Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
	if (key.keyCode == 13) {
		var user_input = document.getElementById("ticket").value;
		openNewTicket(user_input);
	}
});