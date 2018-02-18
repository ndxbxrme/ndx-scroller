'use strict'
module = null
try
  module = angular.module 'ndx'
catch e
  module = angular.module 'ndx', []
module.provider 'Scroller', ->
  elems = {}
  callbacks =
    visible: []
    offscreen: []
  doCallback = (name, elem) ->
    for fn in callbacks[name]
      fn elem, name
  $get: ($window) ->
    bodySelector = 'html, body'
    if $window.navigator.userAgent.match /(iPod|iPhone|iPad|Android)/
      bodySelector = 'body'
    lastScrollTop = $(bodySelector).scrollTop()
    windowTop = 0
    windowBottom = 0
    calculateWindow = ->
      windowTop = $(bodySelector).scrollTop()
      windowHeight = $window.innerHeight
      windowBottom = windowTop + windowHeight
    calculateElem = (elem) ->
      elemTop = elem.offset().top
      elemBottom = elemTop + elem[0].clientHeight
      if windowTop > 0
        elem.addClass 'scrolled'
        elem.removeClass 'scroll-down'
        elem.removeClass 'scroll-up'
        if windowTop > lastScrollTop
          elem.addClass 'scroll-down'
        else
          elem.addClass 'scroll-up'
      else
        elem.removeClass 'scrolled'
        elem.removeClass 'scroll-down'
        elem.removeClass 'scroll-up'
      wasVisible = elem.hasClass 'scroll-visible'
      wasOffscreen = elem.hasClass 'offscreen'
      if elemBottom < windowTop
        elem.removeClass 'offscreen-bottom'
        elem.removeClass 'scroll-visible'
        elem.addClass 'offscreen'
        elem.addClass 'offscreen-top'
        if not wasOffscreen
          doCallback 'offscreen', elem
      else if elemTop > windowBottom
        elem.removeClass 'offscreen-top'
        elem.removeClass 'scroll-visible'
        elem.addClass 'offscreen'
        elem.addClass 'offscreen-bottom'
        if not wasOffscreen
          doCallback 'offscreen', elem
      else
        elem.removeClass 'offscreen-top'
        elem.removeClass 'offscreen-bottom'
        elem.removeClass 'offscreen'
        elem.addClass 'scroll-visible'
        if not wasVisible
          doCallback 'visible', elem
    $window.addEventListener 'scroll', (e) ->
      calculateWindow()
      for key of elems
        elem = elems[key]
        calculateElem elem
      lastScrollTop = windowTop
    register: (id, elem) ->
      elem.addClass 'scroller'
      elem.scrollId = id
      elems[id] = elem
      calculateWindow()
      calculateElem elem
    unregister: (id) ->
      delete elems[id]
    on: (name, fn) ->
      if callbacks[name].indexOf(fn) is -1
        callbacks[name].push fn
    off: (name, fn) ->
      callbacks[name].splice(callbacks[name].indexOf(fn), 1)
    scrollTop: ->
      $(bodySelector).animate
        scrollTop: 0
      , 400
.directive 'scroller', (Scroller) ->
  restrict: 'A'
  link: (scope, elem) ->
    genId = (num) ->
      output = 'id'
      chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      while num--
        output += chars[Math.floor(Math.random() * chars.length)]
      output
    id = genId 12
    Scroller.register id, $(elem)
    scope.$on '$destroy', ->
      Scroller.unregister id
