'use strict';

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2023-03-15',
    '2023-03-16',
    '2023-03-17',
    '2023-03-18',
    '2023-03-19',
    '2023-03-20',
    '2023-03-21',
    '2023-03-22',
  ],
  currency: 'EUR',
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2023-03-22',
    '2023-03-21',
    '2023-03-18',
    '2023-03-19',
    '2023-03-22',
    '2023-03-20',
    '2023-03-21',
    '2023-03-15',
  ],
  currency: 'USD',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

// onload
const createUsernames = accounts => {
  return accounts.forEach(item => {
    return (item.username = item.owner
      .toLowerCase()
      .split(' ')
      .map(item => item.at(0))
      .join(''));
  });
};
createUsernames(accounts);

// Timer 5min
const startLogOutTimer = () => {
  let time = 300;

  const tick = () => {
    const minutes = String(Math.trunc(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    labelTimer.textContent = `${minutes}:${seconds}`;

    if (!time) {
      containerApp.classList.remove('show');
      labelWelcome.textContent = 'Log in to get started';
      clearInterval(timer);
    }

    time = time - 1;
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Login
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    item => item.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    const now = new Date();
    const locale = currentAccount.locale; // navigator.language
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      // weekday: 'long'
    };

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.classList.add('show');
    updateUI(currentAccount);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    document.querySelector('.login').classList.remove('shake-horizontal');
    document.querySelector('.login').offsetWidth;
    document.querySelector('.login').classList.add('shake-horizontal');
  }

  const movementRows = Array.from(document.querySelectorAll('.movements__row'));
  movementRows.forEach((item, i) =>
    (i + 1) % 2 === 0 ? item.classList.add('gray') : item
  );
});

// Format Currency
const formatCur = (value, locale, currency) => {
  const options = {
    style: 'currency',
    currency: currency,
  };

  return new Intl.NumberFormat(locale, options).format(value);
};

// functions
const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, item) => acc + item, 0);
  labelBalance.textContent = formatCur(
    account.balance,
    account.locale,
    account.currency
  );
};

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / 86400000);

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'today';
  if (daysPassed === 1) return 'yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
};

const displayMovements = (account, sort = false) => {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach((item, i) => {
    const type = item > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMovement = formatCur(item, account.locale, account.currency);

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMovement}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(item => item > 0)
    .reduce((acc, item) => acc + item, 0);

  const outcomes = account.movements
    .filter(item => item < 0)
    .reduce((acc, item) => acc + item, 0);

  const interest = account.movements
    .filter(item => item > 0)
    .map(item => (item * account.interestRate) / 100)
    .filter(item => item >= 1)
    .reduce((acc, item) => acc + item, 0);

  labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);

  labelSumOut.textContent = formatCur(
    Math.abs(outcomes),
    account.locale,
    account.currency
  );

  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = account => {
  // Display movements
  displayMovements(account);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

// Transfer Money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    item => item.username === inputTransferTo.value
  );

  inputTransferTo.value = inputTransferAmount.value = '';

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAccount);
  } else {
    console.log(`You can't do it`);
  }

  clearInterval(timer);
  timer = startLogOutTimer();
});

// Request Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some(item => item >= amount * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }

  clearInterval(timer);
  timer = startLogOutTimer();

  inputLoanAmount.value = '';
});

// Close Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const username = inputCloseUsername.value;
  const pin = +inputClosePin.value;

  if (currentAccount.username === username && currentAccount.pin === pin) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.classList.remove('show');
  }

  clearInterval(timer);
  timer = startLogOutTimer();

  inputCloseUsername.value = inputClosePin.value = '';
});

let isMovsSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !isMovsSorted);
  isMovsSorted = !isMovsSorted;
});

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    item => +item.textContent.replace('€', '').trim()
  );
});
