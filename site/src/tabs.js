// jshint esversion: 6

(function() {

  const each = function(el, cb) {
    for (let i = 0; i < el.length; i++) {
      if (cb.call(this, i, el[i]) === false) {
        break;
      }
    }
  };

  const closest = function(el, what) {
    let newel = el;
    what = what.toUpperCase();

    do {
      newel = newel.parentNode;

      if (!newel) {
        break;
      }
    } while (newel.nodeName !== what);

    return newel;
  };

  const Tablist = function(ul) {
    const my = this;

    this.ul = ul;
    this.lis = this.ul.getElementsByTagName('li');
    this.tabs = this.ul.querySelectorAll('[role="tab"]');


    each(this.lis, (i, el) => {
      if (!el.classList.contains('active')) {
        let c = el.querySelectorAll('[role="tab"]');

        if (!c || !c.length) {
          return;
        }

        c = c[0];
        c.setAttribute('aria-selected', false);
        c = c.getAttribute('aria-controls');

        let t = document.getElementById(c);
        t.setAttribute('aria-hidden', true);
      }
    });


    each(this.tabs, (i, el) => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        my.swapTab(this.getAttribute('aria-controls'));
        return false;
      }, false);
    });
  };

  Tablist.prototype.getTabByName = function (name) {
    let tab;

    each(this.tabs, (i, el) => {
      const tid = el.getAttribute('id').substring(4);
      if (tid === name) {
        tab = el;
        return false;
      }
    });

    return tab;
  };

  Tablist.prototype.swapTab = function(which) {
    const cur = this.ul.querySelector('[aria-selected="true"]');
    const newt = this.ul.querySelector('[aria-controls=' + which + ']');

    if (newt.length === 0) {
      return;
    }

    if (cur.length) {
      let curb = cur.getAttribute('aria-controls');

      if (curb === which) {
        return false;
      }
    }

    const cur_target = document.querySelector('[id=' + cur.getAttribute('aria-controls') + ']');
    const new_target = document.querySelector('[id=' + newt.getAttribute('aria-controls') + ']');

    let tmp = closest(cur, 'li');
    tmp.classList.remove('active');
    cur.setAttribute('aria-selected', false);
    cur_target.setAttribute('aria-hidden', true);

    tmp = closest(newt, 'li');
    tmp.classList.add('active');
    newt.setAttribute('aria-selected', true);
    new_target.setAttribute('aria-hidden', false);
  };

  window.Tablist = Tablist;

}());
