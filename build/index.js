(function() {
  'use strict';
  var e, module;

  module = null;

  try {
    module = angular.module('ndx');
  } catch (error) {
    e = error;
    module = angular.module('ndx', []);
  }

  module.provider('Scroller', function() {
    var callbacks, doCallback, elems;
    elems = {};
    callbacks = {
      visible: [],
      offscreen: []
    };
    doCallback = function(name, elem) {
      var fn, i, len, ref, results;
      ref = callbacks[name];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        fn = ref[i];
        results.push(fn(elem, name));
      }
      return results;
    };
    return {
      $get: function($window) {
        var bodySelector, calculateElem, calculateWindow, lastScrollTop, windowBottom, windowTop;
        bodySelector = 'html, body';
        if ($window.navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
          bodySelector = 'body';
        }
        lastScrollTop = $(bodySelector).scrollTop();
        windowTop = 0;
        windowBottom = 0;
        calculateWindow = function() {
          var windowHeight;
          windowTop = $(bodySelector).scrollTop();
          windowHeight = $window.innerHeight;
          return windowBottom = windowTop + windowHeight;
        };
        calculateElem = function(elem) {
          var elemBottom, elemTop, wasOffscreen, wasVisible;
          elemTop = elem.offset().top;
          elemBottom = elemTop + elem[0].clientHeight;
          if (windowTop > 0) {
            elem.addClass('scrolled');
            elem.removeClass('scroll-down');
            elem.removeClass('scroll-up');
            if (windowTop > lastScrollTop) {
              elem.addClass('scroll-down');
            } else {
              elem.addClass('scroll-up');
            }
          } else {
            elem.removeClass('scrolled');
            elem.removeClass('scroll-down');
            elem.removeClass('scroll-up');
          }
          wasVisible = elem.hasClass('scroll-visible');
          wasOffscreen = elem.hasClass('offscreen');
          if (elemBottom < windowTop) {
            elem.removeClass('offscreen-bottom');
            elem.removeClass('scroll-visible');
            elem.addClass('offscreen');
            elem.addClass('offscreen-top');
            if (!wasOffscreen) {
              return doCallback('offscreen', elem);
            }
          } else if (elemTop > windowBottom) {
            elem.removeClass('offscreen-top');
            elem.removeClass('scroll-visible');
            elem.addClass('offscreen');
            elem.addClass('offscreen-bottom');
            if (!wasOffscreen) {
              return doCallback('offscreen', elem);
            }
          } else {
            elem.removeClass('offscreen-top');
            elem.removeClass('offscreen-bottom');
            elem.removeClass('offscreen');
            elem.addClass('scroll-visible');
            if (!wasVisible) {
              return doCallback('visible', elem);
            }
          }
        };
        $window.addEventListener('scroll', function(e) {
          var elem, key;
          calculateWindow();
          for (key in elems) {
            elem = elems[key];
            calculateElem(elem);
          }
          return lastScrollTop = windowTop;
        });
        return {
          register: function(id, elem) {
            elem.addClass('scroller');
            elem.scrollId = id;
            elems[id] = elem;
            calculateWindow();
            return calculateElem(elem);
          },
          unregister: function(id) {
            return delete elems[id];
          },
          on: function(name, fn) {
            if (callbacks[name].indexOf(fn) === -1) {
              return callbacks[name].push(fn);
            }
          },
          off: function(name, fn) {
            return callbacks[name].splice(callbacks[name].indexOf(fn), 1);
          },
          scrollTop: function() {
            return $(bodySelector).animate({
              scrollTop: 0
            }, 400);
          }
        };
      }
    };
  }).directive('scroller', function(Scroller) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        var genId, id;
        genId = function(num) {
          var chars, output;
          output = 'id';
          chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          while (num--) {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
          return output;
        };
        id = genId(12);
        Scroller.register(id, $(elem));
        return scope.$on('$destroy', function() {
          return Scroller.unregister(id);
        });
      }
    };
  });

}).call(this);

//# sourceMappingURL=index.js.map
