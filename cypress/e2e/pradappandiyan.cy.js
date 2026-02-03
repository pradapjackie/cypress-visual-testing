/**
 * Visual regression tests for https://pradappandiyan.medium.com/
 * Tests the website across different viewport resolutions
 */

const VIEWPORTS = [
  { name: 'web', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

describe('Visual Regression - pradappandiyan.medium.com', () => {
  VIEWPORTS.forEach(({ name, width, height }, index) => {
    describe(`Viewport: ${name} (${width}x${height})`, () => {
      beforeEach(() => {
        // Add delay between viewports to avoid Medium rate limiting (403)
        if (index > 0) {
          cy.wait(5000);
        }
        cy.viewport(width, height);
        cy.visit('/', {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
      });

      it('should match homepage snapshot', () => {
        // Wait for page to be fully loaded
        cy.get('body').should('be.visible');
        cy.wait(500); // Allow for any animations/transitions

        cy.compareSnapshot(`homepage-${name}`);
      });
    });
  });
});
