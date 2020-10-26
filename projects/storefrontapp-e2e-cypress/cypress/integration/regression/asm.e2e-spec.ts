import * as asm from '../../helpers/asm';
context.skip('ASM - Desktop', () => {
  before(() => {
    cy.window().then((win) => win.sessionStorage.clear());
  });

  asm.asmTests(false);
});
