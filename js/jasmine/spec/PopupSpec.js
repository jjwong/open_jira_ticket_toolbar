describe("Popup.js", function () {
  let app;

  describe("when we sanitize user input", () => {
    // JIRA valid ticket documentation
    // https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
    // TODO - refactor to better support regex rules
    // it("should allow supported JIRA key format per documentation", () => {
    //     expect(sanitizeTicket("PRODUCT_2013")).toEqual("PRODUCT_2013");
    //     expect(sanitizeTicket("R2D2")).toEqual("R2D2");
    //     expect(sanitizeTicket("MY_EXAMPLE_PROJECT")).toEqual("MY_EXAMPLE_PROJECT");
    // });

    it("should allow clean valid numbered JIRA tickets in without additional filtering", () => {
        expect(sanitizeTicket("CORE2-31")).toEqual("CORE2-31");
        expect(sanitizeTicket("CORE22-31")).toEqual("CORE22-31");
        expect(sanitizeTicket("CORE222-31")).toEqual("CORE-222");
    })

    it("should work for reported user use cases", () => {
        expect(sanitizeTicket("DEV00US-321")).toEqual("DEV00US-321");
        expect(sanitizeTicket("DEV00IN-123")).toEqual("DEV00IN-123");
        expect(sanitizeTicket("DEV00EU-31")).toEqual("DEV00EU-31");
        expect(sanitizeTicket("DEV00 EU-31")).toEqual("EU-31");
    })

    it("should return invalid for unsupported JIRA key format per documentation", () => {
        expect(sanitizeTicket("2013PROJECT")).toEqual("2013");
    });

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

    it("should accept input with spaces and return default project", () => {
      expect(sanitizeTicket("core- 1")).toEqual("1");
      expect(sanitizeTicket("core -12")).toEqual("12");
    });

    it("should accept input with spaces and combine initial text to form JIRA ID", () => {
        expect(sanitizeTicket("core- 1")).toEqual("1");
        expect(sanitizeTicket("core -12")).toEqual("12");
        expect(sanitizeTicket("core  123")).toEqual("CORE-123");
        expect(sanitizeTicket("core12  34")).toEqual("CORE-12");
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
      expect(sanitizeTicket("http://qunitjs.com/intro/core2-123")).toEqual(
        "CORE2-123"
      );
      expect(sanitizeTicket("http://qunitjs.com/intro/core22-123")).toEqual(
        "CORE22-123"
      );
      expect(sanitizeTicket("http://qunitjs.com/intro/core222-123")).toEqual(
        "CORE-222"
      );
    });

    it("should accept numbers only", () => {
        expect(sanitizeTicket("123")).toEqual("123");
        expect(sanitizeTicket("0123")).toEqual("0123");
        expect(sanitizeTicket("-12")).toEqual("12");
        expect(sanitizeTicket("+88")).toEqual("88");
    })
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
