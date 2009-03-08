/**
 * Super Selectors
 * A jQuery plugin enabling better CSS selector support for older browsers
 *  by leveraging jQuery's excellent selectors
 * 
 * Version 1.0
 * Author: Chris Patterson
 *
 * License: GPL 3 http://www.gnu.org/licenses/gpl-3.0.html
 * 
 **/
(function($){
  $.fn.superSelectify = function(options) {

  var defaults = {
   emptyClass: "empty",
   firstClass: "first",
   lastClass: "last",
   oddClass: "odd",
   evenClass: "even",
   nextClass: "next",
   siblingClass: "sibling",
   firstChildClass: "first-child",
   lastChildClass: "last-child",
   onlyChildClass: "only-child",
   directChildClass: "child", /* For parent > child */
   textInputClass: "text",
   passwordInputClass: "password",
   radioInputClass: "radio",
   checkboxInputClass: "checkbox",
   submitInputClass: "submit",
   imageInputClass: "image",
   resetInputClass: "reset",
   buttonInputClass: "button",
   fileInputClass: "file",
   hoverClass: "hover",
   manualSelectors: false,
   forceStylesheetParsing: false,
   additionalElementHash: {} /* To allow specification of regular expressions & classes to extend SuperSelectors */
  };  

  var options = $.extend(defaults, options);

  // Add classes for additional Elements first
  for (var className in options.additionalElementHash) {  
     $(options.additionalElementHash[className]).addClass(className);
  }
  
  function getMatches(CSS) {
  
    function _match_item(reg, className) {
      var itemMatch = CSS.replace(/[\n\r]/gi, '').match(reg);
      if(itemMatch) itemMatch=itemMatch.join(", ");
      if(itemMatch) $(itemMatch).addClass(className);
    }

    function _match_hover(reg, className) {
      var itemMatch = CSS.replace(/[\n\r]/gi, '').match(reg);
      if(itemMatch) itemMatch=itemMatch.join(", ");
      if(itemMatch) $(itemMatch).hover(
       function() {
        $(this).addClass(className);
       },
       function() {
        $(this).removeClass(className);
       }
      );
    }
    
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:empty/gi, options.emptyClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:first[^-]/gi, options.firstClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:last[^-]/gi, options.lastClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:nth-child\(odd\)/gi, options.oddClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:nth-child\(even\)/gi, options.evenClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*?\+\s?[a-zA-Z0-9._+~#:-]*/gi, options.nextClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*?\~\s?[a-zA-Z0-9._+~#:-]*/gi, options.siblingClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:first-child/gi, options.firstChildClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:last-child/gi, options.lastChildClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*:only-child/gi, options.onlyChildClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*\>\s?[a-zA-Z0-9._+~#:-]*/gi, options.directChildClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="text"\]/gi, options.textInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="password"\]/gi, options.passwordInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="radio"\]/gi, options.radioInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="checkbox"\]/gi, options.checkboxInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="submit"\]/gi, options.submitInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="image"\]/gi, options.imageInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="reset"\]/gi, options.resetInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="button"\]/gi, options.buttonInputClass);
    _match_item(/[a-zA-Z0-9._+~#:\s-]*input\[type="file"\]/gi, options.fileInputClass);

		// Also add hover listeners as needed
    _match_hover(/[a-zA-Z0-9._+~#:\s-]*:hover/gi, options.hoverClass);

    // Check for any imports within the passes CSS
    // Only IE should ever hit this (other browsers 
    //  will return them within ruleIterator)
    var importedCSS = CSS.match(/[a-zA-Z0-9\.\-_\+\s]*import([a-zA-Z0-9\.\-_\+\/]*\.css)/gi);

    if (importedCSS) {
      var fakeStyleSheet = [];
      for (stylesheet=0;stylesheet<importedCSS.length;stylesheet++) {
        fakeStyleSheet['href'] = importedCSS[stylesheet];
        getCSS(fakeStyleSheet);
      }  
    }

  }

  // Needed for non-IE browsers, as they don't support the cssText method for full stylesheets
  function ruleIterator(sheet) {
    var css = sheet.cssRules;
    for(var rule=0;rule<css.length;rule++) {
      if(css[rule].styleSheet) getCSS(css[rule].styleSheet);
      if(css[rule].selectorText == null) continue;
      getMatches(css[rule].selectorText);
    }
  }

  // Retrieve the CSS if it's a link or import, otherwise process the embedded CSS
  function getCSS(sheet) {
    if(sheet.href) {
      var RELATIVE = /^[\w\.]+[^:]*$/;
      var docURL = String(window.location);
      var href = (RELATIVE.test(sheet.href)) ? (docURL.slice(0, docURL.lastIndexOf("/") + 1) + sheet.href) : sheet.href;
      $.ajax({ url: href, success: function(response){ getMatches(response); } });
    } else {
      if(sheet.cssText) {
        getMatches(sheet.cssText);
      } else {
        ruleIterator(sheet);
      }
    } 
  }


  // If manual selectors have been provided, apply those first
  if(options.manualSelectors) getMatches(options.manualSelectors);
  
  // Only parse the stylesheets if no manual selectors are provided, or the user is forcing the behavior
  if(!options.manualSelectors || options.forceStylesheetParsing) {
  
    // Safari loads things in parallel, so we have to wait for everything to finish before proceeding
    // otherwise it thinks there are no stylesheets
     if (jQuery.browser.safari && document.readyState != "complete"){
       setTimeout( arguments.callee, 100 );
       return;
     }

    for(stylesheet=0;stylesheet<document.styleSheets.length;stylesheet++) {
      getCSS(document.styleSheets[stylesheet]);
    };
  }

};

})(jQuery);
