describe('Authentication and Redirection Flow', () => {
  beforeEach(() => {
    // Clear any existing mocks
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('New User Flow', () => {
    it('should redirect new user to role selection', () => {
      cy.mockAuth0Login('new-user');
      cy.visit('/');
      
      // Should show role selection page for new users
      cy.get('[data-testid="role-selection"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Select Your Role').should('be.visible');
      
      // Should have options for COMPANY and JOB_SEEKER
      cy.get('[data-testid="role-company"]').should('be.visible');
      cy.get('[data-testid="role-job_seeker"]').should('be.visible');
    });

    it('should assign role and redirect when user selects COMPANY', () => {
      cy.mockAuth0Login('new-user');
      
      // Mock the updated auth meta after role assignment
      cy.intercept('GET', 'http://localhost:5000/api/auth/me', {
        statusCode: 200,
        body: {
          role: 'COMPANY',
          companyStatus: {
            exists: false,
            completed: false,
            company: null
          }
        }
      }).as('getUpdatedAuthMeta');

      cy.visit('/');
      
      // Select COMPANY role
      cy.get('[data-testid="role-company"]').click();
      cy.get('[data-testid="confirm-role"]').click();
      
      // Should call assign role API
      cy.wait('@assignRole');
      cy.wait('@getUpdatedAuthMeta');
      
      // Should redirect to company setup form
      cy.get('[data-testid="company-setup-form"]', { timeout: 10000 }).should('be.visible');
    });

    it('should assign role and redirect when user selects JOB_SEEKER', () => {
      cy.mockAuth0Login('new-user');
      
      // Mock the updated auth meta after role assignment
      cy.intercept('GET', 'http://localhost:5000/api/auth/me', {
        statusCode: 200,
        body: { role: 'JOB_SEEKER' }
      }).as('getUpdatedAuthMeta');

      cy.visit('/');
      
      // Select JOB_SEEKER role
      cy.get('[data-testid="role-job_seeker"]').click();
      cy.get('[data-testid="confirm-role"]').click();
      
      // Should call assign role API
      cy.wait('@assignRole');
      cy.wait('@getUpdatedAuthMeta');
      
      // Should redirect to profile page
      cy.url().should('include', '/profile');
      cy.get('[data-testid="profile-page"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Existing COMPANY User Flow', () => {
    it('should redirect COMPANY user with complete profile to dashboard without role selection', () => {
      cy.mockAuth0Login('company-with-complete-profile');
      cy.visit('/');
      
      // Should NOT show role selection
      cy.get('[data-testid="role-selection"]').should('not.exist');
      
      // Should directly show company dashboard
      cy.get('[data-testid="company-dashboard"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Company Dashboard').should('be.visible');
    });

    it('should redirect COMPANY user with incomplete profile to company setup', () => {
      cy.mockAuth0Login('company-with-incomplete-profile');
      cy.visit('/');
      
      // Should NOT show role selection
      cy.get('[data-testid="role-selection"]').should('not.exist');
      
      // Should show company setup form
      cy.get('[data-testid="company-setup-form"]', { timeout: 10000 }).should('be.visible');
      cy.contains('Company Details').should('be.visible');
    });

    it('should redirect COMPANY user without company profile to company setup', () => {
      cy.mockAuth0Login('company-without-profile');
      cy.visit('/');
      
      // Should NOT show role selection
      cy.get('[data-testid="role-selection"]').should('not.exist');
      
      // Should show company setup form
      cy.get('[data-testid="company-setup-form"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('JOB_SEEKER User Flow', () => {
    it('should redirect JOB_SEEKER directly to profile page', () => {
      cy.mockAuth0Login('job-seeker');
      cy.visit('/');
      
      // Should NOT show role selection
      cy.get('[data-testid="role-selection"]').should('not.exist');
      
      // Should redirect to profile page
      cy.url().should('include', '/profile');
      cy.get('[data-testid="profile-page"]', { timeout: 10000 }).should('be.visible');
    });

    it('should prevent JOB_SEEKER from accessing company routes', () => {
      cy.mockAuth0Login('job-seeker');
      
      // Try to access company dashboard
      cy.visit('/dashboard');
      
      // Should show access denied or redirect to profile
      cy.get('[data-testid="unknown-role"], [data-testid="profile-page"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Navigation and Route Protection', () => {
    it('should handle direct URL access for COMPANY users', () => {
      cy.mockAuth0Login('company-with-complete-profile');
      
      // Direct access to dashboard
      cy.visit('/dashboard');
      cy.get('[data-testid="company-dashboard"]', { timeout: 10000 }).should('be.visible');
      
      // Direct access to jobs
      cy.visit('/jobs');
      cy.get('[data-testid="job-management"]', { timeout: 10000 }).should('be.visible');
    });

    it('should handle direct URL access for JOB_SEEKER users', () => {
      cy.mockAuth0Login('job-seeker');
      
      // Direct access to profile
      cy.visit('/profile');
      cy.get('[data-testid="profile-page"]', { timeout: 10000 }).should('be.visible');
    });

    it('should redirect unknown paths based on user role', () => {
      cy.mockAuth0Login('company-with-complete-profile');
      
      // Visit unknown path
      cy.visit('/unknown-path');
      
      // Should redirect to company dashboard (home for COMPANY users)
      cy.url().should('not.include', '/unknown-path');
      cy.get('[data-testid="company-dashboard"]', { timeout: 10000 }).should('be.visible');
    });

    it('should redirect JOB_SEEKER from unknown paths to profile', () => {
      cy.mockAuth0Login('job-seeker');
      
      // Visit unknown path
      cy.visit('/unknown-path');
      
      // Should redirect to profile page
      cy.url().should('include', '/profile');
      cy.get('[data-testid="profile-page"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Loading States and Error Handling', () => {
    it('should show loading spinner while fetching auth metadata', () => {
      // Mock slow API response
      cy.intercept('GET', 'http://localhost:5000/api/auth/me', {
        statusCode: 200,
        body: { role: 'COMPANY', companyStatus: { exists: true, completed: true } },
        delay: 2000
      }).as('getAuthMetaSlow');

      cy.mockAuth0Login('company-with-complete-profile');
      cy.visit('/');
      
      // Should show spinner initially
      cy.get('[data-testid="spinner"]', { timeout: 1000 }).should('be.visible');
      
      // Should eventually show the dashboard
      cy.wait('@getAuthMetaSlow');
      cy.get('[data-testid="company-dashboard"]', { timeout: 10000 }).should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', 'http://localhost:5000/api/auth/me', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getAuthMetaError');

      cy.mockAuth0Login('company-with-complete-profile');
      cy.visit('/');
      
      cy.wait('@getAuthMetaError');
      
      // Should handle the error appropriately (show error message or fallback)
      cy.get('[data-testid="error-message"], [data-testid="role-selection"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Unauthenticated User Flow', () => {
    it('should show public routes for unauthenticated users', () => {
      cy.mockAuth0Logout();
      cy.visit('/');
      
      // Should show public routes/login page
      cy.get('[data-testid="public-routes"], [data-testid="login-button"]', { timeout: 10000 }).should('be.visible');
      
      // Should not show protected content
      cy.get('[data-testid="company-dashboard"]').should('not.exist');
      cy.get('[data-testid="profile-page"]').should('not.exist');
    });
  });
});
