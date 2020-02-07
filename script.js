var budgetController = (function() {

  var Expense = function(id, description, value) {

    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;

  };

  Expense.prototype.calcPercentage = function(totalIncome) {

    if (totalIncome > 0) {

      this.percentage = Math.round((this.value / totalIncome) * 100);

    } else {

      this.percentage = -1;

    }

  };

  Expense.prototype.getPercentage = function() {

    return this.percentage;

  };

  var Income = function(id, description, value) {

    this.id = id;
    this.description = description;
    this.value = value;

  };

  var calculateTotal = function(type) {

    var sum = 0;

    data.allItems[type].forEach(function(currentElement) {
      sum += currentElement.value;
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
    addItem: function(type, desc, val) {
      var newItem, ID;

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

    deleteItem: function(type, id) {

      var ids, index;

      ids = data.allItems[type].map(function(currentElement) {

        return currentElement.id;

      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {

      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {

        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

      } else {

        data.percentage = -1;

      }

    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(currentVar) {

        currentVar.calcPercentage(data.totals.inc);

      });

    },

    getPercentages: function() {

      var allPercentages = data.allItems.exp.map(function(currentEl) {

        return currentEl.getPercentage();
      });

      return allPercentages;

    },

    getBudget: function() {

      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }

    },

    testing: function() {
      console.log(data);
    }

  }

})();

var UIController = (function() {

  var DOMstrings = {
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

  var formatNumber = function(num, type) {

    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];

    if (int.length > 3 && int.length <= 6) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    } else if (int.length > 6) {
      int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, int.length - 4) + ',' + int.substr(int.length - 3, int.length);
    }


    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callbackFn) {

    for (var i = 0; i < list.length; i++) {

      callbackFn(list[i], i);

    }

  };

  return {
    getInput: function() {

      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };

    },

    store: function() {

      var DOM = UIController.getDOMstrings();

      var newDiv = document.createElement('div');

      newDiv.id = 0;

      var month = document.querySelector(DOM.dateLabel).textContent;

      var income = document.querySelector(DOM.incomeLabel).textContent;

      var expenses = document.querySelector(DOM.expensesLabel).textContent;

      var percentage = document.querySelector(DOM.percentageLabel).textContent;

      var budget = document.querySelector(DOM.budgetLabel).textContent;

      var board = document.querySelector(DOM.board);

      var int = budget.replace(/[^\d\.\-]/g, "");

      var budgetValue = parseFloat(int);

      var summary = '';

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

      var cards = document.querySelectorAll('.saved_card');

      if (cards.length > 0) {

        for (i = 0; i < cards.length; i++) {

          var checkDate = document.querySelector('.card_date').textContent;

          var newDivContent = newDiv.outerHTML;

          var a = newDivContent.indexOf('<div class="card_date">');
          var b = newDivContent.indexOf(":<button");

          var newDivSlice = newDivContent.slice(a, b);

          var card = cards[i];

          var cardContent = card.outerHTML;

          board.appendChild(newDiv);

          var c = cardContent.indexOf('<div class="card_date">');
          var d = cardContent.indexOf(":<button");

          var cardSlice = cardContent.slice(a, b);

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

    getStorage: function() {

      var savedBoard = localStorage.getItem('savedBoard');
      var board = document.querySelector('.board');
      board.innerHTML = savedBoard;

    },

    addListItem: function(obj, type) {

      var html, newHtml, element;

      if (type === 'inc') {

        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-times-circle"></i></i></button></div></div></div>'

      } else if (type === 'exp') {

        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-times-circle"></i></i></button></div></div></div>';

      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID) {

      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);

    },

    clearFields: function() {

      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(currentValue, index, array) {

        currentValue.value = "";
      });

      fieldsArray[0].focus();

    },

    displayBudget: function(obj) {

      var type;
      if (obj.budget > 0) {
        type = 'inc';
      } else {
        type = 'exp';
      }

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);

      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }

    },

    displayPercentages: function(percentagesArr) {

      var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

      nodeListForEach(fields, function(current, index) {

        if (percentagesArr[index] > 0) {

          current.textContent = percentagesArr[index] + '%';

        } else {

          current.textContent = '---';

        }

      });

    },

    displayMonth: function() {

      var now, year, month, months;

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
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');

    },

    getDOMstrings: function() {
      return DOMstrings;
    }

  }

})();

var controller = (function(budgetCntrl, UICntrl) {

  var setUpEventListeners = function() {

    var DOM = UICntrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', controlAddItem);

    document.querySelector(DOM.saveButton).addEventListener('click', saveInputs);

    document.querySelector(DOM.board).addEventListener('click', function(event) {

      var classes = event.target.className;

      if (classes = '.ion-ios-close-outline') {

        var board = document.querySelector(DOM.board);

        var itemToBeDeleted = event.target.parentNode.parentNode.parentNode;

        board.removeChild(itemToBeDeleted);

        var savedBoard = localStorage.getItem("savedBoard");

        savedBoard = savedBoard.replace(itemToBeDeleted.outerHTML, '');

        localStorage.setItem('savedBoard', savedBoard);
      }
    });

    document.addEventListener('keypress', function(event) {

      if (event.keyCode === 13 || event.which === 13) {
        controlAddItem();
      }

    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType);

  };

  var updateBudget = function() {

    budgetCntrl.calculateBudget();

    var budget = budgetCntrl.getBudget();

    UICntrl.displayBudget(budget);

  };

  var updateExpPercentages = function() {

    budgetCntrl.calculatePercentages();

    var percentages = budgetCntrl.getPercentages();

    UICntrl.displayPercentages(percentages);

  };

  var saveInputs = function() {
    UICntrl.store();
  };

  var controlAddItem = function() {

    var input, newItem;

    input = UICntrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      newItem = budgetCntrl.addItem(input.type, input.description, input.value);

      UICntrl.addListItem(newItem, input.type);

      UICntrl.clearFields();

      updateBudget();

      updateExpPercentages();

    }

  };

  var ctrlDeleteItem = function(event) {

    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

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
    init: function() {

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
  }

})(budgetController, UIController);

controller.init();
