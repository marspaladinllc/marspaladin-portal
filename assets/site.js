/* Shared language switcher for every marspaladin.com page.
 * A page sets window.PAGE_I18N = { en: {...}, zh: {...}, ... } before loading this file, then marks elements:
 *   data-i18n="key"          textContent from the current language (falls back to English)
 *   data-i18n-alt="key"      alt attribute
 *   data-href-<lang>="url"   per-language link (falls back to data-href-en)
 *   data-src-<lang>="url"    per-language image (falls back to data-src-en)
 *   data-keep-lang           internal link: ?lang=<current> is appended
 * The dropdown is built from SITE_LANGS, so a page only lists the languages it has text for in PAGE_I18N.
 */
(function () {
  var SITE_LANGS = [
    { code: 'en', flag: '🇺🇸', name: 'English', html: 'en' },
    { code: 'zh', flag: '🇨🇳', name: '简体中文', html: 'zh-CN' },
    { code: 'tc', flag: '🇭🇰', name: '繁體中文', html: 'zh-TW' },
    { code: 'ja', flag: '🇯🇵', name: '日本語', html: 'ja' },
    { code: 'ko', flag: '🇰🇷', name: '한국어', html: 'ko' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский', html: 'ru' }
  ];
  var dict = window.PAGE_I18N || { en: {} };
  var langs = SITE_LANGS.filter(function (l) { return dict[l.code]; });
  var current = 'en';

  function pick(el, attr, lang) {
    return el.getAttribute(attr + lang) || el.getAttribute(attr + 'en');
  }

  function setLang(code) {
    if (!dict[code]) code = 'en';
    current = code;
    var meta = langs.filter(function (l) { return l.code === code; })[0] || langs[0];
    var t = dict[code], en = dict.en;
    document.documentElement.setAttribute('lang', meta.html);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = t[k] != null ? t[k] : en[k];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-alt');
      var v = t[k] != null ? t[k] : en[k];
      if (v != null) el.setAttribute('alt', v);
    });
    document.querySelectorAll('[data-href-en]').forEach(function (el) { el.href = pick(el, 'data-href-', code); });
    document.querySelectorAll('[data-src-en]').forEach(function (el) { el.src = pick(el, 'data-src-', code); });
    document.querySelectorAll('[data-keep-lang]').forEach(function (el) {
      var base = el.getAttribute('data-base') || el.getAttribute('href').split('?')[0];
      el.setAttribute('data-base', base);
      el.setAttribute('href', base + (code === 'en' ? '' : '?lang=' + code));
    });
    if (t.pageTitle || en.pageTitle) document.title = t.pageTitle || en.pageTitle;
    var flag = document.getElementById('currentFlag'), name = document.getElementById('currentLangName');
    if (flag) flag.textContent = meta.flag;
    if (name) name.textContent = meta.name;
    document.querySelectorAll('.lang-item').forEach(function (it) {
      it.classList.toggle('active', it.getAttribute('data-lang') === code);
    });
    var menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('show');
    try { history.replaceState(null, '', location.pathname + (code === 'en' ? '' : '?lang=' + code) + location.hash); } catch (e) {}
  }

  function detect() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && dict[q]) return q;
    var nav = (navigator.language || '').toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(nav)) return dict.tc ? 'tc' : 'zh';
    var two = nav.slice(0, 2);
    return dict[two] ? two : 'en';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langBtn');
    if (menu && btn) {
      langs.forEach(function (l) {
        var d = document.createElement('div');
        d.className = 'lang-item';
        d.setAttribute('data-lang', l.code);
        d.textContent = l.flag + ' ' + l.name;
        d.addEventListener('click', function () { setLang(l.code); });
        menu.appendChild(d);
      });
      btn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('show'); });
      document.addEventListener('click', function () { menu.classList.remove('show'); });
    }
    // Click-to-play YouTube: no third-party request until the visitor asks for the video.
    document.querySelectorAll('.yt-poster').forEach(function (p) {
      p.addEventListener('click', function () {
        var id = pick(p, 'data-yt-', current);
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        f.title = p.getAttribute('aria-label') || 'Trailer';
        p.replaceWith(f);
      });
    });
    // Screenshot lightbox
    var lb = document.querySelector('.lightbox');
    if (lb) {
      var big = lb.querySelector('img');
      document.querySelectorAll('.shots-grid img').forEach(function (img) {
        img.addEventListener('click', function () { big.src = img.src; lb.classList.add('show'); });
      });
      lb.addEventListener('click', function () { lb.classList.remove('show'); });
    }
    setLang(detect());
  });

  window.setLang = setLang;
})();
