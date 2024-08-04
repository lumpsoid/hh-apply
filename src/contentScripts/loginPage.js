import { waitForElement, setInputValue } from "../utils.js";

(async function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  //

  const loginButton = document.querySelector('button[data-qa="expand-login-by-password"]');
  if (loginButton) {
    loginButton.click();
  }

  const email = await browser.runtime.sendMessage({ action: 'getEmail' });
  const password = await browser.runtime.sendMessage({ action: 'getPassword' });
  waitForElement('input[data-qa="login-input-username"]', (usernameInput) => {
    setInputValue(usernameInput, email.email);
  });
  waitForElement('input[data-qa="login-input-password"]', (passwordInput) => {
    setInputValue(passwordInput, password.password);

  });
  waitForElement('button[data-qa="account-login-submit"]', (button) => {
    console.log('clicked on the submit button');
    button.click();
  });
  console.log('end of the script');
})();
