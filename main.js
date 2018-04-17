"use strict";

// solution implemented in class ReportedProblem - method calculateDueDate

// would use a complier for production to enable browser support for older browsers not supporting ES6

class Controller {
  constructor(view) {
    this.view = view;
  }
  init() {
    this.view.init();
  }
  getFormDate() {
    const year = view.yearSelect.value;
    const month = view.monthSelect.value;
    const day = view.daySelect.value;
    const hour = view.hourSelect.value;
    const minute = view.minuteSelect.value;
    let currentFormDate = new Date(`${month} ${day}, ${year} ${hour}:${minute}`);
    return currentFormDate;
  }
  reportProblem() {
    let submitDate = this.getFormDate();
    const turnAroundTime = view.turnAroundInput.value;
    let bug = new ReportedProblem(submitDate, turnAroundTime);
    let bugDue = bug.calculateDueDate();
    view.dueDateHTML.textContent = bugDue;
  }
  validateForm() {
    const currentFormDate = this.getFormDate();
    const dayOfWeek = currentFormDate.getDay();
    const saturday = dayOfWeek == 6;
    const sunday = dayOfWeek == 0;
    const turnaroundInvalid = isNaN(parseInt(view.turnAroundInput.value));

    if (saturday) {
      view.dueDateHTML.textContent = 'Submit date is a Saturday, please choose a different date for the test';
      return false;
    } else if (sunday) {
      view.dueDateHTML.textContent = 'Submit date is a Sunday, please choose a different date for the test';
      return false;
    } else if (turnaroundInvalid) {
      view.dueDateHTML.textContent = 'Please fill in the turnaround time with a valid number';
      return false;
    } else {
      return true;
    }
  }
};


class View {
  constructor() {
    this.yearSelect = document.querySelector('#year');
    this.monthSelect = document.querySelector('#month');
    this.daySelect = document.querySelector('#day');
    this.hourSelect = document.querySelector('#hour');
    this.minuteSelect = document.querySelector('#minute');
    this.turnAroundInput = document.querySelector('#turnaround');
    this.submitButton = document.querySelector('button');
    this.dueDateHTML = document.querySelector('#duedate');
    //preserve day selection
    this.previousDay;
  }
  init() {
    view.render();
  }
  render() {
    // populate days, hours and minutes for the date selectors
    // as taken from MDN https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
    view.populateDays(this.monthSelect.value);
    view.populateHours();
    view.populateMinutes();
    // when the month or year <select> values are changed, rerun populateDays()
    // in case the change affected the number of available days
    this.yearSelect.onchange = () => {
      view.populateDays(this.monthSelect.value);
    },
    this.monthSelect.onchange = () => {
      view.populateDays(this.monthSelect.value);
    },
    // update what day has been set to previously
    // see end of populateDays() for usage
    this.daySelect.onchange = () => {
      this.previousDay = this.daySelect.value;
    }
    this.submitButton.onclick = () => {
      let validForm = controller.validateForm();
      if (validForm) {
        controller.reportProblem();
      }
    }
  }
  populateDays(month) {
    // delete the current set of <option> elements out of the
    // day <select>, ready for the next set to be injected
    while(this.daySelect.firstChild){
      this.daySelect.removeChild(this.daySelect.firstChild);
    }

    // Create variable to hold new number of days to inject
    var dayNum;

    // 31 or 30 days?
    if(month === 'January' | month === 'March' | month === 'May' | month === 'July' | month === 'August' | month === 'October' | month === 'December') {
      dayNum = 31;
    } else if(month === 'April' | month === 'June' | month === 'September' | month === 'November') {
      dayNum = 30;
    } else {
    // If month is February, calculate whether it is a leap year or not
      let year = this.yearSelect.value;
      (year - 2016) % 4 === 0 ? dayNum = 29 : dayNum = 28;
    }

    // inject the right number of new <option> elements into the day <select>
    for(var i = 1; i <= dayNum; i++) {
      var option = document.createElement('option');
      option.textContent = i;
      this.daySelect.appendChild(option);
    }

    // if previous day has already been set, set daySelect's value
    // to that day, to avoid the day jumping back to 1 when you
    // change the year
    if(this.previousDay) {
      this.daySelect.value = this.previousDay;

      // If the previous day was set to a high number, say 31, and then
      // you chose a month with less total days in it (e.g. February),
      // this part of the code ensures that the highest day available
      // is selected, rather than showing a blank daySelect
      if(this.daySelect.value === "") {
        this.daySelect.value = this.previousDay - 1;
      }

      if(this.daySelect.value === "") {
        this.daySelect.value = this.previousDay - 2;
      }

      if(this.daySelect.value === "") {
        this.daySelect.value = this.previousDay - 3;
      }
    }
  }
  populateHours() {
    // populate the hours <select> with the working hours of the day 9-17
    for(var i = 9; i < 17; i++) {
      var option = document.createElement('option');
      option.textContent = (i < 10) ? ("0" + i) : i;
      this.hourSelect.appendChild(option);
    }
  }
  populateMinutes() {
    // populate the minutes <select> with the 60 hours of each minute
    for(var i = 0; i <= 59; i++) {
      var option = document.createElement('option');
      option.textContent = (i < 10) ? ("0" + i) : i;
      this.minuteSelect.appendChild(option);
    }
  }
}



class ReportedProblem {
  constructor(submitDate, turnAroundTime) {
    this.submitDate = submitDate;
    this.turnAroundTime = turnAroundTime;
  }

  calculateDueDate() {
    this.addWholeWorkingDays();
    this.addHoursLeft();
    this.checkForWeekend();

    return this.dueDate;
  }

  addWholeWorkingDays() {
    const workingHoursInADay = 8;
    const workingDaysInAWeek = 5;
    const wholeWorkingdays = Math.floor(this.turnAroundTime / workingHoursInADay);
    const weekendDaysToBeBuffered = Math.floor(wholeWorkingdays / workingDaysInAWeek) * 2; // 2 days of each weekend

    // getting the day of the month (getDate) and adding the whole working days required for the work
    this.dueDate = new Date(this.submitDate.setDate(this.submitDate.getDate() + wholeWorkingdays));

    // accounting for weekends if the work requires more than a whole week
    if (wholeWorkingdays > workingDaysInAWeek) {
      this.dueDate.setDate(this.dueDate.getDate() + weekendDaysToBeBuffered);
    }
  }

  addHoursLeft() {
    // adding up the hours left after the whole working days have been accounted for
    const workingHoursInADay = 8;
    const workdayEndHour = 17;
    const hoursLeft = this.turnAroundTime % workingHoursInADay;
    const hoursUntilWorkDayEnd = workdayEndHour - this.dueDate.getHours();

    if (hoursLeft < hoursUntilWorkDayEnd) {
      this.dueDate.setHours(this.dueDate.getHours() + hoursLeft);
    } else {
      this.dueDate.setHours(this.dueDate.getHours() + hoursLeft + 16);
    }
  }

  checkForWeekend() {
    const dayOfWeek = this.dueDate.getDay();
    const saturday = dayOfWeek == 6;
    const sunday = dayOfWeek == 0;

    if (saturday) {
      this.dueDate.setDate(this.dueDate.getDate() + 2);
    } else if (sunday) {
      this.dueDate.setDate(this.dueDate.getDate() + 1);
    }
  }
};

const view = new View();
const controller = new Controller(view);
controller.init();