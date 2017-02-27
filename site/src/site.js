// jshint esversion: 6

(function(window, document) {
  'use strict';

  document.addEventListener('DOMContentLoaded', e => {
    const tabs = document.querySelectorAll('[role="tablist"]');
    let initTab;

    if (window.location.hash) {
      initTab = window.location.hash.substring(1);
    }

    for (let i = 0; i < tabs.length; i++) {
      let tab = new window.Tablist(tabs[i]);

      if (initTab) {
        let t = tab.getTabByName(initTab);

        if (t) {
          tab.swapTab(t.getAttribute('aria-controls'));
        }
      }
    }
  });
}(window, document));
