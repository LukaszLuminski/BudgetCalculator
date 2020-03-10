/*jshint esversion: 6 */

const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {

      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;

    }

    calcPercentage(totalIncome) {

      if (totalIncome > 0) {

        this.percentage = Math.round((this.value / totalIncome) * 100);

      } else {

        this.percentage = -1;

      }

    }

    getPercentage() {

      return this.percentage;

    }
  }

  const Income = function(id, description, value) {

    this.id = id;
    this.description = description;
    this.value = value;

  };

  const calculateTotal = type => {

    let sum = 0;

    data.allItems[type].forEach(({value}) => {
      sum += value;
    });

    data.totals[type] = sum;

  };

  var data = {

    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem(type, desc, val) {
      let newItem;
      let ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem(type, id) {
      let ids;
      let index;

      ids = data.allItems[type].map(currentElement => currentElement.id);

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {

      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {

        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

      } else {

        data.percentage = -1;

      }

    },

    calculatePercentages() {

      data.allItems.exp.forEach(currentVar => {

        currentVar.calcPercentage(data.totals.inc);

      });

    },

    getPercentages() {

      const allPercentages = data.allItems.exp.map(currentEl => currentEl.getPercentage());

      return allPercentages;

    },

    getBudget() {

      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }

    },

    testing() {
      console.log(data);
    }

  };
})();

const UIController = (() => {

  const DOMstrings = {
    inputType: '.add_type',
    inputDescription: '.add_description',
    inputValue: '.add_value',
    inputButton: '.add_btn',
    saveButton: '.save_btn',
    deleteButton: '.card_delete_btn',
    incomeContainer: '.inc_list',
    expenseContainer: '.exp_list',
    budgetLabel: '.budget_value',
    incomeLabel: '.income_value',
    expensesLabel: '.expenses_value',
    percentageLabel: '.expenses_percentage',
    container: '.container',
    expPercentageLabel: '.item_percentage',
    dateLabel: '.title_month',
    board: '.board'
  };

  const formatNumber = (num, type) => {
    let numSplit;
    let int;
    let dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];

    if (int.length > 3 && int.length <= 6) {
      int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, int.length)}`;
    } else if (int.length > 6) {
      int = `${int.substr(0, int.length - 6)},${int.substr(int.length - 6, int.length - 4)},${int.substr(int.length - 3, int.length)}`;
    }


    dec = numSplit[1];

    return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
  };

  const nodeListForEach = (list, callbackFn) => {

    for (let i = 0; i < list.length; i++) {

      callbackFn(list[i], i);

    }

  };

  return {
    getInput() {

      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };

    },

    store() {

      const DOM = UIController.getDOMstrings();

      const newDiv = document.createElement('div');

      newDiv.id = 0;

      const month = document.querySelector(DOM.dateLabel).textContent;

      const income = document.querySelector(DOM.incomeLabel).textContent;

      const expenses = document.querySelector(DOM.expensesLabel).textContent;

      const percentage = document.querySelector(DOM.percentageLabel).textContent;

      const budget = document.querySelector(DOM.budgetLabel).textContent;

      const board = document.querySelector(DOM.board);

      const int = budget.replace(/[^\d\.\-]/g, "");

      const budgetValue = parseFloat(int);

      let summary = '';

      if (budgetValue <= 0) {
        summary = "🙁No savings this month.";
      } else if (budgetValue > 0 && budgetValue < 50) {
        summary = "🙂Not much savings, but at least a positive balance in your account.";
      }  else if (budgetValue >= 50 && budgetValue < 200) {
          summary = "🙂You've managed to save some money.";
      } else if (budgetValue >= 200) {
        summary = "😁Well done! You've made a fair bit of savings this month!";
      }

      newDiv.innerHTML = `<div class="card_date">${month}:<button class="card_delete_btn"><i class="far fa-times-circle"></i></i></button></div></div></div><ul class="card_inputs"><li>Income: ${income}</li><li>Expenses: ${expenses} (${percentage})</li><li>&nbsp;</li><li>Budget: ${budget}</li></ul><div class="card_summary">${summary}</div>`;

      newDiv.setAttribute('class', 'saved_card');

      const cards = document.querySelectorAll('.saved_card');

      if (cards.length > 0) {

        for (i = 0; i < cards.length; i++) {

          const checkDate = document.querySelector('.card_date').textContent;

          const newDivContent = newDiv.outerHTML;

          const a = newDivContent.indexOf('<div class="card_date">');
          const b = newDivContent.indexOf(":<button");

          const newDivSlice = newDivContent.slice(a, b);

          const card = cards[i];

          const cardContent = card.outerHTML;

          board.appendChild(newDiv);

          const c = cardContent.indexOf('<div class="card_date">');
          const d = cardContent.indexOf(":<button");

          const cardSlice = cardContent.slice(a, b);

          newDiv.id++;

          if (newDivSlice === cardSlice) {

            board.replaceChild(newDiv, card);
            localStorage.setItem('savedBoard', board.innerHTML);

          } else if (newDivSlice !== cardSlice) {

            board.appendChild(newDiv);
            localStorage.setItem('savedBoard', board.innerHTML);
          }
        }
      } else {

        newDiv.id = 0;
        console.log(newDiv.id);
        board.appendChild(newDiv);
        localStorage.setItem('savedBoard', board.innerHTML);
      }

    },

    getStorage() {

      const savedBoard = localStorage.getItem('savedBoard');
      const board = document.querySelector('.board');
      board.innerHTML = savedBoard;

    },

    addListItem({id, description, value}, type) {
      let html;
      let newHtml;
      let element;

      if (type === 'inc') {

        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-times-circle"></i></i></button></div></div></div>';

      } else if (type === 'exp') {

        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-times-circle"></i></i></button></div></div></div>';

      }

      newHtml = html.replace('%id%', id);
      newHtml = newHtml.replace('%description%', description);
      newHtml = newHtml.replace('%value%', formatNumber(value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem(selectorID) {

      const el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);

    },

    clearFields() {
      let fields;
      let fieldsArray;

      fields = document.querySelectorAll(`${DOMstrings.inputDescription},${DOMstrings.inputValue}`);

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach((currentValue, index, array) => {

        currentValue.value = "";
      });

      fieldsArray[0].focus();
    },

    displayBudget({budget, totalInc, totalExp, percentage}) {

      let type;
      if (budget > 0) {
        type = 'inc';
      } else {
        type = 'exp';
      }

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget, type);

      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(totalInc, 'inc');

      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(totalExp, 'exp');

      if (percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = `${percentage}%`;

      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }

    },

    displayPercentages(percentagesArr) {

      const fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

      nodeListForEach(fields, (current, index) => {

        if (percentagesArr[index] > 0) {

          current.textContent = `${percentagesArr[index]}%`;

        } else {

          current.textContent = '---';

        }

      });

    },

    displayMonth() {
      let now;
      let year;
      let month;
      let months;

      now = new Date();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
    },

    changedType() {

      const fields = document.querySelectorAll(
        `${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`);

      nodeListForEach(fields, ({classList}) => {
        classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');

    },

    getDOMstrings() {
      return DOMstrings;
    }

  };

})();

const controller = ((budgetCntrl, UICntrl) => {

  const setUpEventListeners = () => {

    const DOM = UICntrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', controlAddItem);

    document.querySelector(DOM.saveButton).addEventListener('click', saveInputs);

    document.querySelector(DOM.board).addEventListener('click', ({target}) => {

      let classes = target.className;

      if (classes = '.ion-ios-close-outline') {

        const board = document.querySelector(DOM.board);

        const itemToBeDeleted = target.parentNode.parentNode.parentNode;

        board.removeChild(itemToBeDeleted);

        let savedBoard = localStorage.getItem("savedBoard");

        savedBoard = savedBoard.replace(itemToBeDeleted.outerHTML, '');

        localStorage.setItem('savedBoard', savedBoard);
      }
    });

    document.addEventListener('keypress', ({keyCode, which}) => {

      if (keyCode === 13 || which === 13) {
        controlAddItem();
      }

    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType);

  };

  const updateBudget = () => {

    budgetCntrl.calculateBudget();

    const budget = budgetCntrl.getBudget();

    UICntrl.displayBudget(budget);

  };

  const updateExpPercentages = () => {

    budgetCntrl.calculatePercentages();

    const percentages = budgetCntrl.getPercentages();

    UICntrl.displayPercentages(percentages);

  };

  var saveInputs = () => {
    UICntrl.store();
  };

  var controlAddItem = () => {
    let input;
    let newItem;

    input = UICntrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      newItem = budgetCntrl.addItem(input.type, input.description, input.value);

      UICntrl.addListItem(newItem, input.type);

      UICntrl.clearFields();

      updateBudget();

      updateExpPercentages();

    }
  };

  var ctrlDeleteItem = ({target}) => {
    let itemID;
    let splitID;
    let type;
    let ID;

    itemID = target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      splitID = itemID.split('-');

      type = splitID[0];
      ID = parseInt(splitID[1]); // use parseInt to convert the string '1' to number 1
    }

    budgetCntrl.deleteItem(type, ID);

    UICntrl.deleteListItem(itemID);

    updateBudget();

    updateExpPercentages();
  };

  return {
    init() {

      UICntrl.displayMonth();

      UICntrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setUpEventListeners();
      UICntrl.getStorage();
    }
  };

})(budgetController, UIController);

controller.init();
