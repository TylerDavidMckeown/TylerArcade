/**
 * TylerArcade site management script
 * Keeps the original Tiny Arcade links/routes while applying TylerArcade branding.
 * Ad behavior remains unchanged from the original site script.
 */
(function() {
  'use strict';

  function applyBranding() {
    var brand = 'TylerArcade';
    var accentBrand = '<span class="logo-accent">Arcade</span>';

    document.querySelectorAll('.logo-text').forEach(function(el) {
      el.innerHTML = 'Tyler' + accentBrand;
    });

    document.querySelectorAll('.slogan').forEach(function(el) {
      el.textContent = 'Play. Explore. Repeat.';
    });

    document.querySelectorAll('.footer-bottom').forEach(function(el) {
      el.innerHTML = el.innerHTML
        .replace(/BiteArcade/gi, brand)
        .replace(/Bite Arcade/gi, brand);
    });

    document.title = document.title
      .replace(/BiteArcade/gi, brand)
      .replace(/Bite Arcade/gi, brand);

    document.querySelectorAll('meta').forEach(function(el) {
      var content = el.getAttribute('content');
      if (content && /BiteArcade|Bite Arcade/i.test(content)) {
        el.setAttribute('content', content
          .replace(/BiteArcade/gi, brand)
          .replace(/Bite Arcade/gi, brand));
      }
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(el) {
      try {
        var json = JSON.parse(el.textContent);
        el.textContent = JSON.stringify(json, function(key, value) {
          return typeof value === 'string'
            ? value.replace(/BiteArcade/gi, brand).replace(/Bite Arcade/gi, brand)
            : value;
        });
      } catch (e) {
        el.textContent = el.textContent
          .replace(/BiteArcade/gi, brand)
          .replace(/Bite Arcade/gi, brand);
      }
    });
  }

  var DECEPTIVE_KEYWORDS = /download|tap.*proceed|click.*continue|ready|virus|scan|warning|your.*phone|install|free.*gift|winner|congratulations|subscribe|notification|claim.*prize|you.*won|selected.*reward/i;
  var DECEPTIVE_IMAGES = /btn_download|btn_install|cta_button|download_now|get_it_now|install_now|claim_reward/i;

  function isDeceptive(el) {
    var text = (el.innerText || el.textContent || '').slice(0, 300);
    if (DECEPTIVE_KEYWORDS.test(text)) return true;

    var imgs = el.querySelectorAll('img');
    for (var j = 0; j < imgs.length; j++) {
      var src = (imgs[j].src || '') + (imgs[j].alt || '');
      if (DECEPTIVE_IMAGES.test(src)) return true;
    }

    return false;
  }

  function handleAds() {
    var els = document.querySelectorAll('div, iframe, ins, a, span');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var style = window.getComputedStyle(el);
      if (style.position !== 'fixed') continue;
      var z = parseInt(style.zIndex) || 0;
      if (z < 9999) continue;

      var top = style.top;
      var left = style.left;
      var transform = style.transform;
      var isCentered = (top === '50%' && left === '50%') ||
        /translate\(-50%,\s*-50%\)|translate\(-50%\)/.test(transform);

      if (isCentered && z >= 20000) {
        el.style.setProperty('display', 'none', 'important');
        continue;
      }

      if (isDeceptive(el)) {
        el.style.setProperty('display', 'none', 'important');
        continue;
      }

      el.style.setProperty('top', 'auto', 'important');
      el.style.setProperty('bottom', '0', 'important');
      el.style.setProperty('inset', 'auto 0 0 0', 'important');
      el.style.setProperty('translate', 'none', 'important');
      el.style.setProperty('transform', 'none', 'important');
    }
  }

  function run() {
    applyBranding();
    handleAds();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  var intervalCount = 0;
  var intervalId = setInterval(function() {
    applyBranding();
    handleAds();
    intervalCount++;
    if (intervalCount >= 5) clearInterval(intervalId);
  }, 2000);

  if (window.MutationObserver) {
    var debounceTimer = null;
    var observer = new MutationObserver(function() {
      if (debounceTimer) return;
      debounceTimer = setTimeout(function() {
        applyBranding();
        handleAds();
        debounceTimer = null;
      }, 300);
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
})();
