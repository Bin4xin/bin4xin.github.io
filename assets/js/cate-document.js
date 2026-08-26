(function(){
  'use strict';
  /* ══════════════════════════════════
     Group collapse / expand
     ══════════════════════════════════ */

  // 1. First: collapse ALL groups
  document.querySelectorAll('.doc-nav-group').forEach(function(grp){
    grp.classList.add('is-collapsed');
    var list = grp.querySelector('.doc-nav-list');
    if(list) list.style.display = 'none';
  });

  // 2. Then: expand only the active group
  var active = document.querySelector('.doc-nav-item.is-active');
  if(active){
    var activeGroup = active.closest('.doc-nav-group');
    if(activeGroup){
      activeGroup.classList.remove('is-collapsed');
      var activeList = activeGroup.querySelector('.doc-nav-list');
      if(activeList) activeList.style.display = '';
    }
  }

  // 3. Then: bind click handlers (after init state is set)
  document.querySelectorAll('.doc-nav-group-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.getElementById(this.dataset.target);
      var group  = this.closest('.doc-nav-group');

      // If clicking an already-open group, just close it
      if(!group.classList.contains('is-collapsed')){
        group.classList.add('is-collapsed');
        if(target) target.style.display = 'none';
        return;
      }

      // Otherwise: close all, then open clicked one
      document.querySelectorAll('.doc-nav-group').forEach(function(g){
        g.classList.add('is-collapsed');
        var l = g.querySelector('.doc-nav-list');
        if(l) l.style.display = 'none';
      });

      group.classList.remove('is-collapsed');
      if(target) target.style.display = '';
    });
  });

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
  var headings = articleBody.querySelectorAll('h2, h3, h4');
  var tocItems = [];

  if(headings.length > 1){
    headings.forEach(function(h, i){
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
        closeMobileToc();
      });

      li.appendChild(a);
      tocList.appendChild(li);
      tocItems.push({ el: h, link: a, li: li });
    });

    /* ── Active state: scroll-locked ── */
    var activeIdx = -1;
    var userScrolling = false;
    var scrollTimer = null;

    function setActive(idx){
      if(idx === activeIdx) return;
      if(activeIdx >= 0 && tocItems[activeIdx]){
        tocItems[activeIdx].li.classList.remove('is-active');
      }
      activeIdx = idx;
      if(idx >= 0 && tocItems[idx]){
        tocItems[idx].li.classList.add('is-active');
        // Only scroll the TOC panel, NEVER the page
        if(!userScrolling){
          var tocRect = tocContainer.getBoundingClientRect();
          var itemRect = tocItems[idx].li.getBoundingClientRect();
          if(itemRect.top < tocRect.top || itemRect.bottom > tocRect.bottom){
            tocItems[idx].li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }

    // Detect user scrolling to suppress observer-triggered scroll
    function onScrollStart(){
      userScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function(){
        userScrolling = false;
      }, 200);
    }
    window.addEventListener('scroll', onScrollStart, { passive: true });

    // Intersection Observer: only update highlight, never scroll the page
    var headingObserver = new IntersectionObserver(function(entries){
      // During user scroll, find the topmost visible heading
      if(userScrolling){
        var topmost = null;
        var topmostIdx = -1;
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var idx = tocItems.findIndex(function(t){ return t.el === entry.target; });
            if(idx !== -1){
              if(!topmost || entry.boundingClientRect.top < topmost.boundingClientRect.top){
                topmost = entry;
                topmostIdx = idx;
              }
            }
          }
        });
        if(topmostIdx !== -1){
          setActive(topmostIdx);
        }
        return;
      }
    }, {
      root: null,
      rootMargin: '-60px 0px -50% 0px',
      threshold: 0
    });

    headings.forEach(function(h){
      headingObserver.observe(h);
    });

    // On load: find the heading closest to viewport top without scrolling
    function findInitialActive(){
      var best = 0;
      var bestDist = Infinity;
      tocItems.forEach(function(item, i){
        var rect = item.el.getBoundingClientRect();
        var dist = Math.abs(rect.top - 100);
        if(rect.top <= 200 && dist < bestDist){
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }
    setActive(findInitialActive());

    // On hash change: update active if URL has #anchor
    if(window.location.hash){
      var hashIdx = tocItems.findIndex(function(t){
        return '#' + t.el.id === window.location.hash;
      });
      if(hashIdx !== -1){
        setActive(hashIdx);
      }
    }

  } else {
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