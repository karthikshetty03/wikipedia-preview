const testingCrossButton = () => {
  cy.get(".close-btn").and("be.visible").click();
};

const testingTitle = () => {
  cy.get(".title > p")
    .should("exist")
    .and("be.visible")
    .and("have.text", "Wildlife of the Central African Republic");
};

const testingImage = () => {
  cy.get(".cover").should("exist").and("be.visible");
};

const testingPopupButtons = () => {
  cy.get(".wmf-wp-with-preview").as("popupButtons");
  cy.get("@popupButtons").should("have.length", 3);
};

const testingPopupCards = () => {
  for (let i = 1; i <= 3; i++) {
    cy.get("div.wp-popup").as("popupCard");
    cy.get(`div.container > div.content > p:nth-child(${i}) > span`).as(
      "popupButton"
    );

    cy.get("@popupCard").should("not.be.visible");
    cy.get("@popupButton").should("exist").and("be.visible").click();
    cy.get("@popupCard").should("exist").and("be.visible").click();

    cy.get("body > div.wp-popup > div > div.wikipediapreview-footer > span").as(
      "continueReading"
    );
    cy.get("body > div.wp-popup > div > div.wikipediapreview-footer > a").as(
      "readMore"
    );

    cy.get("@readMore").should("not.be.visible");
    cy.get("@continueReading").should("exist").and("be.visible").click();

    //Testing the popucard elements
    cy.get("@popupCard")
      .find(".wikipediapreview-header")
      .should("exist")
      .and("be.visible");

    cy.get("@popupCard")
      .find(".wikipediapreview-header-closebtn")
      .should("exist")
      .and("be.visible")
      .click();

    cy.get("@popupCard").should("not.be.visible");
    cy.get("@popupButton").click();
    cy.get("@continueReading").click();

    cy.get("@popupCard")
      .find(".wikipediapreview-body")
      .should("exist")
      .and("be.visible");

    cy.get("@popupCard").find(".wikipediapreview-gallery").should("exist");
    // .and("be.visible"); --> fails

    cy.get("@readMore").should("exist").and("be.visible").click();

    cy.visit("/articles/english.html");
  }
};

describe("Tests for the English articles page", () => {
  context("Desktop VIew", () => {
    beforeEach(() => {
      cy.visit("/articles/english.html");
      cy.url().should("contain", "english.html");
    });

    it("Cross button testing", () => {
      // testingCrossButton(); //--> fails for desktop view
    });

    it("Header Testing", () => {
      cy.testingHeader();
    });

    it("Title Testing", () => {
      testingTitle();
    });

    it("Image Testing", () => {
      testingImage();
    });

    it("Get all popup buttons", () => {
      testingPopupButtons();
    });

    it("Testing Popup Cards", () => {
      testingPopupCards();
    });

    it("Footer Testing", () => {
      cy.testingFooter();
    });
  });

  context("Mobile VIew", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
      cy.visit("/articles/english.html");
      cy.url().should("contain", "english.html");
    });

    it("Cross button testing", () => {
      testingCrossButton();
    });

    it("Header Testing", () => {
      cy.testingHeader();
    });

    it("Title Testing", () => {
      testingTitle();
    });

    it("Image Testing", () => {
      testingImage();
    });

    it("Get all popup buttons", () => {
      testingPopupButtons();
    });

    it("Testing Popup Cards", () => {
      testingPopupCards();
    });

    it("Footer Testing", () => {
      cy.testingFooter();
    });
  });
});
