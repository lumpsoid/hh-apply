const urlSearch = "https://hh.ru/search/vacancy?ored_clusters=true&hhtmFrom=vacancy_search_list&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&text=js+frontend&enable_snippets=false&L_save_area=true";


function onError(error) {
  console.log(`Error: ${error}`);
}

function isCredentialsNull(data) {
  if (data.password === undefined) {
    return true;
  }
  return false;
}

function isCredentialsEmpty(data) {
  if (data.password === "" || data.email === "") {
    return true;
  }
  return false;
}

async function getCredentials() {
  let data = await browser.storage.local.get(['password', 'email']);

  if (isCredentialsNull(data)) {
    data = {
      password: '',
      email: '',
    };
  }
  return data;
}

function deleteForm() {
  document.getElementById('saveButton').removeEventListener('click', saveCredentials);
  document.getElementById('form').innerHTML = "";
}

async function saveCredentials() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (email === "" || password === "") {
    await browser.storage.local.set({ email, password })
    alert('Data saved!');
  } else if (email !== "" && password !== "") {
    await browser.storage.local.set({ email, password })
    alert('Data saved!');
    deleteForm();
    insertLogin();
  }
}

function insertForm(data) {
  document.getElementById('form').insertAdjacentHTML('beforeend',
    `<label for="email">Email:</label>
        <input type="email" id="email" name="email">
        <label for="password">Password:</label>
        <input type="text" id="password" name="password">
        <button id="saveButton">Save</button>`
  );

  document.getElementById('password').value = data.password;
  document.getElementById('email').value = data.email;
  //
  // Save data to localStorage
  document.getElementById('saveButton').addEventListener('click', saveCredentials);
}

async function swapToForm() {
  deleteLogin();
  let data = await getCredentials();
  insertForm(data);
}

function startLogingIn() {
  browser.runtime.sendMessage({ action: 'startLoginProcess' });
}

function insertLogin() {
  document.getElementById('loginPage').insertAdjacentHTML(
    'beforeend',
    `
    <div> <button id="swapToForm">New credentials</button> </div>
    <button id="loginButton">Login into HH</button>
    `,
  );
  document.getElementById('swapToForm').addEventListener('click', swapToForm);
  document.getElementById('loginButton').addEventListener('click', startLogingIn);
}


function deleteLogin() {
  document.getElementById('loginButton').removeEventListener('click', startLogingIn);
  document.getElementById('swapToForm').removeEventListener('click', swapToForm);
  document.getElementById('loginPage').innerHTML = "";
}

async function init() {
  console.log('init started');
  let data = await getCredentials();

  console.log('data:', data);
  if (isCredentialsEmpty(data)) {
    insertForm(data);
  } else {
    insertLogin();
  }
}

// main
document.addEventListener('DOMContentLoaded', async () => {
  await init();
});
