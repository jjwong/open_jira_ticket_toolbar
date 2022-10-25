describe("Popup.js", function () {
  let app;

  describe("when we sanitize user input", () => {
    // JIRA valid ticket documentation
    // https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
    it("should add a dash between the project key and project id number", () => {
      expect(sanitizeTicket("fake1")).toEqual("FAKE-1");
      expect(sanitizeTicket("fake12")).toEqual("FAKE-12");
      expect(sanitizeTicket("fake123")).toEqual("FAKE-123");
      expect(sanitizeTicket("fake1234")).toEqual("FAKE-1234");
    });

    it("should accept and not modify basic valid cases", () => {
      expect(sanitizeTicket("core-1")).toEqual("CORE-1");
      expect(sanitizeTicket("core-12")).toEqual("CORE-12");
      expect(sanitizeTicket("core-123")).toEqual("CORE-123");
      expect(sanitizeTicket("core-1234")).toEqual("CORE-1234");
    });

    it("should return error for invalid cases", () => {
      expect(sanitizeTicket("core")).toEqual("invalid ticket");
      expect(sanitizeTicket("null")).toEqual("invalid ticket");
      expect(sanitizeTicket("!@#$%^&*()_+")).toEqual("invalid ticket");
      expect(sanitizeTicket("")).toEqual("invalid ticket");
      expect(sanitizeTicket(" ")).toEqual("invalid ticket");
    });

    it("should accept links and filter for the ticket ID", () => {
      expect(sanitizeTicket("http://qunitjs.com/intro/core-123")).toEqual(
        "CORE-123"
      );
    });
  });

  describe("verify default project", () => {
    it("should return true for numbers only", () => {
      expect(isDefaultProject("123")).toEqual(true);
    });

    it("should return false when the value is a specific project", () => {
      expect(isDefaultProject("BANANAS-123")).toEqual(false);
    });
  });
});
