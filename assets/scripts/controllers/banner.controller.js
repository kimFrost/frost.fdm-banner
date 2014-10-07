//'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

(function (undefiend) {

	// Debug
	//document.ontouchmove = function(event){
		//event.preventDefault();
		//event.stopPropagation();
	//};


	var datafeed = {
		departures: [
			{
				name: 'København',
				flag: 'dk'
			},
			{
				name: 'Aalborg',
				flag: 'dk'
			},
			{
				name: 'Aarhus',
				flag: 'dk'
			},
			{
				name: 'Billund',
				flag: 'dk'
			},
			{
				name: 'Rønne',
				flag: 'dk'
			},
			{
				name: 'Hamburg',
				flag: 'de'
			}
		],
		destinations: [
			{
				name: 'Spanien',
				towns: [
					{
						name: 'Costa del Sol'
					},
					{
						name: 'Barcelona'
					}
				]
			},
			{
				name: 'USA',
				towns: [
					{
						name: 'New York'
					},
					{
						name: 'Florida'
					}
				]
			}
		]
	};


	angular
        .module('fdm-banner')
        .controller('bannerCtrl', bannerCtrl);

	/* @ngInject */
	function bannerCtrl($scope, $rootScope, $timeout, $interval) {

		// Data
		var banner = this;
		banner.options = {
			debug: true,
			loop: false
		};
		banner.fps = -1;
		banner.departures = datafeed.departures;
		banner.destinations = datafeed.destinations;
		banner.activeStep = 0;
		banner.timer = null;
		banner.dates = generateDates();
		banner.steps = [
			{
				id: 0,
				name: 'Step 1',
				require: [],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: false,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			},
			{
				id: 1,
				name: 'Step 2',
				require: [0],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: true,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			},
			{
				id: 2,
				name: 'Step 3',
				require: [0,1],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: true,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			}
		];
		banner.states = {
			hideVeil: false,
			noAnimate: false
		};
		banner.css = {};
		banner.temp = {
			frameCount: 0
		};

		// Public functions
		banner.checkstep = checkstep;
		banner.switchstep = switchstep;
		banner.returnOptionsClass = returnOptionsClass;
		banner.formvalidate = formvalidate;

		/** BINDINGS */
		// Update framerate every second
		$interval(function(){
			banner.fps = banner.temp.frameCount;
			banner.temp.frameCount = 0;
		},1000);

		/** INITIATE */
		// Start update loop
		updateLoop();
		updateLocks();
		// Drop veil
		$timeout(function() {
			banner.states.hideVeil = true;
		},1000);

		/** FUNCTION LIBRARY */

		// Debug
		function log(msg1, msg2) {
			msg1 = (msg1 === undefiend) ? null : msg1;
			msg2 = (msg2 === undefiend) ? null : msg2;
			if (banner.options.debug) {
				if (msg2 !== null) {
					console.log(msg1, msg2);
				}
				else {
					console.log(msg1);
				}
			}
		}

		function daysInMonth(month,year) {
			var numOfDates =  new Date(year, (month+1), 0).getDate();
			//log(month, numOfDates);
			var dates = [];
			for (var i=1;i<=numOfDates;i++) {
				dates.push(i);
			}
			return dates;
		}

		function generateDates() {
			var currentDate = new Date();
			var currentYear = currentDate.getFullYear();
			var currentMonthIndex = currentDate.getMonth();
			var currentDayIndex = currentDate.getDate();

			var monthList = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
			var months = [];
			var i = 0;
			for (i=0;i<monthList.length;i++) {
				var newIndex = (currentMonthIndex + i) % monthList.length;
				var year = currentYear;
				if (currentMonthIndex + i > (monthList.length - 1)) {
					year++;
				}
				months[i] = {
					name: monthList[newIndex],
					value: newIndex,
					index: i,
					year: year,
					dates: daysInMonth(newIndex, year)
				};
			}
			log('months', months);
			return months;
		}

		function returnOptionsClass(name) {
			return 'form__option--'+name;
		}

		// Check step
		function checkstep(id) {
			if (id !== undefined) {
				if (id === banner.activeStep) {
					return true;
				}
				else {
					return false;
				}
			}
		}

		// Switch Step
		function switchstep(direction, jump, animate) {

			log('$scope',$scope);

			direction = (direction === undefined) ? 1 : direction;
			jump = (jump === undefined) ? false : jump;
			animate = (animate === undefined) ? true : animate;
			$timeout.cancel(banner.timer);

			var activeIndex = banner.activeStep;
			var newActiveIndex;
			var numOfSlides = banner.steps.length;
			banner.states.noAnimate = !animate;
			if (jump) {
				newActiveIndex = direction;
				// To prevent autoplay from jumping the same amount on next switch
				if (direction > 0) {
					direction = 1;
				}
				else {
					direction = -1;
				}
			}
			else {
				if (banner.options.loop) {
					newActiveIndex = (activeIndex + direction) % numOfSlides;
				}
				else {
					newActiveIndex = activeIndex + direction;
					if (newActiveIndex > (numOfSlides-1)) {
						newActiveIndex = numOfSlides-1;
					}
				}
			}
			if (newActiveIndex < 0) {
				if (banner.options.loop) {
					newActiveIndex = Math.abs(numOfSlides + newActiveIndex);
				}
				else {
					newActiveIndex = 0;
				}
			}
			updateLocks(); // Update lock states
			var locked = checklock(newActiveIndex);
			if (!locked) {
				banner.activeStep = newActiveIndex;
			}
		}

		// Check lock
		function checklock(id) {
			var step = banner.steps[id];
			if (step !== undefined) {
				return step.states.locked;
			}
			else {
				return false;
			}
		}

		// Update Locks
		function updateLocks() {
			var steps =  banner.steps;
			for (var i=0;i<steps.length;i++) {
				var step = steps[i];
				var anyNotValid = false;
				if (step.require !== undefined && step.require.length > 0) {
					// Find step required step and check their valid state
					for (var ii=0;ii<step.require.length; ii++) {
						var requiredStep = step.require[ii];
						if (!steps[requiredStep].states.valid) {
							anyNotValid = true;
						}
					}
					step.states.locked = anyNotValid;
				}
				else {
					step.states.locked = anyNotValid;
				}
				if (!step.states.locked && !step.states.done) {

				}
			}
		}

		function getFormValidation(formname){
			var form = $scope[formname];
			log('getFormValidation', form);
			if (form !== undefiend) {
				if (!form.$invalid) {
					return true;
				}
				else {
					return false;
				}
			}
		}

		function formvalidate(formname, callback) {
			if (formname === undefiend) {
				return;
			}
			var valid = getFormValidation(formname);

			log(formname, valid);

			if (!valid) {
				return;
			}
			else {
				if (callback && typeof(callback) === 'function') {
					//callback();
				}
				else {
					//eval(callback)
				}
			}
		}

		// Update Loop
		function updateLoop() {
			window.requestAnimFrame(updateLoop);
			update();
			banner.temp.frameCount++;
		}

		function update() {

		}

    }
})();