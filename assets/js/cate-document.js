(function(){
  'use strict';

  /* ══════════════════════════════════
     Theme: load / save / toggle
     ══════════════════════════════════ */
  var THEME_KEY = 'doc-theme';

  function getSystemTheme(){
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
  }

  function getTheme(){
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  }

  // Apply stored theme immediately (before paint)
  applyTheme(getTheme());

  var themeBtn = document.getElementById('doc-theme-toggle');
  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // Listen to system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
    if(!localStorage.getItem(THEME_KEY)){
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ══════════════════════════════════
     Group collapse / expand
     ══════════════════════════════════ */
  document.querySelectorAll('.doc-nav-group-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(this.dataset.target);
      var group  = this.closest('.doc-nav-group');
      group.classList.toggle('is-collapsed');
      if(target){
        target.style.display = group.classList.contains('is-collapsed') ? 'none' : '';
      }
    });
  });

  // Auto expand the group containing active item
  var active = document.querySelector('.doc-nav-item.is-active');
  if(active){
    var group = active.closest('.doc-nav-group');
    if(group){
      group.classList.remove('is-collapsed');
      var list = group.querySelector('.doc-nav-list');
      if(list) list.style.display = '';
    }
  }

  /* ══════════════════════════════════
     Search filter
     ══════════════════════════════════ */
  var searchInput = document.getElementById('doc-search');
  if(searchInput){
    searchInput.addEventListener('input', function(){
      var q = this.value.toLowerCase().trim();
      document.querySelectorAll('.doc-nav-item').forEach(function(item){
        var label = item.querySelector('.doc-nav-label');
        if(!label) return;
        var match = !q || label.textContent.toLowerCase().indexOf(q) !== -1;
        item.style.display = match ? '' : 'none';
      });
      document.querySelectorAll('.doc-nav-group').forEach(function(grp){
        var visible = grp.querySelectorAll('.doc-nav-item:not([style*="display: none"])');
        grp.style.display = visible.length > 0 ? '' : 'none';
        if(q && visible.length > 0){
          grp.classList.remove('is-collapsed');
          var lst = grp.querySelector('.doc-nav-list');
          if(lst) lst.style.display = '';
        }
      });
    });
  }

  /* ══════════════════════════════════
     Mobile sidebar toggle
     ══════════════════════════════════ */
  var sidebar = document.getElementById('doc-sidebar');
  var toggle  = document.getElementById('doc-mobile-toggle');
  var content = document.querySelector('.doc-content-wrap');

  if(toggle && sidebar){
    toggle.addEventListener('click', function(){
      sidebar.classList.toggle('is-open');
      var icon = this.querySelector('i');
      if(icon){
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  if(content && sidebar && toggle){
    content.addEventListener('click', function(){
      if(sidebar.classList.contains('is-open')){
        sidebar.classList.remove('is-open');
        var icon = toggle.querySelector('i');
        if(icon){
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      }
    });
  }

})();
/* ══════════════════════════════════
Table of Contents
══════════════════════════════════ */
var tocContainer = document.getElementById('doc-toc');
var tocList      = document.getElementById('doc-toc-list');
var articleBody  = document.querySelector('.doc-article-body');

if(tocContainer && tocList && articleBody){
  // Collect headings
  var headings = articleBody.querySelectorAll('h2, h3, h4');
  var tocItems = [];

  if(headings.length > 1){
    headings.forEach(function(h, i){
      // Ensure each heading has an id
      if(!h.id){
        h.id = 'heading-' + i + '-' + h.textContent.trim()
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fff]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 40);
      }

      var li = document.createElement('li');
      li.className = 'doc-toc-item toc-' + h.tagName.toLowerCase();

      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      a.addEventListener('click', function(e){
        e.preventDefault();
        var target = document.getElementById(h.id);
        if(target){
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + h.id);
        }
        // Close mobile panel
        closeMobileToc();
      });

      li.appendChild(a);
      tocList.appendChild(li);
      tocItems.push({ el: h, link: a, li: li });
    });

    // Intersection Observer for active state
    var observerOpts = {
      root: null,
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    };

    var activeIdx = -1;

    function setActive(idx){
      if(idx === activeIdx) return;
      if(activeIdx >= 0 && tocItems[activeIdx]){
        tocItems[activeIdx].li.classList.remove('is-active');
      }
      activeIdx = idx;
      if(idx >= 0 && tocItems[idx]){
        tocItems[idx].li.classList.add('is-active');
        // Scroll TOC item into view if needed
        var tocEl = tocItems[idx].li;
        var tocRect = tocContainer.getBoundingClientRect();
        var itemRect = tocEl.getBoundingClientRect();
        if(itemRect.top < tocRect.top || itemRect.bottom > tocRect.bottom){
          tocEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    var headingObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var idx = tocItems.findIndex(function(t){ return t.el === entry.target; });
          if(idx !== -1) setActive(idx);
        }
      });
    }, observerOpts);

    headings.forEach(function(h){
      headingObserver.observe(h);
    });

    // If no heading is intersecting on load, activate first
    setActive(0);

  } else {
    // Only 0-1 headings, hide TOC
    tocContainer.style.display = 'none';
  }
}

/* ── Mobile TOC panel ── */
var tocMobileBtn    = document.getElementById('doc-toc-mobile-btn');
var tocMobilePanel  = document.getElementById('doc-toc-mobile-panel');
var tocMobileOverlay = document.getElementById('doc-toc-mobile-overlay');
var tocMobileList   = document.getElementById('doc-toc-mobile-list');

function closeMobileToc(){
  if(tocMobilePanel) tocMobilePanel.classList.remove('is-open');
  if(tocMobileOverlay) tocMobileOverlay.classList.remove('is-visible');
}

if(tocMobileBtn && tocMobilePanel && tocMobileOverlay){
  // Clone TOC items into mobile panel
  if(tocList && tocList.children.length > 0){
    tocMobileList.innerHTML = tocList.innerHTML;
    // Rebind click events for mobile items
    tocMobileList.querySelectorAll('a').forEach(function(a){
      var href = a.getAttribute('href');
      if(href && href.startsWith('#')){
        a.addEventListener('click', function(e){
          e.preventDefault();
          var target = document.querySelector(href);
          if(target){
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', href);
          }
          closeMobileToc();
        });
      }
    });
  } else {
    tocMobileBtn.style.display = 'none';
  }

  tocMobileBtn.addEventListener('click', function(){
    tocMobilePanel.classList.toggle('is-open');
    tocMobileOverlay.classList.toggle('is-visible');
  });
  tocMobileOverlay.addEventListener('click', closeMobileToc);
}