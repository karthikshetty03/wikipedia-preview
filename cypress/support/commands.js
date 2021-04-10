Cypress.Commands.add("testingHeader", () => {
  cy.get(".header")
    .should("exist")
    .and("be.visible")
    .and("have.text", "Wikipedia Preview demo");
});

Cypress.Commands.add("testingFooter", () => {
  cy.get("body > div.footer > p")
    .should("exist")
    .and("be.visible")
    .and("contain", "Creative Commons Attribution-Share-Alike License 3.0.")
    .find("a")
    .should("contain", "View Source")
    .and("have.attr", "href");
});
