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
    options: {
      debug: true,
      feedUrl: 'assets/scripts/feed.json',
      loop: true,
      maxThumbsShown: 5,
      autoplay: false,
      autoplaytime: 10000,
      boxAnimationTime: 300,
      swipeMinTime: 50,
      swipeMaxTime: 400,
      swipeMinDistance: 100,
      swipeMaxDistance: 1600,
      clickPreventTime: 100
    },
		logCount: 0,
    categories: [],
    products: [],
    autoplay: null,
    currentIndex: 0,
    thumbIndexOffset: 0,
    numOfSlides: 0,
    timer: null,
    states: {
      boxAnimating: false,
      slideAnimating: false
    }
	};
/**---------------------------------------
	Log
---------------------------------------**/
	banner.log = function(msg, msg2) {
		try {
			if (banner.logCount > 200) {
				console.clear();
				banner.logCount = 0;
			}
			if (msg2 !== undefined) {
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
	Get Feed Data
---------------------------------------**/
	var getFeed = function() {
    var xmlhttp = new XMLHttpRequest();
    var feedUrl =banner.options.feedUrl;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var data = JSON.parse(xmlhttp.responseText);
        banner.log('data', data);
        banner.categories = enrichCategories(data.categories);
        banner.products = enrichProducts(data.products);
        banner.numOfSlides = banner.products.length;
        injectHtml();
      }
    };
    xmlhttp.open('GET', feedUrl, true);
    xmlhttp.send();
	};
  // Add states to products and categories
  var enrichCategories = function(list) {
    for (var i=0;i<list.length; i++) {
      var item = list[i];
      item.states = {
        active: true
      };
    }
    return list;
  };
  var enrichProducts = function(list) {
    for (var i=0;i<list.length; i++) {
      var item = list[i];
      item.states = {
        active: false,
        show: true
      };
    }
    return list;
  };
/**---------------------------------------
	DOM Functions
---------------------------------------**/
  // injectHtml
  var injectHtml = function() {
    var container = document.querySelector('.banner__slides');
    var thumbContainer = document.querySelector('.banner__thumbs');
    if (container === null || thumbContainer === null) {
      return false;
    }
    for (var i=0;i<banner.products.length; i++) {
      var product = banner.products[i];

      var elem = document.createElement('div');
      var elemImg = document.createElement('img');
      var thumbElem = document.createElement('div');
      var thumbElemImg = document.createElement('img');

      elem.className = 'banner__productimage';
      elemImg.src = product.img;
      thumbElem.className = 'banner__thumb';
      var thumbOnclick =  document.createAttribute('onclick');
      thumbOnclick.value = 'window.banner.switchSlide('+i+', true)';
      thumbElem.setAttributeNode(thumbOnclick); // Bind thumb onclick
      thumbElemImg.src = product.thumbImg;

      elem.appendChild(elemImg);
      container.appendChild(elem);
      thumbElem.appendChild(thumbElemImg);
      thumbContainer.appendChild(thumbElem);

      product.elem = elem;
      product.thumbElem = thumbElem;
      product.index = i;
      banner.log('product', product);

    }
    updateDOM();
  };
  // Update DOM
  var updateDOM = function() {
    banner.log('updateDOM', banner.currentIndex);

    banner.log('banner.categories', banner.categories);

    var i = 0,
        product;
    // Update product show state
    for (i=0;i<banner.products.length; i++) {
      product = banner.products[i];

      var categoriesValid = false;
      if (product.categories.length === 0) {
        categoriesValid = true; // The product should be shown
      }
      for (var ii = 0; ii < product.categories.length; ii++) {
        var _category = product.categories[ii];
        for (var iii = 0; iii < banner.categories.length; iii++) {
          if (banner.categories[iii].id === _category) {
            if (banner.categories[iii].states.active) {
              categoriesValid = true; // The product should be shown
            }
          }
        }
      }
      product.states.show = categoriesValid;
    }
    // Update product active state and position
    for (i=0;i<banner.products.length; i++) {
      product = banner.products[i];





      // Update Thumbs (!!!! This won't work. I have to rebuild the index to take account for categories !!!!)
      // Loop over the product, and only increase thumb index, when the correct ones are found.
      var localOffset = (product.index + banner.thumbIndexOffset) % banner.numOfSlides;
      //banner.log('localOffset', localOffset);
      if (localOffset < 5) {
        product.thumbElem.className = 'banner__thumb banner__thumb--pos'+localOffset;
      }

      // Update product active state
      if (product.index === banner.currentIndex) {
        var container = document.querySelector('.banner__930x600');
        var productInfoContainer = container.querySelector('.banner__productinfo');
        container.querySelector('.splash__line1').innerText = product.splashLine1;
        container.querySelector('.splash__line2').innerText = product.splashLine2;
        var html = '';
        html += '<div class="rte"><img src="'+product.logoImg+'">';
        html += '<div class="rte__headline">'+product.price+'</div>';
        html += '<p class="rte__tiny">'+product.desc+'<br>'+product.descAlt+'</p><a class="btn" href="'+product.href+'" target="_blank">Se detaljer her</a><a class="btn">Se flere tilbud</a>';
        html += '</div>';
        productInfoContainer.innerHTML = html;
        product.elem.className += 'banner__productimage--active';
        product.thumbElem.className =  product.thumbElem.className + ' banner__thumb--active';
      }
      else {
        product.elem.className = product.elem.className.replace(/banner__productimage--active/g, '');
        product.thumbElem.className = product.thumbElem.className.replace(/banner__thumb--active/g, '');
      }
    }
  };
  // categoryChange
  banner.categoryChange = function(category, elem) {
    //banner.log(category, elem.checked);
    var found = false;
    for (var i=0;i<banner.categories.length;i++) {
      var _category = banner.categories[i];
      //banner.log(_category);
      if (_category.id === category) {
        _category.states.active = elem.checked;
        found = true;
        break;
      }
    }
    if (found) {
      updateDOM();
    }
  };
/**---------------------------------------
  SLides Logic
---------------------------------------**/
  // Set state of autoplay
  function setAutoPlay(direction) {
  direction = (direction === undefined) ? 1 : direction;
  if (banner.options.autoplay) {
    banner.timer = setTimeout(function(){
      banner.switchSlide(direction);
    },banner.options.autoplaytime);
  }
}
  // Switch Slide
  banner.switchSlide = function(direction, jump) {
    //banner.log('switchSlide', direction);
    direction = (direction === undefined) ? 1 : direction;
    jump = (jump === undefined) ? false : jump;
    clearTimeout(banner.timer);
    var activeIndex = banner.currentIndex;
    var newActiveIndex;
    if (jump) {
      newActiveIndex = direction;
    }
    else {
      if (banner.options.loop) {
        newActiveIndex = (activeIndex + direction) % banner.numOfSlides;
      }
      else {
        newActiveIndex = activeIndex + direction;
        if (newActiveIndex > (banner.numOfSlides-1)) {
          newActiveIndex = banner.numOfSlides-1;
        }
      }
    }
    if (newActiveIndex < 0) {
      if (banner.options.loop) {
        newActiveIndex = Math.abs(banner.numOfSlides + newActiveIndex);
      }
      else {
        newActiveIndex = 0;
      }
    }
    banner.currentIndex = newActiveIndex;
    //setPos();
    updateDOM();
    setAutoPlay(direction);
  };
  // Switch Thumb
  banner.switchThumb = function(direction) {
    banner.thumbIndexOffset -= direction;
    updateDOM();
  };
  function setPos() {
    var leftPos = -(banner.currentIndex * 100);
    var css = {
      '-moz-transform': 'translate(' + leftPos +'%, 0%)',
      '-ms-transform': 'translate(' + leftPos +'%, 0%)',
      '-webkit-transform':'translate(' + leftPos +'%, 0%)',
      'transform': 'translate(' + leftPos +'%, 0%)'
    };
    banner.css = css;
  }
/**---------------------------------------
	Bindings
---------------------------------------**/

/**---------------------------------------
	Initialize
---------------------------------------**/
  getFeed();
  window.banner = banner;

})(window, window.document);
