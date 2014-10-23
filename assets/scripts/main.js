'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

;(function(window, document, undefined) {

	var banner = {
		form: {
			elem:  document.querySelector('form'),
			inputs: {
				destinationFrom: {
					elem: document.querySelector('#destinationFrom'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				destinationTo: {
					elem: document.querySelector('#destinationTo'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				departureMonth: {
					elem: document.querySelector('#departureMonth'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				departureDay: {
					elem: document.querySelector('#departureDay'),
					value: null,
					require: ['departureMonth'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				returnMonth: {
					elem: document.querySelector('#returnMonth'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				returnDay: {
					elem: document.querySelector('#returnDay'),
					value: null,
					require: ['returnMonth'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				countAdults: {
					elem: document.querySelector('#countAdults'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				countChildren: {
					elem: document.querySelector('#countChildren'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: false,
						changed: false
					}
				},
				childOneAge: {
					elem: document.querySelector('#childOneAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childTwoAge: {
					elem: document.querySelector('#childTwoAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childThreeAge: {
					elem: document.querySelector('#childThreeAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				childFourAge: {
					elem: document.querySelector('#childFourAge'),
					value: null,
					require: [],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				},
				searchButton: {
					elem: document.querySelector('#searchButton'),
					value: null,
					require: ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay'],
					states: {
						valid: false,
						disabled: true,
						changed: true
					}
				}
			}
		},
		departureDates: [],
		departureMonth: [],
		returnDates: [],
		returnMonths: [],
		logCount: 0,
		states: {
			valid: false
		}
	};
/**---------------------------------------
	Log
---------------------------------------**/
	banner.log = function(msg, msg2) {
		try {
			if (banner.logCount > 500) {
				console.clear();
				banner.logCount = 0;
			}
			if (msg !== undefined) {
				console.log(msg, msg2);
			}
			else {
				console.log(msg);
			}
			banner.logCount++;
		}
		catch(err) {
			//send error to developer platform
		}
	};
/**---------------------------------------
	Generate Dates & Month
---------------------------------------**/
	banner.daysInMonth = function(month, year) {
		var numOfDates =  new Date(year, (month+1), 0).getDate();
		var dates = [];
		for (var i=1;i<=numOfDates;i++) {
			dates.push(i);
		}
		return dates;
	};
	banner.generateDates = function() {
		// Range 4-365
		var departureDates = banner.generateCalender(4, 361);
		var returnDates = banner.generateCalender(6, 363);

		var monthList = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

		var i,
			date,
			month,
			year,
			index,
			ii,
			found,
			months;

		months = [];
		for (i=0;i<departureDates.length;i++) {
			date = departureDates[i];
			month = date.getMonth();
			year = date.getFullYear();

			found = false;
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					found = true;
				}
			}
			if (!found) {
				months.push({
					value: year + ' ' + month,
					name: monthList[month],
					dates: []
				});
			}
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					months[ii].dates.push(date);
				}
			}
		}
		banner.departureDates = months;

		months = [];
		for (i=0;i<returnDates.length;i++) {
			date = returnDates[i];
			month = date.getMonth();
			year = date.getFullYear();

			found = false;
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					found = true;
				}
			}
			if (!found) {
				months.push({
					value: year + ' ' + month,
					name: monthList[month],
					dates: []
				});
			}
			for (ii=0;ii<months.length;ii++) {
				if (months[ii].value === year + ' ' + month) {
					months[ii].dates.push(date);
				}
			}
		}
		banner.returnDates = months;

		banner.updatesMonths();
	};
	banner.updatesMonths = function() {
		//var html;
		//banner.form.inputs.departureMonth.elem.innerHtml = html;
		banner.log(banner.form.inputs.departureMonth.elem.options);

		//banner.form.inputs.departureMonth.elem.options.length = 1;

		for (var i=0;banner.form.inputs.departureMonth.elem.options.length;i++) {
			var option = banner.form.inputs.departureMonth.elem.options.length[i];
		}

		//document.myform.master.options[0]=new Option("Sports", "sportsvalue", true, false)

	};
	banner.updatesDates = function() {


	};
	banner.generateCalender = function(daysInFuture, length) {
		var calender = [];
		for (var i=0;i<=length;i++) {
			var date = new Date();
			date.setDate(date.getDate() + i + daysInFuture);
			calender.push(date);
		}
		return calender;
	};
/**---------------------------------------
	Value Change
---------------------------------------**/
	banner.valuesChange = function(event) {
		//banner.log('event', event);
		var id = event.target.id;
		var pointer = banner.form.inputs[id];
		pointer.value = event.target.value;
		pointer.states.changed = true;
		banner.log('pointer', pointer);
		banner.updateStates();
	};
/**---------------------------------------
	Update States
---------------------------------------**/
	banner.updateStates = function(event) {
		// Update individual states
		var key,
			input;
		for (key in banner.form.inputs) {
			input = banner.form.inputs[key];
			if (input.value !== null && input.value !== '') {
				input.states.valid = true;
				input.states.changed = true;
			}
			else {
				input.states.valid = false;
				input.states.changed = true;
			}
		}
		// Update individual requirements
		for (key in banner.form.inputs) {
			input = banner.form.inputs[key];
			if (input.require.length > 0) {
				var anyInvalid = false;
				for (var i=0;i<input.require.length;i++) {
					var require = input.require[i];
					var required = banner.form.inputs[require];
					if (required !== undefined) {
						if (!required.states.valid) {
							anyInvalid = true;
							break;
						}
					}
				}
				input.states.disabled = anyInvalid;
				input.states.changed = true;
			}
		}

		// Update DOM elements
		banner.updateDOM();
	};
/**---------------------------------------
	Update DOM
---------------------------------------**/
	banner.updateDOM = function(event) {
		for (var key in banner.form.inputs) {
			var input = banner.form.inputs[key];
			if (input.states.changed) {
				// Handle disabled
				if (input.states.disabled && !input.elem.hasAttribute('disabled')) {
					input.elem.setAttribute('disabled', 'disabled');
					// Ugly
					input.elem.parentNode.setAttribute('disabled', 'disabled');
				}
				else if (!input.states.disabled && input.elem.hasAttribute('disabled')) {
					input.elem.removeAttribute('disabled');
					// Ugly
					input.elem.parentNode.removeAttribute('disabled');
				}
				// Handle valid
				if (input.states.valid) {

				}
				else {

				}
				// Reset change state
				input.states.changed = false;
			}
		}
	};
/**---------------------------------------
	Bindings
---------------------------------------**/

	// Special handling for child ages
	banner.form.inputs.countChildren.elem.addEventListener('change', function(event) {
		var value = event.target.value;
		value = parseInt(value);
		switch(value) {
			case 0:
				banner.form.inputs.childOneAge.states.disabled = true;
				banner.form.inputs.childTwoAge.states.disabled = true;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay'];
				break;
			case 1:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = true;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge'];
				break;
			case 2:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = true;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge'];
				break;
			case 3:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = false;
				banner.form.inputs.childFourAge.states.disabled = true;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge', 'childThreeAge'];
				break;
			case 4:
				banner.form.inputs.childOneAge.states.disabled = false;
				banner.form.inputs.childTwoAge.states.disabled = false;
				banner.form.inputs.childThreeAge.states.disabled = false;
				banner.form.inputs.childFourAge.states.disabled = false;
				banner.form.inputs.searchButton.require = ['destinationFrom', 'destinationTo', 'departureMonth', 'departureDay', 'returnMonth', 'returnDay', 'childOneAge', 'childTwoAge', 'childThreeAge', 'childFourAge'];
				break;
		}
		banner.updateStates();
	}, false);

	// Handling for all inputs
	for (var key in banner.form.inputs) {
		var input = banner.form.inputs[key];
		input.elem.addEventListener('change', banner.valuesChange, false);
	}

	banner.generateDates();
	banner.updateStates();

})(window, window.document);