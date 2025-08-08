// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Auth0 mock utilities
Cypress.Commands.add('mockAuth0Login', (userScenario = 'company-with-complete-profile') => {
  const scenarios = {
    'no-role': {
      user: {
        sub: 'auth0|test-user-no-role',
        email: 'norole@test.com',
        email_verified: true,
      },
      authMeta: { role: null }
    },
    'new-user': {
      user: {
        sub: 'auth0|test-user-new',
        email: 'newuser@test.com',
        email_verified: true,
      },
      authMeta: { role: null }
    },
    'company-without-profile': {
      user: {
        sub: 'auth0|test-user-company',
        email: 'company@test.com',
        email_verified: true,
      },
      authMeta: {
        role: 'COMPANY',
        companyStatus: {
          exists: false,
          completed: false,
          company: null
        }
      }
    },
    'company-with-incomplete-profile': {
      user: {
        sub: 'auth0|test-user-company-incomplete',
        email: 'incomplete@test.com',
        email_verified: true,
      },
      authMeta: {
        role: 'COMPANY',
        companyStatus: {
          exists: true,
          completed: false,
          company: {
            id: 1,
            name: 'Test Company',
            industry: '',
            description: '',
            logoUrl: null,
            website: null,
            verified: false
          }
        }
      }
    },
    'company-with-complete-profile': {
      user: {
        sub: 'auth0|test-user-company-complete',
        email: 'complete@test.com',
        email_verified: true,
      },
      authMeta: {
        role: 'COMPANY',
        companyStatus: {
          exists: true,
          completed: true,
          company: {
            id: 1,
            name: 'Test Company Inc.',
            industry: 'Technology',
            description: 'A test technology company',
            logoUrl: 'https://example.com/logo.png',
            website: 'https://example.com',
            verified: true
          }
        }
      }
    },
    'job-seeker': {
      user: {
        sub: 'auth0|test-user-job-seeker',
        email: 'jobseeker@test.com',
        email_verified: true,
      },
      authMeta: { role: 'JOB_SEEKER' }
    }
  };

  const scenario = scenarios[userScenario];
  
  // Mock Auth0 methods
  cy.window().then((win) => {
    // Mock the Auth0 client
    win.__auth0Client = {
      isAuthenticated: true,
      user: scenario.user,
      getAccessTokenSilently: () => Promise.resolve('mock-access-token'),
      logout: cy.stub(),
      loginWithRedirect: cy.stub()
    };
  });

  // Mock API calls
  cy.intercept('GET', 'http://localhost:5000/api/auth/me', {
    statusCode: 200,
    body: scenario.authMeta
  }).as('getAuthMeta');

  // Mock role assignment if needed
  cy.intercept('POST', 'http://localhost:5000/api/auth/assign-role', {
    statusCode: 200,
    body: { success: true, role: 'COMPANY' }
  }).as('assignRole');
});

// Command to mock unauthenticated state
Cypress.Commands.add('mockAuth0Logout', () => {
  cy.window().then((win) => {
    win.__auth0Client = {
      isAuthenticated: false,
      user: null,
      getAccessTokenSilently: () => Promise.reject('Not authenticated'),
      logout: cy.stub(),
      loginWithRedirect: cy.stub()
    };
  });
});

// Command to wait for app to be ready
Cypress.Commands.add('waitForApp', () => {
  cy.get('[data-testid="app-ready"], [data-testid="spinner"], [data-testid="role-selection"], [data-testid="company-dashboard"], [data-testid="profile-page"]', { timeout: 10000 })
    .should('exist');
});
