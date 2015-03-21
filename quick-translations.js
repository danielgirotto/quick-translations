// ==UserScript==
// @name        quick-translations
// @namespace   danielcgirotto
// @description Tradução rápida de palavras. en ~> pt-BR
// @include     http*
// @version     1
// @resource    cleanslate https://raw.githubusercontent.com/premasagar/cleanslate/master/cleanslate.css
// @resource    magic https://raw.githubusercontent.com/miniMAC/magic/master/magic.min.css
// @resource    style http://localhost:8000/style.css
// @require     http://code.jquery.com/jquery-1.11.2.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @noframes
// ==/UserScript==
$(function() {
  GM_addStyle(GM_getResourceText('cleanslate'));
  GM_addStyle(GM_getResourceText("magic"));
  GM_addStyle(GM_getResourceText("style"));

  $('body').dblclick(function(event) {
    var text = getSelectionText().toLowerCase();

    if(/[a-z]/.test(text))
      request(text);
  });

  $(document).click(function(event) {
    $('.tooltip').remove();
  });

  function getSelectionText() {
    if (window.getSelection) {
      return window.getSelection().toString();
    }
    if (document.selection && document.selection.type != 'Control') {
      return document.selection.createRange().text;
    }
    return '';
  }

  function request(text) {
    if(!request.cache) request.cache = {};

    if(request.cache[text] != null) {
      callback(request.cache[text]);
      return;
    }

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://translate.google.com/translate_a/t?',
      data: 'client=t&text=' + encodeURIComponent(text) + '&hl=auto&tl=pt',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      onload: function(response) {
        request.cache[text] = callback(response.responseText);
      }
    });
  }

  function callback(response) {
    parse(response);
    return response;
  }

  function parse(source) {
    var source = eval(source);

    $('<table>', {
      class: 'popup cleanslate magictime puffIn',
        append: $('<tr>', {
          text: 'Traduções de ' + source[0][0][1] + ' : ' + source[0][0][0]
        })
    }).appendTo('body');

    source = (typeof(source[1]) == "undefined") ? [] : source[1];

    $.each(source, function(index, word_classes) {
      $('<tr>', {
        class: 'word_classes',
        text: word_classes[0]
      }).appendTo('.popup');

      $.each(word_classes[2], function(index, words) {
        $('<tr>', {
          class: 'border_top',
          append: [
            $('<td>', {text: words[0]}),
            $('<td>', {text: words[1].join(', ')})
          ]
        }).appendTo('.popup');
      });
    });
  }
});
