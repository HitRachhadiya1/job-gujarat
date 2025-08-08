// Custom commands for Cypress tests

// Example custom command
Cypress.Commands.add('selectRole', (role) => {
  cy.get(`[data-testid="role-${role.toLowerCase()}"]`).click();
  cy.get('[data-testid="confirm-role"]').click();
});

// Command to fill company form
Cypress.Commands.add('fillCompanyForm', (companyData) => {
  if (companyData.name) {
    cy.get('[data-testid="company-name"]').clear().type(companyData.name);
  }
  if (companyData.industry) {
    cy.get('[data-testid="company-industry"]').select(companyData.industry);
  }
  if (companyData.description) {
    cy.get('[data-testid="company-description"]').clear().type(companyData.description);
  }
  if (companyData.website) {
    cy.get('[data-testid="company-website"]').clear().type(companyData.website);
  }
});
