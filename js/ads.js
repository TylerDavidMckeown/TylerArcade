/**
 * TylerArcade site management script v3
 * - Applies TylerArcade branding consistently across every page
 * - Blocks deceptive popups (fake download/virus/winner modals)
 * - Repositions floating banner ads to page bottom
 * - NO window.open interception (preserves legitimate game functionality)
 */
(function() {
  'use strict';

  function applyBranding() {
    var brand = 'TylerArcade';
    var accentBrand = '<span class="logo-accent">Arcade</span>';

    // Replace visible header branding and remove the old logo artwork.
    document.querySelectorAll('.logo-text').forEach(function(el) {
      el.innerHTML = 'Tyler' + accentBrand;
    });
    document.querySelectorAll('.logo-img').forEach(function(el) {
      el.style.display = 'none';
      el.removeAttribute('src');
      el.alt = brand;
    });
    document.querySelectorAll('.slogan').forEach(function(el) {
      el.textContent = 'Play. Explore. Repeat.';
    });

    // Replace footer branding.
    document.querySelectorAll('.footer-bottom').forEach(function(el) {
      el.innerHTML = el.innerHTML.replace(/BiteArcade/gi, brand).replace(/Bite Arcade/gi, brand);
    });

    // Update document and social/search metadata.
    document.title = document.title.replace(/BiteArcade|Bite Arcade/gi, brand);
    document.querySelectorAll('meta[property="og:site_name"], meta[name="application-name"]').forEach(function(el) {
      el.setAttribute('content', brand);
    });
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(function(el) {
      el.setAttribute('content', el.getAttribute('content').replace(/BiteArcade|Bite Arcade/gi, brand));
    });
    document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"], meta[name="description"]').forEach(function(el) {
      el.setAttribute('content', el.getAttribute('content').replace(/BiteArcade|Bite Arcade/gi, brand));
    });

    // Remove old BiteArcade-specific network/social promotion rather than showing stale branding.
    document.querySelectorAll('.cross-site-banner').forEach(function(el) {
      el.style.display = 'none';
    });

    // Give the page a TylerArcade favicon without requiring a binary asset rename.
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) {
      icon.type = 'image/svg+xml';
      icon.href = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0a0a0a"/><path fill="#00ff88" d="M12 16h40v9H37v23h-10V25H12z"/><circle cx="49" cy="48" r="5" fill="#00ff88"/></svg>'
      );
    }
  }

  // Keywords that indicate a deceptive/ad popup
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

  // Ads load asynchronously; keep branding and ad handling resilient to late DOM changes.
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
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
})();
