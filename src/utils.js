// Helper function to wait for an element to appear in the DOM
export function waitForElement(selector, callback) {
  console.log(`Waiting for element: ${selector}`);
  const element = document.querySelector(selector);
  if (element) {
    console.log(`Element found: ${selector}`);
    callback(element);
  } else {
    const observer = new MutationObserver((mutations, me) => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Element found by MutationObserver: ${selector}`);
        callback(element);
        me.disconnect();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }
}

// Function that returns a Promise which resolves when the button is clicked
export function waitForButtonClick(buttonSelector) {
  return new Promise((resolve, reject) => {
    waitForElement(buttonSelector, (button) => {
      console.log(`Adding click event listener to button: ${buttonSelector}`);
      try {
        button.addEventListener('click', () => {
          console.log("Button clicked, resolving Promise.");
          resolve();
        }, { once: true }); // Use { once: true } to ensure the event listener is removed after the first click
      } catch (error) {
        console.error(`Error adding click event listener: ${error}`);
        reject(error);
      }
    });
  });
}

export function setInputValue(element, value) {
  // Directly set the value of the input
  element.value = value;

  // Manually dispatch input and change events
  const inputEvent = new Event('input', { bubbles: true });
  const changeEvent = new Event('change', { bubbles: true });

  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
}
