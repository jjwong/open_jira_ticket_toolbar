QUnit.module('General');

QUnit.test("isDefaultProject - true", function( assert ) {
  assert.ok(isDefaultProject("123"), "Failed to return true for a default number only value.")
})

QUnit.test("isDefaultProject - false", function( assert ) {
  assert.notOk(isDefaultProject("BANANAS-123"), "Failed to return false for a non-default project.")
})

QUnit.test("displayError - toolbar - english", function( assert ) {
    displayError("toolbar_error");
    var elem = $("[data-localize]");
    assert.equal(elem.val(), "Please enter a valid ticket!", "English - valid ticket error message")
})

// Combining into only 1 function for all of the tests is fine,
// but split out since its easier to define the scenarios
QUnit.test("sanitizeTicket function - basic positive", function( assert ) {
  function sanitize(then, expected) {
    assert.equal(sanitizeTicket(then), expected);
  }
  sanitize("core-1", "core-1");
  sanitize("core-12", "core-12");
  sanitize("core-123", "core-123");
  sanitize("core-1234", "core-1234");
})
QUnit.test("sanitizeTicket function - missing dash", function( assert ) {
  function sanitize(then, expected) {
    assert.equal(sanitizeTicket(then), expected);
  }
  sanitize("core1", "core-1");
  sanitize("core12", "core-12");
  sanitize("core123", "core-123");
  sanitize("core1234", "core-1234");
})
QUnit.test("sanitizeTicket function - negative", function( assert ) {
  function sanitize(then, expected) {
    assert.equal(sanitizeTicket(then), expected);
  }
  sanitize("core", "invalid ticket");
  sanitize("null", "invalid ticket");
  sanitize("!@#$%^&*()_+", "invalid ticket");
  sanitize("", "invalid ticket");
})
QUnit.test("sanitizeTicket function - default project", function( assert ) {
  function sanitize(then, expected) {
    assert.equal(sanitizeTicket(then), expected);
  }
  sanitize("1", "1");
  sanitize("12", "12");
  sanitize("123", "123");
  sanitize("242424tan", "242424");
})
QUnit.test("sanitizeTicket function - links", function( assert ) {
  function sanitize(then, expected) {
    assert.equal(sanitizeTicket(then), expected);
  }
  sanitize("http://qunitjs.com/intro/core-123", "core-123");
})
//QUnit.test("sanitizeTicket function - underscore", function( assert ) {
//  function sanitize(then, expected) {
//    assert.equal(sanitizeTicket(then), expected);
//  }
//  sanitize("core_1", "core_1");
//  sanitize("core_12", "core_12");
//  sanitize("core_123", "core_123");
//  sanitize("core_1234", "core_1234");
//})
//QUnit.test("sanitizeTicket function - special", function( assert ) {
//  function sanitize(then, expected) {
//    assert.equal(sanitizeTicket(then), expected);
//  }
//  // Reference for accepted JIRA patterns
//  // https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
//  sanitize("core 123", "core-123");
//  sanitize("ACAT_51-1", "ACAT_51-1");
//  sanitize("AAA5-1330", "AAA5-1330");
//  sanitize("A_20_A091-15", "A_20_A091-15");
//  sanitize("TQ09-01", "TQ09-01");
//  sanitize("TQ09-02", "TQ09-02");
//  sanitize("32a 32 test342", "test-342");
//  sanitize("32a 32 test-355", "test-355");
//});