'use strict';
const butCalculate = document.getElementById('start'),
    butCancel = document.getElementById('cancel'),
    butIncomeAdd = document.getElementsByTagName('button')[0],
    butExpensesAdd = document.getElementsByTagName('button')[1],
    inpDepositCheck = document.querySelector('#deposit-check'),
    inpAddIncome = document.querySelectorAll('.additional_income-item'),
    inpAddExpenses = document.querySelector('.additional_expenses-item'),
    budgetMonthVal = document.getElementsByClassName('budget_month-value')[0],
    budgetDayVal = document.getElementsByClassName('budget_day-value')[0],
    expesesMonthVal = document.getElementsByClassName('expenses_month-value')[0],
    addIncomeVal = document.getElementsByClassName('additional_income-value')[0],
    addExpensesVal = document.getElementsByClassName('additional_expenses-value')[0],
    incomePeriodVal = document.getElementsByClassName('income_period-value')[0],
    targetMonthValue = document.getElementsByClassName('target_month-value')[0],
    inpSalaryAmount = document.querySelector('.salary-amount'),
    inpTargetAmount = document.querySelector('.target-amount'),
    inpPeriodSelect = document.querySelector('.period-select'),
    titlePeriodAmount = document.querySelector('.period-amount'),
    depositCheck = document.getElementById('deposit-check'),
    depositBank = document.querySelector('.deposit-bank'),
    depositAmount = document.querySelector('.deposit-amount'),
    depositPercent = document.querySelector('.deposit-percent');

let inpTypeText = document.querySelectorAll('[type=text]'),
    incomeItems = document.querySelectorAll('.income-items'),
    expensesItems = document.querySelectorAll('.expenses-items'),
    inpPlaceHolderNum = document.querySelectorAll('[placeholder = "Сумма"'),
    inpPlaceHolderName = document.querySelectorAll('[placeholder = "Наименование"]'),
    newData = {};



class AppData {
    constructor() {
        this.budget = 0;
        this.budgetDay = 0;
        this.budgetMonth = 0;
        this.income = {};
        this.incomeMonth = 0;
        this.addIncome = [];
        this.expenses = {};
        this.addExpenses = [];
        this.expensesMonth = 0;
        this.deposit = false;
        this.percentDeposit = 0;
        this.moneyDeposit = 0;
        this.incomePeriod = 0;
        this.period = 0;
    }
    checkInpNum() {
        inpPlaceHolderNum.forEach(element => element.value = element.value.replace(/[^0-9.]/, ''));
        depositPercent.value = depositPercent.value.replace(/[^0-9.]/, '');
    }

    checkInpRuText() {
        inpPlaceHolderName.forEach(element => element.value = element.value.replace(/[^а-яА-Я,.!?"';: ]/, ''));
    }

    start(event) { // Кнопка Рассчитать
        if (inpSalaryAmount.value === '') {
            event.preventDefault();
        } else if (depositCheck.checked && (depositPercent.value === '' || depositPercent.value > 100 || depositPercent.value < 0)) {
            alert("Введите корректное значение в поле проценты");
            event.preventDefault();
        } else if (depositCheck.checked && depositAmount.value === '') {
            alert("Введите корректное значение в поле сумма");
            event.preventDefault();
        } else {
            this.budget = +inpSalaryAmount.value;

            this.getExpInc();
            this.getExpensesMonth();
            this.getAddIncExp();
            this.getInfoDeposit();
            this.getBudget();
            this.getTargetMonth();
            this.calcSavedMoney();

            this.showResults();
            inpTypeText = document.querySelectorAll('[type=text]');
            inpTypeText.forEach(item => item.disabled = 1);

            butIncomeAdd.disabled = true;
            butExpensesAdd.disabled = true;
            depositCheck.disabled = true;
            depositBank.disabled = true;

            butCalculate.style.display = `none`;
            butCancel.style.display = `block`;

            newData = {
                budgetMonth: this.budgetMonth,
                budgetDay: this.budgetDay,
                expensesMonth: this.expensesMonth,
                addExpenses: this.addExpenses,
                addIncome: this.addIncome,
                incomePeriod: this.incomePeriod,
                period: this.period
            };

            localStorage.setItem('localData', JSON.stringify(newData));

            this.setCookie("budgetMonth", this.budgetMonth);
            this.setCookie("budgetDay", this.budgetDay);
            this.setCookie("expensesMonth", this.expensesMonth);
            this.setCookie("addExpenses", this.addExpenses.join(', '));
            this.setCookie("addIncome", this.addIncome.join(', '));
            this.setCookie("incomePeriod", this.incomePeriod);
            this.setCookie("period", this.period);
            this.setCookie("isLoad", true);
        }
    }

    remove() { // Кнопка Сбросить
        for (let key in this) {
            if (typeof (this[key]) === `number`) {
                this[key] = 0;
            }
        }
        this.income = {};
        this.addIncome = [];
        this.expenses = {};
        this.addExpenses = [];
        this.deposit = false;

        inpTypeText = document.querySelectorAll('[type=text]');
        inpTypeText.forEach(item => item.value = '');
        inpTypeText.forEach(item => item.disabled = false);
        butIncomeAdd.disabled = false;
        butExpensesAdd.disabled = false;
        depositCheck.disabled = false;
        depositBank.disabled = false;
        depositBank.value = '';
        depositCheck.checked = false;

        if (incomeItems.length === 2 || incomeItems.length === 3) {
            for (let i = 1; i < incomeItems.length; i++) {
                incomeItems[i].remove();
            }
            butIncomeAdd.style.display = `block`;
        }
        if (expensesItems.length === 2 || expensesItems.length === 3) {
            for (let i = 1; i < expensesItems.length; i++) {
                expensesItems[i].remove();
            }
            butExpensesAdd.style.display = `block`;
        }
        inpPeriodSelect.value = 1;
        titlePeriodAmount.textContent = `1`;
        butCalculate.style.display = `block`;
        butCancel.style.display = `none`;
        depositBank.style.display = `none`;
        depositAmount.style.display = `none`;
        depositPercent.style.display = `none`;

        localStorage.removeItem('localData');
    }

    showResults() { // Показывает результат
        budgetMonthVal.value = this.budgetMonth;
        budgetDayVal.value = this.budgetDay;
        expesesMonthVal.value = this.expensesMonth;
        addExpensesVal.value = this.addExpenses.join(', ');
        addIncomeVal.value = this.addIncome.join(', ');
        incomePeriodVal.value = this.incomePeriod;
        targetMonthValue.value = this.period;
        inpPeriodSelect.addEventListener('input', this.calcSavedMoney.bind(this));
    }

    showResultsForUpdates() {
        if (localStorage.getItem('localData')) {
            newData = JSON.parse(localStorage.getItem('localData'));
            Object.assign(appData, newData);
            for (let key in newData) {
                if (this.getCookie(key) === undefined) {
                    this.deleteAllCookies();
                    localStorage.removeItem('localData');
                    window.location.reload();
                }
            }
            this.showResults();
            inpTypeText = document.querySelectorAll('[type=text]');
            inpTypeText.forEach(item => item.disabled = 1);

            butIncomeAdd.disabled = true;
            butExpensesAdd.disabled = true;
            depositCheck.disabled = true;
            depositBank.disabled = true;

            butCalculate.style.display = `none`;
            butCancel.style.display = `block`;
        }

    }

    addIncExpBlock(item) { // Добавляет блоки дополнительных доходов или обязательных расходов
        const startStr = item.target.parentNode.className;
        let startStrItem = document.querySelectorAll(`.${startStr}-items`);
        const cloneStartStrItem = startStrItem[0].cloneNode(true);
        cloneStartStrItem.childNodes[1].value = '';
        cloneStartStrItem.childNodes[3].value = '';

        startStrItem[0].parentNode.insertBefore(cloneStartStrItem, item.target);
        startStrItem = document.querySelectorAll(`.${startStr}-items`);
        inpPlaceHolderNum = document.querySelectorAll('[placeholder = "Сумма"');
        inpPlaceHolderName = document.querySelectorAll('[placeholder = "Наименование"]');
        inpPlaceHolderNum.forEach(element => element.addEventListener('input', this.checkInpNum));
        inpPlaceHolderName.forEach(element => element.addEventListener('input', this.checkInpRuText));

        if (startStrItem.length === 3) {
            item.target.style.display = `none`;
        }

    }

    getExpInc() { // Доболнительные доходы и Обязательные расходы
        incomeItems = document.querySelectorAll('.income-items');
        expensesItems = document.querySelectorAll('.expenses-items');
        const count = item => {
            const startStr = item.className.split('-')[0];
            const itemTitle = item.querySelector(`.${startStr}-title`).value;
            const itemAmount = item.querySelector(`.${startStr}-amount`).value;
            if (itemTitle !== '' && itemAmount !== '') {
                this[startStr][itemTitle] = itemAmount;
            }
        };

        incomeItems.forEach(count);

        expensesItems.forEach(count);
    }

    getAddIncExp() { // Возможные дооды и расходы
        const pushItems = element => {
            let itemVal;
            if (typeof (element.value) === 'string') {
                itemVal = element.value.split(',');
                itemVal.forEach(item => {
                    item = item.trim();
                    if (item !== '') {
                        this.addExpenses.push(item);
                    }
                });
            } else {
                element.forEach(item => {
                    itemVal = item.value.trim();
                    if (itemVal !== '') {
                        this.addIncome.push(itemVal);
                    }
                });
            }
        };
        pushItems(inpAddIncome);
        pushItems(inpAddExpenses);
    }

    changeTitlePeriod() {
        titlePeriodAmount.textContent = inpPeriodSelect.value;
    }

    getExpensesMonth() { // Сумма всех обязательных расходов
        let sum = 0;
        for (let key in this.expenses) {
            sum = +sum + (+this.expenses[key]);
        }
        this.expensesMonth += sum;
        return this.expensesMonth;
    }

    getBudget() { // Высчитывает бюджет на месяц и на день
        const mothDeposit = this.moneyDeposit * (this.percentDeposit / 100);
        for (let key in this.income) {
            this.incomeMonth += +this.income[key];
        }
        this.budgetMonth = this.budget + this.incomeMonth - this.expensesMonth + mothDeposit;
        this.budgetDay = Math.floor(this.budgetMonth / 30);
    }

    getTargetMonth() { // Подсчитывает, за какой период будет достигнута цель
        return this.period = Math.ceil(inpTargetAmount.value / this.budgetMonth);
    }

    calcSavedMoney() { //Накопления за период
        incomePeriodVal.value = this.budgetMonth * inpPeriodSelect.value;
        this.incomePeriod = incomePeriodVal.value;
    }

    getInfoDeposit(event) {
        if (this.deposit) {
            this.percentDeposit = depositPercent.value;
            this.moneyDeposit = depositAmount.value;
        }
    }

    changePercent() {
        const valueSelect = this.value;
        if (valueSelect === 'other') {
            depositPercent.value = '';
            depositPercent.style.display = 'inline-block';
        } else {
            depositPercent.style.display = 'none';
            depositPercent.value = valueSelect;
        }

    }

    depositHandler() {
        if (depositCheck.checked) {
            depositBank.style.display = 'inline-block';
            depositAmount.style.display = 'inline-block';
            this.deposit = true;
            depositBank.addEventListener('change', this.changePercent);
        } else {
            depositBank.style.display = 'none';
            depositAmount.style.display = 'none';
            depositBank.value = '';
            depositAmount.value = '';
            this.deposit = false;
            depositBank.removeEventListener('change', this.changePercent);
        }
    }

    eventListeners() {
        butCalculate.addEventListener('click', this.start.bind(this));
        butCancel.addEventListener('click', this.remove.bind(this));
        inpPeriodSelect.addEventListener('input', this.changeTitlePeriod);
        butIncomeAdd.addEventListener('click', this.addIncExpBlock.bind(this));
        butExpensesAdd.addEventListener('click', this.addIncExpBlock.bind(this));
        inpPlaceHolderNum.forEach(element => element.addEventListener('input', this.checkInpNum));
        inpPlaceHolderName.forEach(element => element.addEventListener('input', this.checkInpRuText));
        depositPercent.addEventListener('input', this.checkInpNum);
        depositCheck.addEventListener('change', this.depositHandler.bind(this));
    }

    setCookie(name, value, year, month, day, path, domain, secure) {
        let cookieString = name + "=" + encodeURI(value);

        if (year) {
            let expires = new Date(year, month - 1, day);
            cookieString += "; expires=" + expires.toGMTString();
        }
        if (path) {
            cookieString += "; path=" + encodeURI(path);
        }
        if (domain) {
            cookieString += "; domain=" + encodeURI(domain);
        }
        if (secure) {
            cookieString += "; secure";
        }
        document.cookie = cookieString;
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    deleteAllCookies() {
        let cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}

let appData = new AppData();

appData.eventListeners();
appData.showResultsForUpdates();
