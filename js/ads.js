/**
 * TylerArcade site management script v6
 * Applies TylerArcade branding, fixes game routes, and manages ads.
 */
(function() {
  'use strict';

  function replaceBrand(value) {
    if (!value) return value;
    return value
      .replace(/BiteArcade/gi, 'TylerArcade')
      .replace(/Bite Arcade/gi, 'TylerArcade')
      .replace(/https?:\/\/bite-arcade\.com/gi, window.location.origin)
      .replace(/bite-arcade\.com/gi, window.location.host)
      .replace(/bitearcade/gi, 'tylerarcade');
  }

  function applyBranding() {
    var brand = 'TylerArcade';
    var accentBrand = '<span class="logo-accent">Arcade</span>';

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
    document.querySelectorAll('.footer-bottom').forEach(function(el) {
      el.innerHTML = replaceBrand(el.innerHTML);
    });

    document.title = replaceBrand(document.title);
    document.querySelectorAll('meta').forEach(function(el) {
      var content = el.getAttribute('content');
      if (content && /BiteArcade|Bite Arcade|bite-arcade\.com|bitearcade/i.test(content)) {
        el.setAttribute('content', replaceBrand(content));
      }
    });
    document.querySelectorAll('link[rel="canonical"], link[rel="preload"][href*="bite-arcade"]').forEach(function(el) {
      el.remove();
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(el) {
      try {
        var json = JSON.parse(el.textContent);
        el.textContent = JSON.stringify(json, function(key, value) {
          return typeof value === 'string' ? replaceBrand(value) : value;
        });
      } catch (e) {
        el.textContent = replaceBrand(el.textContent);
      }
    });

    document.querySelectorAll('.cross-site-banner').forEach(function(el) {
      el.style.display = 'none';
    });

    var icon = document.querySelector('link[rel="icon"]');
    if (icon) {
      icon.type = 'image/svg+xml';
      icon.href = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0a0a0a"/><path fill="#00ff88" d="M12 16h40v9H37v23H27V25H12z"/><circle cx="49" cy="48" r="5" fill="#00ff88"/></svg>'
      );
    }
  }

  // The catalog contains /play/<slug> routes, but this is a static site and those
  // directories do not exist. Keep the public TylerArcade URL and open the real
  // iDev.Games embed instead, so every game remains playable without a 404.
  function getGameSlug(href) {
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return '';
      var match = url.pathname.match(/^\/play\/([^/]+)\/?$/i);
      return match ? decodeURIComponent(match[1]) : '';
    } catch (e) {
      return '';
    }
  }

  function openGame(slug) {
    if (!slug) return false;
    var overlay = document.createElement('div');
    overlay.id = 'tylerarcade-game-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#050505;z-index:2147483646;display:flex;flex-direction:column;';

    var bar = document.createElement('div');
    bar.style.cssText = 'height:56px;min-height:56px;background:#111;border-bottom:2px solid #00ff88;display:flex;align-items:center;justify-content:space-between;padding:0 14px;box-sizing:border-box;';

    var label = document.createElement('strong');
    label.textContent = 'TylerArcade';
    label.style.cssText = 'color:#f0f0f0;font:800 20px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = '✕ Close game';
    close.setAttribute('aria-label', 'Close game');
    close.style.cssText = 'background:#00ff88;color:#000;border:0;border-radius:7px;padding:9px 13px;font-weight:700;cursor:pointer;';

    var frame = document.createElement('iframe');
    frame.src = 'https://idev.games/embed/' + encodeURIComponent(slug);
    frame.title = slug.replace(/[-_]+/g, ' ') + ' — TylerArcade';
    frame.allow = 'autoplay; fullscreen; gamepad; microphone; camera; clipboard-read; clipboard-write';
    frame.allowFullscreen = true;
    frame.style.cssText = 'display:block;flex:1;width:100%;height:100%;border:0;background:#000;';

    close.addEventListener('click', function() { overlay.remove(); document.body.style.overflow = ''; });
    overlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') close.click(); });
    bar.appendChild(label);
    bar.appendChild(close);
    overlay.appendChild(bar);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    close.focus();
    return true;
  }

  function installGameRouting() {
    document.addEventListener('click', function(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest ? event.target.closest('a[href]') : null;
      if (!link) return;
      var slug = getGameSlug(link.href);
      if (!slug) return;
      event.preventDefault();
      openGame(slug);
    }, false);
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
      var isCentered = (top === '50%' && left === '50%') || /translate\(-50%,\s*-50%\)|translate\(-50%\)/.test(transform);

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
    installGameRouting();
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
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
})();
