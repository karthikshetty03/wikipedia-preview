const loadPreviewCards = () => {
  cy.get("body > div.container > div .item").should("have.length", 7);
};

const logoChecks = () => {
  cy.fixture("articles").each((article) => {
    cy.get(
      `body > div.container > div > div:nth-child(${article.id}) > a > div.image > div`
    )
      .should("exist")
      .and("have.css", "background-image")
      .and("include", article.img);
  });
};

const linkChecks = () => {
  cy.fixture("articles").each((article) => {
    cy.get(`body > div.container > div > div:nth-child(${article.id}) > a`)
      .should("exist")
      .and("have.attr", "href")
      .and("include", article.link)
      .then((href) => {
        cy.visit(href);
      });
    cy.visit("/");
  });
};

describe("App intialization", () => {
  context("Desktop View", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("Header Testing", () => {
      cy.testingHeader();
    });

    it("Loads wikipedia-preview cards", () => {
      loadPreviewCards();
    });

    it("Check each of the article's logo", () => {
      logoChecks();
    });

    it("Checks each of the article's link", () => {
      linkChecks();
    });

    it("Footer Testing", () => {
      cy.testingFooter();
    });
  });

  context("Mobile View", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
      cy.visit("/");
    });

    it("Header Testing", () => {
      cy.testingHeader();
    });

    it("Loads wikipedia-preview cards", () => {
      loadPreviewCards();
    });

    it("Check each of the article's logo", () => {
      logoChecks();
    });

    it("Checks each of the article's link", () => {
      linkChecks();
    });

    it("Footer Testing", () => {
      cy.testingFooter();
    });
  });
});
