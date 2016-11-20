// jshint esversion: 6

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', e => {
    window.console.log('Cool!');

    const tabs = document.querySelectorAll('[role="tablist"]');
    for (let i = 0; i < tabs.length; i++) {
      new window.Tablist(tabs[i]);
    }
    // each(), (i, el) => {
    //   window.console.log('el', el);
    // });
  });
}());
