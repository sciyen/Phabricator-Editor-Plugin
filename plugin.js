javascript: (function () {
  'use strict';
  var PLUGIN_VERSION = 'v2.1';
  if (document.getElementById('_PHE_TB')) { alert('Already active!'); return; }

  var $ = {
    active: false, lpct: 50, drag: false, mergeBase: '',
    remarkEl: null, previewEl: null, isMulti: false, backdrop: null, syncer: null,
    activeTA: null, savedScrollY: 0, syntaxEnabled: true
  };
  var PAGE = window.location.href;

  var _c = (getComputedStyle(document.body).backgroundColor.match(/\d+/g) || [255, 255, 255]);
  var LIGHT = ((+_c[0] * 299 + +_c[1] * 587 + +_c[2] * 114) / 1000) > 155;
  var BG = LIGHT ? '#fff' : '#1e2333', BG2 = LIGHT ? '#f8f9fa' : '#242938';
  var TB = LIGHT ? '#1a2332' : '#161b2e', TEXT = LIGHT ? '#24292e' : '#cdd9e5';
  var BORDER = LIGHT ? '#e1e4e8' : '#3a3f52', DVBG = LIGHT ? '#c8cdd6' : '#3e4457';
  var MMLINE = LIGHT ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.2)';
  var MMHOV = LIGHT ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.45)';
  var MMACT = '#3498db';
  var MMTIPBG = LIGHT ? 'rgb(230, 230, 230)' : 'rgba(255,255,255,.1)';
  var MMTIPCOL = LIGHT ? '#24292e' : '#cdd9e5';
  var MMARROW = LIGHT ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)';
  var MMARROWHOV = LIGHT ? 'rgba(0,0,0,.65)' : 'rgba(255,255,255,.65)';

  (function () {
    var s = document.createElement('style'); s.id = '_PHE_CSS';
    s.textContent = `
#_PHE_TB{position:fixed;inset:0 0 auto 0;height:44px;background:${TB};color:#dfe6e9;
  display:flex;align-items:center;padding:0 12px;gap:6px;z-index:999999;
  font:13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  box-shadow:0 2px 10px rgba(0,0,0,.4);}
#_PHE_TB .logo{font-size:14px;font-weight:700;color:#5dade2;margin-right:4px;white-space:nowrap;}
#_PHE_TB .sep{width:1px;height:22px;background:rgba(255,255,255,.13);margin:0 2px;flex-shrink:0;}
#_PHE_TB .sp{flex:1;}
.ph-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);
  color:#dfe6e9;padding:4px 10px;border-radius:5px;cursor:pointer;
  font:12px/1 inherit;white-space:nowrap;transition:background .12s;flex-shrink:0;}
.ph-btn:hover{background:rgba(255,255,255,.16);}
.ph-btn.on{background:#2980b9;border-color:#2980b9;}
.ph-btn.save{background:#27ae60;border-color:#27ae60;}
.ph-btn.save:hover{background:#2ecc71;border-color:#2ecc71;}
.ph-btn.save[disabled]{background:#555;border-color:#555;color:#999;cursor:not-allowed;opacity:.6;}
.ph-btn.save[disabled]:hover{background:#555;border-color:#555;}
.ph-btn.cancel{background:rgba(231,76,60,.7);border-color:rgba(231,76,60,.8);}
.ph-btn.cancel:hover{background:rgba(231,76,60,.9);}
#_PHE_DIV{cursor:col-resize;transition:background .15s;user-select:none;display:none;}
#_PHE_DIV:hover,#_PHE_DIV.drag{background:#3498db!important;}
#_PHE_DIV::after{content:'';display:block;position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);width:3px;height:36px;border-radius:2px;background:rgba(255,255,255,.5);}
.phe-bd{position:absolute!important;inset:0!important;box-sizing:border-box!important;
  white-space:pre-wrap!important;word-wrap:break-word!important;color:transparent!important;
  pointer-events:none!important;
  z-index:1!important;overflow:hidden!important;}
.phe-bd marker{color:transparent;}
.phe-bd marker.bold{font-weight:bold;color:${TEXT};}
.phe-bd marker.lb::after{content:'';width:100%;position:absolute;left:0;}
.phe-bd marker.h1::after{height:26px;background:${LIGHT ? '#B5C0D0' : '#E2BBE9'};}
.phe-bd marker.h2::after{height:18px;background:${LIGHT ? '#CCD3CA' : '#9B86BD'};}
.phe-bd marker.h3::after{height:10px;background:${LIGHT ? '#F5E8DD' : '#7776B3'};}
.phe-bd marker.h4::after{height:10px;background:${LIGHT ? '#EED3D9' : '#5A639C'};}
.phe-bd marker.h5::after{height:10px;background:${LIGHT ? '#EED3D9' : '#5A639C'};}
.phe-bd marker.h6::after{height:10px;background:${LIGHT ? '#EED3D9' : '#5A639C'};}
.phe-bd marker.dash::after{content:'';position:absolute;margin-top:.5em;margin-left:-1.5em;
  width:1em;height:.5em;border-radius:20%;background:${LIGHT ? '#B1AFFF' : '#50727B'};}
.phe-bd marker.num{border-top-right-radius:50%;border-bottom-right-radius:50%;
  background:${LIGHT ? '#BBE9FF' : '#78A083'};}
.phe-bd marker.rect{background:${LIGHT ? '#ecdff1' : '#622f78'};}
.phe-bd marker.bord{background:transparent;box-shadow:${LIGHT ? '#1679AB' : '#B25068'} 0 0 1px 1px;}
.phe-bd marker.italic{font-style:italic;color:${TEXT};}
.phe-bd marker.mono{background:${LIGHT ? '#e8eaed' : '#2a3040'};border-radius:3px;}
.phe-bd marker.strike{text-decoration:line-through;color:${TEXT};opacity:.6;}
.phe-bd marker.uline{text-decoration:underline;color:${TEXT};}
.phe-bd marker.quote{background:${LIGHT ? '#e3f2fd' : '#1a2a3a'};}
.phe-bd marker.divider::after{height:2px;background:${LIGHT ? '#bbb' : '#555'};}
.phe-bd marker.mention{color:${LIGHT ? '#1565c0' : '#5dade2'};background:${LIGHT ? '#a9a6a755' : '#e6e6e655'};border-radius:2px;}
.phe-bd marker.hashtag{color:${LIGHT ? '#6a1b9a' : '#bb86fc'};}
.phe-bd marker.objref{background:${LIGHT ? '#a9a6a755' : '#e6e6e655'};border-radius:2px;}
.phe-bd marker.link{color:${LIGHT ? '#0277bd' : '#4fc3f7'};text-decoration:underline;text-underline-offset:2px;}
.phe-bd marker.codefence{background:${LIGHT ? '#e8eaed' : '#2a3040'};}
.phe-bd marker.callout-note{background:${LIGHT ? '#fff9c4' : '#3e3a20'};}
.phe-bd marker.callout-warn{background:${LIGHT ? '#ffe0b2' : '#3e2e1a'};}
.phe-bd marker.callout-imp{background:${LIGHT ? '#ffcdd2' : '#3e1a1a'};}
a.phabricator-remarkup-embed-image img{background:white;}
#_PHE_FB{position:fixed;bottom:0;left:0;z-index:999999;background:${BG};
  border:1px solid ${BORDER};border-radius:8px 8px 0 0;padding:8px 12px;gap:5px;
  display:none;flex-direction:column;min-width:340px;box-shadow:0 -3px 10px rgba(0,0,0,.2);}
#_PHE_FB.open{display:flex;}
#_PHE_FB .fb-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
#_PHE_FB input[type=text]{padding:3px 8px;border:1px solid ${BORDER};border-radius:4px;
  font-size:12px;width:145px;background:${BG2};color:${TEXT};}
#_PHE_FB .fb-btn{padding:3px 8px;border-radius:4px;border:1px solid ${BORDER};
  background:${BG2};color:${TEXT};cursor:pointer;font-size:11px;}
#_PHE_FB label{font-size:11px;display:flex;align-items:center;gap:3px;color:${TEXT};}
#_PHE_FC{font-size:11px;opacity:.6;min-width:44px;color:${TEXT};}
#_PHE_TBLBTN{position:fixed;z-index:999999;display:none;padding:4px 11px;border:none;
  border-radius:6px;background:#2980b9;color:#fff;cursor:pointer;font-size:12px;}
#_PHE_TBLMOD{position:fixed;top:10%;left:50%;transform:translateX(-50%);width:82%;
  max-height:80%;z-index:999999;background:${BG};border:1px solid ${BORDER};
  border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.35);overflow:auto;display:none;padding:12px;}
#_PHE_TBLMOD .tm-header{display:flex;align-items:center;justify-content:space-between;
  padding:0 0 10px;margin-bottom:10px;border-bottom:1px solid ${BORDER};}
#_PHE_TBLMOD .tm-title{font-size:14px;font-weight:600;color:${TEXT};}
#_PHE_TBLMOD .tm-info{font-size:11px;opacity:.6;color:${TEXT};margin-left:8px;}
#_PHE_TBLMOD .tm-header-actions{display:flex;gap:6px;}
#_PHE_TBLMOD table{border-collapse:collapse;table-layout:fixed;width:100%;}
#_PHE_TBLMOD td{border:1px solid ${BORDER};padding:0;min-width:60px;vertical-align:top;}
#_PHE_TBLMOD td textarea{width:100%;box-sizing:border-box;padding:4px 8px;border:none;outline:none;
  resize:none;background:transparent;color:${TEXT};font-size:13px;overflow:hidden;}
#_PHE_TBLMOD tr.phe-tbl-hdr td{background:${LIGHT ? '#e8eaed' : '#2a3040'};}
#_PHE_TBLMOD tr.phe-tbl-hdr td textarea{font-weight:600;}
#_PHE_TBLMOD .tm-del-col{cursor:pointer;opacity:.3;font-size:10px;text-align:center;
  padding:2px 0;color:${TEXT};transition:opacity .15s;}
#_PHE_TBLMOD .tm-del-col:hover{opacity:1;color:#e74c3c;}
#_PHE_TBLMOD .tm-del-row{cursor:pointer;opacity:.3;font-size:10px;text-align:center;
  padding:0 4px;color:${TEXT};transition:opacity .15s;border:1px solid ${BORDER};
  vertical-align:middle;min-width:auto;width:22px;}
#_PHE_TBLMOD .tm-del-row:hover{opacity:1;color:#e74c3c;}
#_PHE_TBLMOD .tm-btns{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;}
.phui-timeline-extra .block-id{margin-left:5px;border:1px solid #888;border-radius:3px;font-size:11px;padding:1px 4px;cursor:pointer;}
.phui-timeline-extra .block-id.show-copied{background:#27ae60;color:#fff;border-color:#27ae60;}
.phe-offscreen{position:fixed!important;top:200vh!important;}
#_PHE_MM{
  position:fixed;z-index:999998;display:none;
  flex-direction:column;align-items:center;
  gap:7px;width:28px;
}
#_PHE_MM.visible{display:flex;}
.phe-mm-arrow{
  width:28px;height:20px;
  display:flex;align-items:center;justify-content:flex-end;
  cursor:pointer;flex-shrink:0;
}
.phe-mm-arrow svg{width:12px;height:12px;display:block;overflow:visible;}
.phe-mm-arrow svg polyline{
  stroke:${MMARROW};stroke-width:1.5;fill:none;
  stroke-linecap:round;stroke-linejoin:round;
  transition:stroke-width .15s,stroke .15s;
}
.phe-mm-arrow:hover svg polyline{stroke-width:3;stroke:${MMARROWHOV};}
.phe-mm-lines{display:flex;flex-direction:column;align-items:flex-end;gap:0;width:36px;}
.phe-mm-item{
  height:4px;border-radius:20px;background:${MMLINE};
  cursor:pointer;flex-shrink:0;
  padding:4px;
  background-clip:content-box;
  transform-origin:right center;
  transition:transform .18s ease,background-color .15s;
}
.phe-mm-item:hover{transform:scaleX(1.5) scaleY(1.6);background:${MMHOV};background-clip:content-box;}
.phe-mm-item.h1{width:28px;}
.phe-mm-item.h2{width:20px;}
.phe-mm-item.h3,.phe-mm-item.h4,.phe-mm-item.h5,.phe-mm-item.h6{width:13px;}
.phe-mm-item.active{background:${MMACT};background-clip:content-box;}
.phe-mm-item.active:hover{background:${MMACT};background-clip:content-box;}
.phe-mm-item.marked{background:#e74c3c;background-clip:content-box;}
.phe-mm-item.marked:hover{background:#c0392b;background-clip:content-box;}
.phe-mm-item.comment{width:20px;}
#_PHE_MM_TIP{
  position:fixed;z-index:9999999;pointer-events:none;
  background:${MMTIPBG};border-radius:5px;
  padding:3px 9px;font-size:11.5px;color:${MMTIPCOL};
  white-space:nowrap;opacity:0;transition:opacity .15s;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}`;
    document.head.appendChild(s);
  })();

  /* ────────────────── PHABRICATOR HELPERS ────────────────── */
  function getTA() {
    if ($.activeTA) return $.activeTA;
    return document.querySelector('textarea[name="text"]') ||
      document.querySelector('textarea.remarkup-assist-textarea') ||
      document.querySelector('textarea');
  }
  function getPreviewEl(multi) {
    if (!multi) {
      var c1 = document.querySelector('.phui-comment-preview-view div.phui-timeline-view');
      if (c1) return c1;
      var c2 = document.querySelector('.phui-remarkup-preview');
      if (c2) return c2;
    }
    var btns = document.querySelectorAll('div.fa-eye'); if (!btns.length) return null;
    var btn = btns[btns.length - 1].parentElement;
    if (!btn.classList.contains('preview-active')) btn.click();
    return document.querySelector('.remarkup-inline-preview') || null;
  }
  function setPreview(on) {
    var btns = document.querySelectorAll('div.fa-eye'); if (!btns.length) return;
    var btn = btns[btns.length - 1].parentElement;
    if (on !== btn.classList.contains('preview-active')) btn.click();
  }
  function hideDialog(hide) {
    var mask = document.querySelector('.jx-mask');
    var dlg = document.querySelector('.jx-client-dialog');
    if (mask) mask.style.display = hide ? 'none' : '';
    if (dlg) dlg.classList.toggle('phe-offscreen', hide);
  }

  /* ────────────────── LAYOUT ────────────────── */
  var _half = false;
  function paneTop() { return _half ? Math.round(window.innerHeight * .5) : 44; }
  function applyLeft(container) {
    var pt = paneTop();
    container.setAttribute('style',
      'position:fixed!important;top:' + pt + 'px!important;bottom:0!important;left:0!important;' +
      'width:' + $.lpct + '%!important;z-index:9990!important;background:' + BG + '!important;' +
      'display:flex!important;flex-direction:column!important;overflow:hidden!important;box-sizing:border-box!important;');
    var bar = container.querySelector('.remarkup-assist-bar');
    if (bar) bar.style.cssText = 'flex-shrink:0!important;position:relative!important;z-index:100!important;background:' + BG + '!important;pointer-events:auto!important;';
    var ta = container.querySelector('textarea'); if (!ta) return;
    var node = ta.parentElement;
    while (node && node !== container) {
      node.style.cssText = 'flex:1!important;min-height:0!important;display:flex!important;flex-direction:column!important;position:relative!important;overflow:hidden!important;';
      node = node.parentElement;
    }
    Object.assign(ta.style, {
      flex: '1', minHeight: '0', width: '100%', boxSizing: 'border-box',
      resize: 'none', border: 'none', outline: 'none', padding: '18px 20px', background: 'transparent',
      position: 'relative', zIndex: '2', overflowY: 'auto', display: 'block'
    });
  }
  function applyRight(preview) {
    var pt = paneTop();
    preview.setAttribute('style',
      'position:fixed!important;top:' + pt + 'px!important;bottom:0!important;' +
      'left:' + $.lpct + '%!important;width:' + (100 - $.lpct) + '%!important;z-index:9990!important;' +
      'background:' + BG2 + '!important;overflow-y:auto!important;' +
      'padding:18px 24px!important;box-sizing:border-box!important;color:' + TEXT + '!important;');
  }
  function applyDivider() {
    var pt = paneTop();
    DIV.setAttribute('style',
      'position:fixed;top:' + pt + 'px;bottom:0;left:' + $.lpct + '%;transform:translateX(-50%);' +
      'width:7px;z-index:999998;background:' + DVBG + ';display:block;');
  }
  function updateSplit(pct) {
    $.lpct = Math.max(15, Math.min(85, pct));
    if ($.active) {
      if ($.remarkEl) applyLeft($.remarkEl);
      if ($.previewEl) applyRight($.previewEl);
      applyDivider();
      positionMinimap();
    }
  }
  window.addEventListener('resize', function () {
    if (!$.active) return;
    if ($.remarkEl) applyLeft($.remarkEl);
    if ($.previewEl) applyRight($.previewEl);
    applyDivider();
    positionMinimap();
  });

  /* ════════════════════════════════════════════════════════════
     SCROLL SYNC — simple ratio (indirect preview reference)
     ════════════════════════════════════════════════════════════ */
  function ScrollSyncer(ta) {
    var self = this;
    var editorDriving = false, previewDriving = false;
    var edLock = null, pvLock = null;
    var LOCK_MS = 80;
    function pv() { return $.previewEl; }
    ta.addEventListener('scroll', function () {
      var p = pv(); if (!p || previewDriving) return;
      editorDriving = true; clearTimeout(edLock);
      edLock = setTimeout(function () { editorDriving = false; }, LOCK_MS);
      var r = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight);
      p.scrollTop = r * (p.scrollHeight - p.clientHeight);
    });
    /* Use capture-phase listener on document so it works regardless of which
       DOM node is the current preview (survives Phabricator DOM replacement). */
    function onPreviewScroll(e) {
      var p = pv(); if (!p || e.target !== p || editorDriving) return;
      previewDriving = true; clearTimeout(pvLock);
      pvLock = setTimeout(function () { previewDriving = false; }, LOCK_MS);
      var r = p.scrollTop / Math.max(1, p.scrollHeight - p.clientHeight);
      ta.scrollTop = r * (ta.scrollHeight - ta.clientHeight);
    }
    document.addEventListener('scroll', onPreviewScroll, true);
    self.invalidate = function () { };
    self.destroy = function () {
      clearTimeout(edLock); clearTimeout(pvLock);
      document.removeEventListener('scroll', onPreviewScroll, true);
    };
  }

  /* ════════════════════════════════════════════════════════════
     MINIMAP TOC
     ════════════════════════════════════════════════════════════ */
  var MM = document.createElement('div'); MM.id = '_PHE_MM';
  var MM_TIP = document.createElement('div'); MM_TIP.id = '_PHE_MM_TIP';
  document.body.appendChild(MM_TIP);

  (function () {
    var ns = 'http://www.w3.org/2000/svg';
    function mkArrow(up) {
      var btn = document.createElement('div'); btn.className = 'phe-mm-arrow';
      var svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 12 12');
      var pl = document.createElementNS(ns, 'polyline');
      pl.setAttribute('points', up ? '2,8 6,4 10,8' : '2,4 6,8 10,4');
      svg.appendChild(pl); btn.appendChild(svg); return btn;
    }
    MM._up = mkArrow(true);
    MM._dn = mkArrow(false);
    MM._lines = document.createElement('div'); MM._lines.className = 'phe-mm-lines';
    MM.appendChild(MM._up); MM.appendChild(MM._lines); MM.appendChild(MM._dn);
    document.body.appendChild(MM);
  })();

  var _mmItems = [], _mmHeadings = [], _mmRebuildTimer = null, _mmMO = null;

  /* ── Position: fixed right=12px, vertically centered ── */
  function positionMinimap() {
    MM.style.right = '12px';
    MM.style.top = '50vh';
    MM.style.transform = 'translateY(-50%)';
  }

  /* Truncate to N chars with ellipsis */
  function truncTip(s, n) { s = (s || '').trim(); return s.length > n ? s.substring(0, n) + '…' : s; }

  /* Shared minimap item builder: attaches hover tooltip + right-click mark toggle */
  function mkMmItem(cls, label, scrollFn) {
    var item = document.createElement('div');
    item.className = 'phe-mm-item ' + cls;
    item.addEventListener('mouseenter', function () {
      var r = item.getBoundingClientRect();
      MM_TIP.textContent = truncTip(label, 20);
      MM_TIP.style.top = (r.top + r.height / 2) + 'px';
      MM_TIP.style.right = (window.innerWidth - r.left + 8) + 'px';
      MM_TIP.style.transform = 'translateY(-50%)';
      MM_TIP.style.opacity = '1';
    });
    item.addEventListener('mouseleave', function () { MM_TIP.style.opacity = '0'; });
    item.addEventListener('click', scrollFn);
    item.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      item.classList.toggle('marked');
    });
    return item;
  }

  function rebuildMinimap() {
    MM._lines.innerHTML = ''; _mmItems = []; _mmHeadings = [];
    if ($.active && $.previewEl) {
      /* Edit mode: headings from preview pane */
      var hs = Array.from($.previewEl.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      hs.forEach(function (h) {
        var label = (h.textContent || '').split('\n')[0];
        var item = mkMmItem(h.tagName.toLowerCase(), label, function () {
          $.previewEl.scrollTo({ top: Math.max(0, h.offsetTop - 20), behavior: 'smooth' });
        });
        MM._lines.appendChild(item);
        _mmItems.push(item); _mmHeadings.push(h);
      });
    } else {
      /* Page mode: headings from description + comments from timeline */
      var descEl = document.querySelector('.phui-property-list-section .phabricator-remarkup, .phui-document-view .phabricator-remarkup');
      if (descEl) {
        var dhs = Array.from(descEl.querySelectorAll('h1,h2,h3,h4,h5,h6'));
        dhs.forEach(function (h) {
          var label = (h.textContent || '').split('\n')[0];
          var item = mkMmItem(h.tagName.toLowerCase(), label, function () {
            h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
          MM._lines.appendChild(item);
          _mmItems.push(item); _mmHeadings.push(h);
        });
      }
      /* Comments from timeline */
      var events = Array.from(document.querySelectorAll('.phui-timeline-event-view'));
      events.forEach(function (ev) {
        var remarkup = ev.querySelector('.phui-timeline-core-content .phabricator-remarkup');
        if (!remarkup) return;
        var firstLine = (remarkup.textContent || '').trim().split('\n')[0];
        var block = ev;
        var item = mkMmItem('comment', firstLine, function () {
          block.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        MM._lines.appendChild(item);
        _mmItems.push(item); _mmHeadings.push(block);
      });
    }
    updateMinimapActive();
  }

  function updateMinimapActive() {
    if (!_mmHeadings.length) return;
    var active = 0;
    if ($.active && $.previewEl) {
      var st = $.previewEl.scrollTop + 60;
      _mmHeadings.forEach(function (h, i) { if (h.offsetTop <= st) active = i; });
    } else {
      var st = window.scrollY + 60;
      _mmHeadings.forEach(function (h, i) {
        var top = h.getBoundingClientRect().top + window.scrollY;
        if (top <= st) active = i;
      });
    }
    _mmItems.forEach(function (it, i) { it.classList.toggle('active', i === active); });
  }

  function schedRebuild(d) { clearTimeout(_mmRebuildTimer); _mmRebuildTimer = setTimeout(rebuildMinimap, d || 400); }

  function startMinimap() {
    /* Position first, then show; rAF ensures layout is applied */
    positionMinimap();
    requestAnimationFrame(function () {
      MM.classList.add('visible');
      schedRebuild(300);
    });
    if ($.active && $.previewEl) {
      MM._up.onclick = function () { $.previewEl.scrollTo({ top: 0, behavior: 'smooth' }); };
      MM._dn.onclick = function () { $.previewEl.scrollTo({ top: $.previewEl.scrollHeight, behavior: 'smooth' }); };
      $.previewEl.addEventListener('scroll', updateMinimapActive);
      _mmMO = new MutationObserver(function () { schedRebuild(250); });
      _mmMO.observe($.previewEl, { childList: true, subtree: true });
    } else {
      MM._up.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
      MM._dn.onclick = function () { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); };
      window.addEventListener('scroll', updateMinimapActive);
    }
  }

  function stopMinimap() {
    MM.classList.remove('visible');
    MM_TIP.style.opacity = '0';
    MM._lines.innerHTML = '';
    _mmItems = []; _mmHeadings = [];
    if ($.previewEl) $.previewEl.removeEventListener('scroll', updateMinimapActive);
    window.removeEventListener('scroll', updateMinimapActive);
    if (_mmMO) { _mmMO.disconnect(); _mmMO = null; }
    clearTimeout(_mmRebuildTimer);
  }

  /* ════════════════════════════════════════════════════════════
     AUTOMERGE
     ════════════════════════════════════════════════════════════ */
  function computeLCS(a, b) {
    var m = a.length, n = b.length;
    if (m * n > 640000) return lcsHash(a, b);
    var dp = []; for (var i = 0; i <= m; i++)dp[i] = new Int32Array(n + 1);
    for (var i = 1; i <= m; i++)for (var j = 1; j <= n; j++)dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    var res = [], i = m, j = n;
    while (i > 0 && j > 0) { if (a[i - 1] === b[j - 1]) { res.unshift([i - 1, j - 1]); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
    return res;
  }
  function lcsHash(a, b) { var map = {}; b.forEach(function (l, j) { if (!map[l]) map[l] = []; map[l].push(j); }); var res = [], last = -1; a.forEach(function (l, i) { var pos = map[l]; if (!pos) return; for (var k = 0; k < pos.length; k++)if (pos[k] > last) { res.push([i, pos[k]]); last = pos[k]; break; } }); return res; }
  function toHunks(aL, bL, matches) { var h = [], ai = 0, bi = 0, mi = 0; while (ai < aL.length || bi < bL.length) { var nm = mi < matches.length ? matches[mi] : null; var na = nm ? nm[0] : aL.length, nb = nm ? nm[1] : bL.length; if (ai < na || bi < nb) { h.push({ baseStart: ai, baseEnd: na, replacement: bL.slice(bi, nb) }); ai = na; bi = nb; } if (nm) { ai++; bi++; mi++; } else break; } return h; }
  function splitL(s) { var l = s.split('\n'); if (l[l.length - 1] === '') l.pop(); return l; }
  function nws(s) { return s.replace(/\s+/g, ' ').trim(); }
  function pushOk(segs, text) { if (!text) return; var last = segs[segs.length - 1]; if (last && last.type === 'ok' && !last.autoResolved) last.text += text; else segs.push({ type: 'ok', text: text }); }
  function threeWayMerge(base, mine, theirs) {
    var bL = splitL(base), mL = splitL(mine), tL = splitL(theirs);
    var mH = toHunks(bL, mL, computeLCS(bL, mL)), tH = toHunks(bL, tL, computeLCS(bL, tL));
    var segs = [], bi = 0, mi = 0, ti = 0;
    while (bi < bL.length || mi < mH.length || ti < tH.length) {
      var mh = mi < mH.length ? mH[mi] : null, th = ti < tH.length ? tH[ti] : null; if (!mh && !th) break;
      var ns = Math.min(mh ? mh.baseStart : Infinity, th ? th.baseStart : Infinity);
      if (bi < ns) { pushOk(segs, bL.slice(bi, ns).join('\n') + '\n'); bi = ns; }
      mh = mi < mH.length ? mH[mi] : null; th = ti < tH.length ? tH[ti] : null; if (!mh && !th) break;
      var ov = mh && th && (mh.baseStart === th.baseStart || (mh.baseStart < th.baseEnd && th.baseStart < mh.baseEnd));
      if (ov) { bi = Math.max(mh.baseEnd, th.baseEnd); mi++; ti++; var mT = mh.replacement.join('\n'), tT = th.replacement.join('\n'); if (mT === tT) pushOk(segs, mT + (mT ? '\n' : '')); else if (nws(mT) === nws(tT)) segs.push({ type: 'ok', text: mT + '\n', autoResolved: true }); else segs.push({ type: 'conflict', mine: mT, theirs: tT }); }
      else if (mh && (!th || mh.baseStart < th.baseStart)) { bi = mh.baseEnd; mi++; var t = mh.replacement.join('\n'); pushOk(segs, t + (t ? '\n' : '')); }
      else { bi = th.baseEnd; ti++; var t2 = th.replacement.join('\n'); pushOk(segs, t2 + (t2 ? '\n' : '')); }
    }
    if (bi < bL.length) pushOk(segs, bL.slice(bi).join('\n'));
    return segs;
  }
  function showConflictUI(segs, autoN, onSave, onCancel) {
    var total = segs.filter(function (s) { return s.type === 'conflict'; }).length;
    var choices = segs.map(function () { return null; });
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:#1e1e1e;display:flex;flex-direction:column;font-family:Consolas,"Courier New",monospace;font-size:13px';
    function e(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function resolveAll(mode) {
      segs.forEach(function (s, i) {
        if (s.type !== 'conflict') return;
        if (mode === 'mine') choices[i] = s.mine + '\n';
        else if (mode === 'theirs') choices[i] = s.theirs + '\n';
        else choices[i] = [s.mine, s.theirs].filter(Boolean).join('\n') + '\n';
      });
      render();
    }
    function render() {
      var unres = segs.reduce(function (n, s, i) { return n + (s.type === 'conflict' && choices[i] === null ? 1 : 0); }, 0);
      var h = '<div style="background:#252526;color:#ccc;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #3c3c3c;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<span style="color:#9cdcfe">⚡ Merge Conflicts</span><span style="color:#666">' + total + ' conflict(s)</span>' +
        (autoN ? '<span style="color:#89d185;font-size:11px">✓ ' + autoN + ' whitespace diff(s) ignored</span>' : '') +
        (unres ? '<span style="color:#f48771;font-size:12px">● ' + unres + ' unresolved</span>' : '<span style="color:#89d185;font-size:12px">✓ All resolved</span>') +
        '</div><div style="display:flex;align-items:center;gap:6px">' +
        '<button id="_CX_AM" style="background:#0e639c;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px">All Current</button>' +
        '<button id="_CX_AT" style="background:#6f42c1;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px">All Incoming</button>' +
        '<button id="_CX_AB" style="background:#3a3a3a;color:#ccc;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px">All Both</button>' +
        '<span style="width:1px;height:20px;background:#555;margin:0 4px"></span>' +
        '<button id="_CX_SV" style="background:' + (unres ? '#3c3c3c' : '#0e639c') + ';color:' + (unres ? '#555' : '#fff') + ';border:none;padding:6px 18px;border-radius:4px;cursor:' + (unres ? 'not-allowed' : 'pointer') + ';font-size:13px"' + (unres ? ' disabled' : '') + '>💾 Save</button>' +
        '<button id="_CX_CX" style="background:transparent;color:#ccc;border:1px solid #555;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px">Cancel</button>' +
        '</div></div><div style="flex:1;overflow-y:auto">';
      var ci = 0;
      segs.forEach(function (seg, i) {
        if (seg.type === 'ok') { var ls = seg.text.split('\n'), pv = ls.slice(0, 3).join('\n') + (ls.length > 3 ? '\n…' : ''); h += '<div style="white-space:pre-wrap;color:#555;font-size:12px;padding:2px 16px;border-left:3px solid transparent;line-height:1.6">' + e(pv) + '</div>'; return; }
        var cnum = ++ci, res = choices[i];
        function mkB(lbl, bg, fg, cls) { return '<button class="' + cls + '" data-i="' + i + '" style="background:' + bg + ';color:' + fg + ';border:none;padding:3px 10px;border-radius:3px;cursor:pointer;font-size:11px;font-family:inherit;margin-right:4px;white-space:nowrap">' + lbl + '</button>'; }
        h += '<div style="border-top:1px solid #3c3c3c;border-bottom:1px solid #3c3c3c">' +
          '<div style="background:#2d2d2d;color:#9cdcfe;font-size:11px;padding:5px 16px;display:flex;align-items:center;gap:6px;border-left:3px solid #569cd6;flex-wrap:wrap">' +
          '<span>▶ ' + cnum + '/' + total + '</span>' + mkB('✔ Current', '#0e639c', '#fff', '_CM') + mkB('✔ Incoming', '#6f42c1', '#fff', '_CT') + mkB('Both', '#3a3a3a', '#ccc', '_CB') +
          (res !== null ? '<span style="color:#89d185;font-size:11px">✓ Resolved</span>' : '<span style="color:#f48771;font-size:11px">● Unresolved</span>') +
          '</div>' +
          '<div style="background:rgba(45,124,45,.12);border-left:3px solid #2d7c2d;padding:2px 16px;font-size:10px;color:#608b4e">← Current Change</div>' +
          '<div style="background:rgba(45,124,45,.07);white-space:pre-wrap;color:#d4d4d4;padding:6px 16px;border-left:3px solid #2d7c2d;line-height:1.6;min-height:20px">' + e(seg.mine || '(empty)') + '</div>' +
          '<div style="background:#2a2a2a;border-left:3px solid #444;padding:2px 16px;font-size:10px;color:#444;letter-spacing:2px">══════════════</div>' +
          '<div style="background:rgba(38,79,120,.18);border-left:3px solid #264f78;padding:2px 16px;font-size:10px;color:#569cd6">→ Incoming Change</div>' +
          '<div style="background:rgba(38,79,120,.1);white-space:pre-wrap;color:#d4d4d4;padding:6px 16px;border-left:3px solid #264f78;line-height:1.6;min-height:20px">' + e(seg.theirs || '(empty)') + '</div>' +
          (res !== null ? '<div style="background:rgba(137,209,133,.1);border-left:3px solid #89d185;padding:2px 16px;font-size:10px;color:#89d185">✓ Selected</div>' +
            '<div style="background:rgba(137,209,133,.05);white-space:pre-wrap;color:#d4d4d4;padding:6px 16px;border-left:3px solid #89d185;line-height:1.6">' + e(res) + '</div>' : '') +
          '</div>';
      });
      h += '</div>'; ov.innerHTML = h;
      var am = ov.querySelector('#_CX_AM'); if (am) am.onclick = function () { resolveAll('mine'); };
      var at = ov.querySelector('#_CX_AT'); if (at) at.onclick = function () { resolveAll('theirs'); };
      var ab = ov.querySelector('#_CX_AB'); if (ab) ab.onclick = function () { resolveAll('both'); };
      ov.querySelectorAll('._CM').forEach(function (b) { b.onclick = function () { choices[+b.dataset.i] = segs[+b.dataset.i].mine + '\n'; render(); }; });
      ov.querySelectorAll('._CT').forEach(function (b) { b.onclick = function () { choices[+b.dataset.i] = segs[+b.dataset.i].theirs + '\n'; render(); }; });
      ov.querySelectorAll('._CB').forEach(function (b) { b.onclick = function () { var s = segs[+b.dataset.i]; choices[+b.dataset.i] = [s.mine, s.theirs].filter(Boolean).join('\n') + '\n'; render(); }; });
      var sv = ov.querySelector('#_CX_SV'); if (sv) sv.onclick = function () { ov.remove(); onSave(segs.map(function (s, i) { return s.type === 'ok' ? s.text : (choices[i] || ''); }).join('')); };
      var cx = ov.querySelector('#_CX_CX'); if (cx) cx.onclick = function () { ov.remove(); if (onCancel) onCancel(); };
    }
    render(); document.body.appendChild(ov);
  }
  var _mergeBusy = false;

  function actionPath(action) {
    try {
      return new URL(action || '', location.href).pathname;
    } catch (_) {
      return action || '';
    }
  }

  function isEventEditForm(form) {
    if (!form) return false;
    return /\/calendar\/event\/edit\//.test(actionPath(form.getAttribute('action') || ''));
  }

  function findRemoteForm(localForm, remoteDoc) {
    if (!remoteDoc) return null;
    var localPath = actionPath(localForm ? localForm.getAttribute('action') || '' : '');
    if (localPath) {
      var forms = Array.from(remoteDoc.querySelectorAll('form'));
      for (var i = 0; i < forms.length; i++) {
        if (actionPath(forms[i].getAttribute('action') || '') === localPath) return forms[i];
      }
    }
    return remoteDoc.querySelector('form');
  }

  function collectInviteeFields(form) {
    if (!form) return [];
    var nameRe = /(invitee|invitees|attendee|participant|guest)/i;
    return Array.from(form.querySelectorAll('input[name],select[name],textarea[name]')).filter(function (el) {
      var name = el.name || '';
      if (!nameRe.test(name)) return false;
      if (el.tagName === 'INPUT') {
        var type = (el.type || '').toLowerCase();
        if (type === 'submit' || type === 'button' || type === 'file') return false;
      }
      return true;
    });
  }

  function syncRemoteInvitees(localForm, remoteDoc) {
    if (!isEventEditForm(localForm)) return;
    var remoteForm = findRemoteForm(localForm, remoteDoc);
    if (!remoteForm) return;

    var localInvitees = collectInviteeFields(localForm);
    var remoteInvitees = collectInviteeFields(remoteForm);
    if (!remoteInvitees.length) return;

    localInvitees.forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    remoteInvitees.forEach(function (el) {
      localForm.appendChild(el.cloneNode(true));
    });
  }

  function submitMergedForm(form, remoteDoc, mergedText) {
    syncRemoteInvitees(form, remoteDoc);
    if (typeof mergedText === 'string') {
      getTA().value = mergedText;
      $.mergeBase = mergedText;
    }
    form.submit();
  }

  async function doAutoMerge() {
    if (_mergeBusy) return;
    _mergeBusy = true;
    try {
      var ta = getTA();
      if (!ta) { alert('Editor not found'); return; }
      var form = ta.closest('form');
      if (!form) { alert('Form not found'); return; }
      /* Old comment edit (dialog mode): no concurrent editing possible,
         skip merge entirely to avoid picking up wrong textarea content. */
      if ($.isMulti) { form.submit(); return; }
      var MINE = ta.value;
      var ldr = showLoader('Fetching latest version…'), html;
      try { html = await (await fetch(PAGE, { credentials: 'include' })).text(); }
      catch (err) { ldr.remove(); alert('❌ ' + err.message); return; }
      ldr.remove();
      var doc2 = new DOMParser().parseFromString(html, 'text/html');
      var stA = doc2.querySelector('textarea[name="text"]') || doc2.querySelector('textarea');
      var THEIRS = stA ? stA.value : '';

      /* Safety: if remote textarea not found or THEIRS is empty but we had content,
         fall back to direct submit to prevent data loss. */
      if (!THEIRS && $.mergeBase) { submitMergedForm(form, doc2); return; }
      if (MINE === THEIRS) { submitMergedForm(form, doc2); return; }
      var segs = threeWayMerge($.mergeBase, MINE, THEIRS);
      var autoN = segs.filter(function (s) { return s.autoResolved; }).length;
      if (!segs.filter(function (s) { return s.type === 'conflict'; }).length) {
        var merged = segs.map(function (s) { return s.text; }).join('');
        if (confirm('✅ Auto-merged!' + (autoN ? '\n(' + autoN + ' whitespace diff(s) ignored)' : '') + '\n\nOK to save')) {
          submitMergedForm(form, doc2, merged);
        }
        return;
      }
      showConflictUI(segs, autoN,
        function (r) { submitMergedForm(form, doc2, r); },
        function () { getTA().value = MINE; }
      );
    } finally {
      _mergeBusy = false;
    }
  }
  /* ════════════════════════════════════════════════════════════
     LIVE PREVIEW REFRESH
     ════════════════════════════════════════════════════════════ */
  var _pvTimer = null, _pvLastText = '';
  var _pvRefreshToken = 0;
  var _pvWaitObserver = null;

  function stopPreviewWait() {
    if (_pvWaitObserver) {
      _pvWaitObserver.disconnect();
      _pvWaitObserver = null;
    }
  }

  function waitPreviewUpdated(form, token, onReady) {
    stopPreviewWait();

    function isPreviewNode(node) {
      if (!node) return false;
      var el = node.nodeType === 1 ? node : node.parentElement;
      if (!el) return false;

      var pv = getActivePreviewEl(form);
      if (pv && (el === pv || pv.contains(el) || el.contains(pv))) return true;

      if (!el.matches || !el.closest) return false;
      var SEL = '.remarkup-inline-preview, .phui-comment-preview-view div.phui-timeline-view, .phui-remarkup-preview';
      return el.matches(SEL) || !!el.closest(SEL);
    }

    function mutationTouchesPreview(m) {
      if (isPreviewNode(m.target)) return true;
      if (Array.from(m.addedNodes || []).some(isPreviewNode)) return true;
      if (Array.from(m.removedNodes || []).some(isPreviewNode)) return true;
      return false;
    }

    function getPreviewState() {
      var el = getActivePreviewEl(form);
      if (!el) return { el: null, sig: '', renderable: false, textLen: 0, childCount: 0 };
      var textLen = ((el.textContent || '').trim()).length;
      var childCount = el.childElementCount;
      var sig = childCount + '|' + el.scrollHeight + '|' + el.clientHeight + '|' + textLen;
      return {
        el: el,
        sig: sig,
        renderable: childCount > 0 || textLen > 0,
        textLen: textLen,
        childCount: childCount
      };
    }

    var beforeState = getPreviewState();
    var beforePv = beforeState.el;
    var beforeSig = beforeState.sig;

    var done = false;
    function finish() {
      if (done || token !== _pvRefreshToken) return;
      done = true;
      stopPreviewWait();
      requestAnimationFrame(onReady);
    }

    var root = document.body || form || $.remarkEl;
    if (!root) {
      finish();
      return;
    }

    _pvWaitObserver = new MutationObserver(function (mutations) {
      if (token !== _pvRefreshToken) return;
      var touched = mutations.some(mutationTouchesPreview);
      if (touched) {
        sawMutation = true;
      }
    });
    _pvWaitObserver.observe(root, { childList: true, subtree: true, characterData: true });

    /* Wait until preview state is stable for several frames after update begins. */
    var sawMutation = false;
    var stableFrames = 0;
    var lastSig = beforeSig;
    var frames = 0;
    (function checkByFrame() {
      if (done || token !== _pvRefreshToken) return;
      var st = getPreviewState();
      var changed = (!!st.el && !beforePv) ||
        (!!st.el && !!beforePv && st.el !== beforePv) ||
        (st.sig !== beforeSig);

      if (changed && !sawMutation) {
        sawMutation = true;
      }

      if (sawMutation) {
        if (st.renderable && st.sig === lastSig) stableFrames++;
        else stableFrames = 0;

        if (stableFrames >= 6) {
          finish();
          return;
        }
      }

      lastSig = st.sig;
      frames++;
      if (frames >= 300) {
        finish();
        return;
      }
      requestAnimationFrame(checkByFrame);
    })();
  }

  function schedulePreviewRefresh() {
    if (!$.active) return;
    clearTimeout(_pvTimer);
    _pvTimer = setTimeout(doPreviewRefresh, 50);
  }

  function findPreviewBtnInContainer() {
    /* Find the preview toggle button inside the active editor container */
    if (!$.remarkEl) return null;
    var btn = $.remarkEl.querySelector('div.fa-eye');
    return btn ? btn.parentElement : null;
  }

  function getActivePreviewEl(form) {
    var livePv = form ? (form.querySelector('.remarkup-inline-preview') ||
      form.querySelector('.phui-comment-preview-view div.phui-timeline-view') ||
      form.querySelector('.phui-remarkup-preview')) : null;
    return livePv || $.previewEl || null;
  }

  function shouldForcePreviewToggle() {
    return $.isMulti || /\/calendar\/event\/edit\//.test(PAGE);
  }

  function focusNoScroll(ta) {
    if (!ta) return;
    try {
      ta.focus({ preventScroll: true });
    } catch (_) {
      ta.focus();
    }
  }

  function doPreviewRefresh() {
    if (!$.active || !$.previewEl || !$.remarkEl) return;
    var ta = $.remarkEl.querySelector('textarea');
    if (!ta) return;
    var form = $.remarkEl.closest('form');
    var text = ta.value;
    if (text === _pvLastText) return;
    _pvLastText = text;
    _pvRefreshToken++;
    var refreshToken = _pvRefreshToken;
    stopPreviewWait();

    function alignPreviewToEditor() {
      if (refreshToken !== _pvRefreshToken) return;

      var nextPv = getActivePreviewEl(form) || $.previewEl;
      if (nextPv && nextPv !== $.previewEl) {
        if ($.previewEl) $.previewEl.removeAttribute('style');
        $.previewEl = nextPv;
        if (_mmMO) { _mmMO.disconnect(); }
        _mmMO = new MutationObserver(function () { schedRebuild(250); });
        _mmMO.observe($.previewEl, { childList: true, subtree: true });
        schedRebuild(300);
      }

      if (!$.previewEl) return;

      applyRight($.previewEl);

      var taRange = Math.max(1, ta.scrollHeight - ta.clientHeight);
      var ratio = ta.scrollTop / taRange;
      if (taRange <= 1) {
        var formRect = ($.remarkEl || ta).getBoundingClientRect();
        var viewH = Math.max(1, window.innerHeight);
        var docTop = window.scrollY + formRect.top;
        var formH = Math.max(1, formRect.height);
        var centerY = window.scrollY + (viewH * 0.5);
        ratio = (centerY - docTop) / formH;
      }
      ratio = Math.max(0, Math.min(1, ratio));
      var pvRange = Math.max(1, $.previewEl.scrollHeight - $.previewEl.clientHeight);
      var nextPvTop = Math.max(0, Math.min(pvRange, Math.round(ratio * pvRange)));
      $.previewEl.scrollTop = nextPvTop;
      focusNoScroll(ta);
    }

    waitPreviewUpdated(form, refreshToken, alignPreviewToEditor);

    /* Toggle the preview button within the same remarkup container
       to trigger Phabricator's native preview refresh mechanism.
       Needed for existing comment edit (isMulti) and calendar event edit pages;
       task editing and new comments usually update via native events. */
    var pvBtn = shouldForcePreviewToggle() ? findPreviewBtnInContainer() : null;
    if (pvBtn) {
      if (pvBtn.classList.contains('preview-active')) {
        pvBtn.click(); pvBtn.click();
      } else {
        pvBtn.click();
      }
      /* Phabricator may add remarkup-preview-active and disable toolbar buttons;
         undo those side-effects to keep split-pane layout working. */
      $.remarkEl.classList.remove('remarkup-preview-active');
      applyLeft($.remarkEl);
      /* Re-enable any toolbar buttons that Phabricator disabled */
      $.remarkEl.querySelectorAll('.remarkup-assist-button[disabled]').forEach(function (b) {
        b.removeAttribute('disabled');
        b.style.pointerEvents = '';
        b.style.opacity = '';
      });
      var currentPv = getActivePreviewEl(form);
      if (currentPv) {
        if (currentPv !== $.previewEl) $.previewEl = currentPv;
        applyRight($.previewEl);
      }
      return;
    }

    /* Fallback: dispatch native events to trigger Phabricator built-in update */
    ['input', 'change', 'keyup'].forEach(function (type) {
      ta.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  function attachAutoMerge() {
    var ta = getTA(); if (!ta) return;
    var form = ta.closest('form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      doAutoMerge();
    }, true);
  }

  /* ════════════════════════════════════════════════════════════
     TOOLBAR
     ════════════════════════════════════════════════════════════ */
  var TB_EL = document.createElement('div'); TB_EL.id = '_PHE_TB';
  TB_EL.innerHTML =
    '<span class="logo">✏ Phab Editor ' + PLUGIN_VERSION + '</span>' +
    '<div class="sep"></div>' +
    '<button id="_PHE_EDIT" class="ph-btn">Edit Mode</button>' +
    '<button id="_PHE_SYNTAX" class="ph-btn">Syntax Highlight</button>' +
    '<button id="_PHE_HALF" class="ph-btn">⇔ Half</button>' +
    '<button id="_PHE_FINDBTN" class="ph-btn">🔍 Find</button>' +
    '<div class="sep"></div>' +
    '<span style="font-size:11px;color:#2ecc71;white-space:nowrap">✓ AutoMerge</span>' +
    '<div class="sp"></div>' +
    '<button id="_PHE_CLONE" class="ph-btn" style="display:none">Clone</button>' +
    '<div class="sep"></div>' +
    '<button id="_PHE_CANCEL" class="ph-btn cancel">✕ Cancel</button>' +
    '<button id="_PHE_SAVE" class="ph-btn save">💾 Save</button>';
  document.body.appendChild(TB_EL);

  var SAVE_BTN = document.getElementById('_PHE_SAVE');
  SAVE_BTN.setAttribute('disabled', '');
  function updateSaveBtn() {
    var ta = getTA();
    if (ta && ta.value !== $.mergeBase) SAVE_BTN.removeAttribute('disabled');
    else SAVE_BTN.setAttribute('disabled', '');
  }
  SAVE_BTN.addEventListener('click', function () {
    if (SAVE_BTN.hasAttribute('disabled')) return;
    doAutoMerge();
  });
  document.getElementById('_PHE_CANCEL').addEventListener('click', function () {
    if (confirm('Discard all changes and reload?')) window.location.reload();
  });

  var DIV = document.createElement('div'); DIV.id = '_PHE_DIV'; document.body.appendChild(DIV);
  DIV.addEventListener('mousedown', function (e) { $.drag = true; DIV.classList.add('drag'); e.preventDefault(); });
  document.addEventListener('mousemove', function (e) { if (!$.drag) return; updateSplit((e.clientX / window.innerWidth) * 100); });
  document.addEventListener('mouseup', function () { if ($.drag) { $.drag = false; DIV.classList.remove('drag'); } });

  document.getElementById('_PHE_HALF').addEventListener('click', function () {
    _half = !_half; this.textContent = _half ? '⇔ Full' : '⇔ Half';
    if ($.active) { if ($.remarkEl) applyLeft($.remarkEl); if ($.previewEl) applyRight($.previewEl); applyDivider(); positionMinimap(); }
  });

  /* Measure the actual 'normal' line-height for a textarea's font.
     Chrome returns 'normal' for textarea lineHeight; Firefox returns a px value.
     We create a hidden single-line element with identical font metrics and measure it. */
  function measureNormalLineHeight(ta, cs) {
    var span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
      'font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize +
      ';font-weight:' + cs.fontWeight + ';letter-spacing:' + cs.letterSpacing + ';';
    span.textContent = 'Xg';
    ta.parentElement.appendChild(span);
    var h = span.offsetHeight;
    ta.parentElement.removeChild(span);
    return h + 'px';
  }

  function syncBackdropStyles(ta, el, bar) {
    var cs = getComputedStyle(ta);
    var bar_cs = bar ? getComputedStyle(bar) : null;
    var borderX =
      (parseFloat(cs.borderLeftWidth) || 0) +
      (parseFloat(cs.borderRightWidth) || 0);
    var scrollbarGutter = Math.max(0, ta.offsetWidth - ta.clientWidth - borderX);
    el.style.fontFamily = cs.fontFamily;
    el.style.fontSize = cs.fontSize;
    el.style.fontWeight = cs.fontWeight;
    var lh = cs.lineHeight;
    el.style.lineHeight = (lh === 'normal')
      ? measureNormalLineHeight(ta, cs)
      : lh;
    el.style.letterSpacing = cs.letterSpacing;
    el.style.wordSpacing = cs.wordSpacing;
    el.style.textIndent = cs.textIndent;
    el.style.paddingTop = cs.paddingTop;
    el.style.paddingRight = ((parseFloat(cs.paddingRight) || 0) + scrollbarGutter) + 'px';
    el.style.paddingBottom = cs.paddingBottom;
    el.style.paddingLeft = cs.paddingLeft;
    el.style.borderTopWidth = cs.borderTopWidth;
    el.style.borderRightWidth = cs.borderRightWidth;
    el.style.borderBottomWidth = cs.borderBottomWidth;
    el.style.borderLeftWidth = cs.borderLeftWidth;

    el.style.marginTop = bar_cs ? bar_cs.height : '0px';
    try { el.style.tabSize = cs.tabSize; } catch (_) { }
  }

  function hlText(text) {
    var escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\n$/g, '\n\n')
      /* Code fences ``` — highlight the fence lines themselves */
      .replace(/^```.*$/gm, function (a) { return '<marker class="codefence">' + a + '</marker>'; })
      /* Inline monospaced `code` */
      .replace(/`[^`\n]+`/g, function (a) { return '<marker class="mono">' + a + '</marker>'; })
      /* Headings # through ###### */
      .replace(/^#{1}(?!#).*$/gm, function (a) { return '<marker class="bold lb h1">' + a + '</marker>'; })
      .replace(/^#{2}(?!#).*$/gm, function (a) { return '<marker class="bold lb h2">' + a + '</marker>'; })
      .replace(/^#{3}(?!#).*$/gm, function (a) { return '<marker class="bold lb h3">' + a + '</marker>'; })
      .replace(/^#{4}(?!#).*$/gm, function (a) { return '<marker class="bold lb h4">' + a + '</marker>'; })
      .replace(/^#{5}(?!#).*$/gm, function (a) { return '<marker class="bold lb h5">' + a + '</marker>'; })
      .replace(/^#{6}(?!#).*$/gm, function (a) { return '<marker class="bold lb h6">' + a + '</marker>'; })
      /* Headings = through ====== */
      .replace(/^={1}(?!=).*$/gm, function (a) { return '<marker class="bold lb h1">' + a + '</marker>'; })
      .replace(/^={2}(?!=).*$/gm, function (a) { return '<marker class="bold lb h2">' + a + '</marker>'; })
      .replace(/^={3}(?!=).*$/gm, function (a) { return '<marker class="bold lb h3">' + a + '</marker>'; })
      .replace(/^={4}(?!=).*$/gm, function (a) { return '<marker class="bold lb h4">' + a + '</marker>'; })
      .replace(/^={5}(?!=).*$/gm, function (a) { return '<marker class="bold lb h5">' + a + '</marker>'; })
      .replace(/^={6}(?!=).*$/gm, function (a) { return '<marker class="bold lb h6">' + a + '</marker>'; })
      /* Bold **text** */
      .replace(/\*\*.*?\*\*/gm, function (a) { return '<marker class="bold">' + a + '</marker>'; })
      /* Italic //text// — negative lookbehind avoids URLs like http:// */
      .replace(/(^|[^\w:])(\/\/.*?\/\/)/gm, function (a, prefix, italic) { return prefix + '<marker class="italic">' + italic + '</marker>'; })
      /* Strikethrough ~~text~~ */
      .replace(/~~.*?~~/gm, function (a) { return '<marker class="strike">' + a + '</marker>'; })
      /* Underline __text__ */
      .replace(/__.*?__/gm, function (a) { return '<marker class="uline">' + a + '</marker>'; })
      /* Highlight !!text!! */
      .replace(/!!.*?!!/gm, function (a) { return '<marker class="rect">' + a + '</marker>'; })
      /* Blockquote > lines */
      .replace(/^>.*$/gm, function (a) { return '<marker class="quote">' + a + '</marker>'; })
      /* Callouts NOTE: / WARNING: / IMPORTANT: */
      .replace(/^(?:\(NOTE\)|NOTE:).*$/gm, function (a) { return '<marker class="callout-note">' + a + '</marker>'; })
      .replace(/^(?:\(WARNING\)|WARNING:).*$/gm, function (a) { return '<marker class="callout-warn">' + a + '</marker>'; })
      .replace(/^(?:\(IMPORTANT\)|IMPORTANT:).*$/gm, function (a) { return '<marker class="callout-imp">' + a + '</marker>'; })
      /* Horizontal divider --- */
      .replace(/^-{3,}\s*$/gm, function (a) { return '<marker class="lb divider">' + a + '</marker>'; })
      /* @mentions */
      .replace(/(^|\s)(@\w+)/gm, function (a, pre, mention) { return pre + '<marker class="mention">' + mention + '</marker>'; })
      /* #project hashtags */
      .replace(/(^|\s)(#[a-zA-Z_]\w*)/gm, function (a, pre, tag) { return pre + '<marker class="hashtag">' + tag + '</marker>'; })
      /* Object references T123, D123 */
      .replace(/(^|\W)([TD]\d+(#\d{6})?)/gm, function (a, pre, ref) { return pre + '<marker class="objref">' + ref + '</marker>'; })
      /* Bullet lists - or + */
      .replace(/^(\s*[-+]\s)/gm, function (a) { return '<marker class="dash">' + a + '</marker>'; })
      /* Numbered lists */
      .replace(/\W(\d+\.\s)/gm, function (a) { return '<marker class="num">' + a + '</marker>'; })
      /* Curly brace references {F123}, {icon ...}, {tex c_{mq}} — supports one level of nesting */
      .replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, function (a) { return '<marker class="bord">' + a + '</marker>'; })
      /* Markdown links [text](url) — matched before generic [...] */
      .replace(/\[([^\[\]]*)\]\(([^)]*)\)/g, function (a, text, url) { return '<marker class="link">' + a + '</marker>'; })
      /* Square bracket references [[wiki]] — supports one level of nesting */
      .replace(/\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]/g, function (a) { return '<marker class="bord">' + a + '</marker>'; });
  }

  document.getElementById('_PHE_SYNTAX').addEventListener('click', function () {
    if (!$.active) return;
    $.syntaxEnabled = !$.syntaxEnabled;
    this.classList.toggle('on', $.syntaxEnabled);
    if ($.backdrop) {
      $.backdrop.style.display = $.syntaxEnabled ? '' : 'none';
      var h = document.getElementById('_PHE_HL');
      if (h) h.innerHTML = hlText($.activeTA.value);
    }
  });

  document.getElementById('_PHE_EDIT').addEventListener('click', function () {
    if (!$.active) {
      var bars = document.getElementsByClassName('remarkup-assist-bar');
      if (!bars.length) { alert('Remarkup editor not found'); return; }
      var multi = bars.length > 1;
      var container = bars[bars.length - 1].parentElement;
      var preview = getPreviewEl(multi);
      if (!preview) { alert('Preview area unavailable'); return; }
      $.remarkEl = container; $.previewEl = preview; $.isMulti = multi;
      $.savedScrollY = window.scrollY;
      container.classList.remove('remarkup-preview-active');
      applyLeft(container); applyRight(preview); applyDivider();
      if (multi) hideDialog(true);
      var ta = container.querySelector('textarea');
      if (ta) {
        ta.focus();
        $.activeTA = ta;
        _pvLastText = ta.value;
        $._hadMono = ta.classList.contains('PhabricatorMonospaced');
        if (!$._hadMono) {
          ta.classList.add('PhabricatorMonospaced');
        }
        $.backdrop = document.createElement('div');
        $.backdrop.className = 'phe-bd';
        $.backdrop.innerHTML = '<div id="_PHE_HL"></div>';
        ta.parentElement.insertBefore($.backdrop, ta);
        syncBackdropStyles(ta, $.backdrop, bars[bars.length - 1]);
        ta.addEventListener('input', function () {
          if (!$.syntaxEnabled) return;
          var h = document.getElementById('_PHE_HL');
          if (h) h.innerHTML = hlText(ta.value);
        });
        ta.dispatchEvent(new Event('input'));
        ta.addEventListener('scroll', function () { if ($.backdrop) $.backdrop.scrollTop = ta.scrollTop; });
        $.syntaxEnabled = true;
        document.getElementById('_PHE_SYNTAX').classList.add('on');
        ta.addEventListener('input', schedulePreviewRefresh);
        ta.addEventListener('input', updateSaveBtn);
        $.syncer = new ScrollSyncer(ta);
      }
      $.active = true;
      updateSaveBtn();
      stopMinimap();
      startMinimap();
      this.textContent = '← Back'; this.classList.add('on');
    } else {
      if ($.syncer) { $.syncer.destroy(); $.syncer = null; }
      $.activeTA = null;
      clearTimeout(_pvTimer);
      stopMinimap();
      if ($.remarkEl) {
        $.remarkEl.removeAttribute('style');
        var bar = $.remarkEl.querySelector('.remarkup-assist-bar');
        if (bar) bar.removeAttribute('style');
        var ta = $.remarkEl.querySelector('textarea');
        if (ta) {
          if (!$._hadMono) ta.classList.remove('PhabricatorMonospaced');
          var node = ta.parentElement; while (node && node !== $.remarkEl) { node.removeAttribute('style'); node = node.parentElement; } ta.removeAttribute('style');
        }
      }
      if ($.previewEl) $.previewEl.removeAttribute('style');
      if ($.backdrop && $.backdrop.parentElement) $.backdrop.parentElement.removeChild($.backdrop);
      $.backdrop = null; DIV.style.display = 'none';
      document.getElementById('_PHE_SYNTAX').classList.remove('on');
      if ($.isMulti) { setPreview(true); hideDialog(false); }
      else setPreview(false);
      $.active = false; $.remarkEl = null; $.previewEl = null;
      this.textContent = 'Edit Mode'; this.classList.remove('on');
      window.scrollTo(0, $.savedScrollY);
      updateSaveBtn();
      startMinimap();
    }
  });

  var fb = document.createElement('div'); fb.id = '_PHE_FB';
  fb.innerHTML = '<div class="fb-row"><input type="text" id="_PHE_FI" placeholder="Find…"><span id="_PHE_FC"></span>' +
    '<label><input type="checkbox" id="_PHE_FCASE"> Aa</label><label><input type="checkbox" id="_PHE_FWORD"> [W]</label>' +
    '<button class="fb-btn" id="_PHE_FFIND">Find ↵</button></div>' +
    '<div class="fb-row"><input type="text" id="_PHE_RI" placeholder="Replace…">' +
    '<label><input type="checkbox" id="_PHE_RALL"> All</label><button class="fb-btn" id="_PHE_FREPLACE">Replace</button></div>';
  document.body.appendChild(fb);
  document.getElementById('_PHE_FINDBTN').addEventListener('click', function () { fb.classList.toggle('open'); if (fb.classList.contains('open')) document.getElementById('_PHE_FI').focus(); });
  function getSearchRe(txt) { var flags = document.getElementById('_PHE_FCASE').checked ? 'g' : 'gi'; var ww = document.getElementById('_PHE_FWORD').checked; txt = txt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); return new RegExp(ww ? '\\b' + txt + '\\b' : txt, flags); }
  document.getElementById('_PHE_FFIND').addEventListener('click', function () {
    var ta = getTA(); if (!ta) return; var ft = document.getElementById('_PHE_FI').value; if (!ft) return;
    var re = getSearchRe(ft), text = ta.value, total = ((text || '').match(re) || []).length;
    if (!total) { document.getElementById('_PHE_FC').textContent = '0/0'; return; }
    var cur = ta.selectionEnd, below = text.substring(cur), belowN = ((below || '').match(re) || []).length;
    if (belowN === 0) { ta.setSelectionRange(0, 0); below = text; cur = 0; belowN = total; }
    var pos = below.search(re) + cur; ta.setSelectionRange(pos, pos + ft.length); ta.focus();
    document.getElementById('_PHE_FC').textContent = (total - belowN + 1) + '/' + total;
  });
  document.getElementById('_PHE_FI').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('_PHE_FFIND').click(); } });
  document.getElementById('_PHE_FREPLACE').addEventListener('click', function () {
    var ta = getTA(); if (!ta) return; var ft = document.getElementById('_PHE_FI').value, rt = document.getElementById('_PHE_RI').value;
    var all = document.getElementById('_PHE_RALL').checked, re = getSearchRe(ft), text = ta.value; if (!re.test(text)) return;
    if (all) ta.value = text.replace(re, rt); else { var pos = text.search(re); ta.setRangeText(rt, pos, pos + ft.length, 'select'); }
  });

  function ins(ta, tok) { insT(ta, tok, tok); }
  function insT(ta, t1, t2) { var s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText(t1 + ta.value.substring(s, e) + t2, s, e, 'select'); }
  window.addEventListener('keydown', function (e) {
    if (document.activeElement.type !== 'textarea') return; var ta = document.activeElement;
    if (e.ctrlKey && e.key === 'b') { ins(ta, '**'); ta.setSelectionRange(ta.selectionEnd - 2, ta.selectionEnd - 2); e.preventDefault(); }
    else if (e.ctrlKey && e.key === 'i') { ins(ta, '//'); ta.setSelectionRange(ta.selectionEnd - 2, ta.selectionEnd - 2); e.preventDefault(); }
    else if (e.ctrlKey && e.key === 's') { e.preventDefault(); document.getElementById('_PHE_SAVE').click(); }
    else if (e.key === '`' || e.key === '"' || e.key === "'") { ins(ta, e.key); ta.setSelectionRange(ta.selectionEnd - 1, ta.selectionEnd - 1); e.preventDefault(); }
    else if (e.key === '(') { insT(ta, '(', ')');; ta.setSelectionRange(ta.selectionEnd - 1, ta.selectionEnd - 1); e.preventDefault(); }
    else if (e.key === '[') { insT(ta, '[', ']'); ta.setSelectionRange(ta.selectionEnd - 1, ta.selectionEnd - 1); e.preventDefault(); }
    else if (e.key === '{') { insT(ta, '{', '}'); ta.setSelectionRange(ta.selectionEnd - 1, ta.selectionEnd - 1); e.preventDefault(); }
    else if (e.key === 'Tab') {
      var s = ta.selectionStart; while (s > 0 && ta.value[s - 1] !== '\n') s--;
      var end = ta.selectionEnd; while (end < ta.value.length && ta.value[end] !== '\n' && ta.value[end + 1] !== '\n') end++;
      ta.setRangeText(ta.value.substring(s, end).split('\n').map(function (l) { return e.shiftKey ? l.replace(/^  /, '') : '  ' + l; }).join('\n'), s, end, 'select'); e.preventDefault();
    }
    else if (e.key === 'Enter') {
      e.preventDefault(); var s = ta.selectionStart; while (s > 0 && ta.value[s - 1] !== '\n') s--;
      var cur = ta.value.substring(s, ta.selectionStart);
      var ind = (cur.match(/^\s*[-+]*(\d+\.)*\s*/m) || [''])[0];
      if (ind.match(/\d+\./)) ind = ind.replace(/\d+/, function (n) { return parseInt(n) + 1; });
      var br = ta.closest('td') ? '{newline} \n' : '\n';
      ta.setRangeText(ta.value.substring(s, ta.selectionEnd) + br + ind, s, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  });

  (function () {
    var TR = /^\s*\|(?:[^|]+\|)+\s*$/, oRange = null, oTA = null;
    var SEP_RE = /^\s*-{3,}\s*$/;
    var tBtn = document.createElement('button'); tBtn.id = '_PHE_TBLBTN'; tBtn.textContent = 'Table Editor';
    var tMd = document.createElement('div'); tMd.id = '_PHE_TBLMOD';
    document.body.appendChild(tBtn); document.body.appendChild(tMd);
    function isTable(t) { var ls = t.trim().split('\n'); return ls.length > 0 && ls.every(function (l) { return TR.test(l); }); }
    /* Detect if a parsed row is a header separator (all cells are 3+ dashes) */
    function isSepRow(row) { return row.every(function (c) { return SEP_RE.test(c); }); }
    window.addEventListener('mouseup', function (e) {
      if (document.activeElement.type !== 'textarea') return;
      setTimeout(function () {
        var ta = document.activeElement, s = ta.selectionStart, end = ta.selectionEnd; var text = ta.value.substring(s, end);
        if (isTable(text)) { oTA = ta; oRange = { selectionStart: s, selectionEnd: end, originalText: text }; tBtn.style.left = e.clientX + 'px'; tBtn.style.top = e.clientY + 'px'; tBtn.style.display = 'block'; }
        else tBtn.style.display = 'none';
      }, 10);
    });
    tBtn.addEventListener('click', function () {
      if (!oRange || !isTable(oRange.originalText)) return;
      var parsed = oRange.originalText.trim().split('\n').map(function (r) {
        return r.trim().split('|').filter(function (c) { return c !== ''; }).map(function (c) { return c.trim(); });
      });
      /* Detect and strip header separator row (row where all cells are ---+) */
      var hasHeader = false;
      if (parsed.length >= 2 && isSepRow(parsed[1])) {
        hasHeader = true;
        parsed.splice(1, 1);
      }
      buildMod(parsed, hasHeader);
      tBtn.style.display = 'none';
    });
    function replaceWith(text) { text = text.replace(/(\n)(?=[^|])/g, ''); oTA.setRangeText(text, oRange.selectionStart, oRange.selectionEnd, 'select'); }

    function buildMod(data, hasHeader) {
      tMd.innerHTML = ''; tMd.style.display = 'block';

      /* ── Modal header ── */
      var header = document.createElement('div'); header.className = 'tm-header';
      var titleWrap = document.createElement('div');
      var titleEl = document.createElement('span'); titleEl.className = 'tm-title'; titleEl.textContent = '📊 Table Editor';
      var infoEl = document.createElement('span'); infoEl.className = 'tm-info';
      titleWrap.appendChild(titleEl); titleWrap.appendChild(infoEl);
      var headerActions = document.createElement('div'); headerActions.className = 'tm-header-actions';
      header.appendChild(titleWrap); header.appendChild(headerActions);
      tMd.appendChild(header);

      /* ── Save / Discard in header actions ── */
      var saveBtn = document.createElement('button'); saveBtn.textContent = '💾 Save'; saveBtn.className = 'ph-btn save'; saveBtn.style.fontSize = '12px';
      var discardBtn = document.createElement('button'); discardBtn.textContent = 'Discard'; discardBtn.className = 'ph-btn cancel'; discardBtn.style.fontSize = '12px';
      discardBtn.addEventListener('click', function () { tMd.style.display = 'none'; });
      headerActions.appendChild(saveBtn); headerActions.appendChild(discardBtn);

      /* ── Table ── */
      var tbl = document.createElement('table');

      function autoSize(ta) {
        ta.style.height = 'auto';
        ta.style.height = Math.max(ta.scrollHeight, 24) + 'px';
      }

      function mkCell(text, r, c) {
        var td = document.createElement('td');
        var ta = document.createElement('textarea');
        ta.value = text.replace(/\{newline\}/g, '{newline}\n');
        ta.rows = 1;
        ta.dataset.row = r; ta.dataset.col = c;
        ta.addEventListener('input', function () { autoSize(ta); });
        td.appendChild(ta);
        return td;
      }

      function updateInfo() {
        var rc = tbl.rows.length - 1; /* -1 for colDelRow */
        var cc = tbl.rows[1] ? tbl.rows[1].cells.length - 1 : 0; /* -1 for row-delete col */
        infoEl.textContent = rc + ' rows × ' + cc + ' cols' + (hasHeader ? ' (header)' : '');
      }

      function rebuildRowIndices() {
        Array.from(tbl.rows).forEach(function (tr, ri) {
          if (tr === colDelRow) return;
          Array.from(tr.cells).forEach(function (td) {
            var ta = td.querySelector('textarea');
            if (ta) { ta.dataset.row = ri; }
          });
          /* Update header class — first data row (row index 1 in DOM, since 0 is colDelRow) */
          tr.classList.toggle('phe-tbl-hdr', hasHeader && tr === tbl.rows[1]);
        });
      }

      function ensureColDelRowAttached() {
        var firstRow = tbl.rows[0];
        if (firstRow !== colDelRow) tbl.insertBefore(colDelRow, firstRow || null);
      }

      /* ── Column delete buttons row ── */
      var colDelRow = document.createElement('tr');
      function buildColDelRow() {
        colDelRow.innerHTML = '';
        /* Count columns from first data row (after colDelRow itself), minus the row-delete cell */
        var firstDataRow = tbl.rows[1];
        var cc = firstDataRow ? firstDataRow.cells.length - 1 : 0;
        for (var ci = 0; ci < cc; ci++) {
          (function (col) {
            var td = document.createElement('td'); td.className = 'tm-del-col'; td.textContent = '✕';
            td.title = 'Delete column ' + (col + 1);
            td.addEventListener('click', function () {
              /* Check if column has content */
              var hasContent = false;
              Array.from(tbl.rows).forEach(function (tr) {
                if (tr === colDelRow) return;
                var cell = tr.cells[col + 1]; /* +1 for row-delete column */
                if (cell) { var ta = cell.querySelector('textarea'); if (ta && ta.value.trim()) hasContent = true; }
              });
              if (hasContent && !confirm('Delete column ' + (col + 1) + '? It contains data.')) return;
              Array.from(tbl.rows).forEach(function (tr) {
                if (tr === colDelRow) return;
                var cell = tr.cells[col + 1];
                if (cell) tr.removeChild(cell);
              });
              buildColDelRow();
              rebuildRowIndices();
              updateInfo();
            });
            colDelRow.appendChild(td);
          })(ci);
        }
        /* Empty corner cell for the row-delete column */
        var corner = document.createElement('td'); corner.style.border = 'none'; corner.style.minWidth = 'auto';
        colDelRow.insertBefore(corner, colDelRow.firstChild);
      }

      /* ── Build data rows ── */
      data.forEach(function (row, ri) {
        var tr = document.createElement('tr');
        if (hasHeader && ri === 0) tr.classList.add('phe-tbl-hdr');
        /* Row delete button */
        var delTd = document.createElement('td'); delTd.className = 'tm-del-row'; delTd.textContent = '✕';
        delTd.title = 'Delete row ' + (ri + 1);
        delTd.addEventListener('click', function () {
          var hasContent = false;
          Array.from(tr.cells).forEach(function (td) {
            if (td === delTd) return;
            var ta = td.querySelector('textarea'); if (ta && ta.value.trim()) hasContent = true;
          });
          if (hasContent && !confirm('Delete this row? It contains data.')) return;
          tbl.removeChild(tr);
          rebuildRowIndices();
          updateInfo();
        });
        tr.appendChild(delTd);
        row.forEach(function (cell, ci) { tr.appendChild(mkCell(cell, ri, ci)); });
        tbl.appendChild(tr);
      });

      ensureColDelRowAttached();
      buildColDelRow();
      tMd.appendChild(tbl);

      /* ── Auto-size after DOM insertion: widths first, then heights ── */
      requestAnimationFrame(function () {
        redistributeColWidths();
        tMd.querySelectorAll('textarea').forEach(autoSize);
      });

      /* ── Measure max content width per column and set proportional col widths ── */
      function redistributeColWidths() {
        var dataRows = Array.from(tbl.rows).filter(function (tr) { return tr !== colDelRow; });
        if (!dataRows.length) return;
        var cc = dataRows[0].cells.length - 1; /* -1 for row-delete col */
        if (cc <= 0) return;

        /* Hidden measuring element */
        var ruler = document.createElement('span');
        ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:0 8px;';
        document.body.appendChild(ruler);

        var maxWidths = [];
        for (var ci = 0; ci < cc; ci++) {
          var maxW = 60; /* minimum floor */
          dataRows.forEach(function (tr) {
            var td = tr.cells[ci + 1]; /* +1 for row-delete col */
            if (!td) return;
            var ta = td.querySelector('textarea');
            if (!ta) return;
            /* Measure the longest line in this cell */
            var lines = ta.value.split('\n');
            lines.forEach(function (line) {
              ruler.textContent = line;
              var w = ruler.offsetWidth + 20; /* +20 for padding */
              if (w > maxW) maxW = w;
            });
          });
          maxWidths.push(Math.min(maxW, 500)); /* cap at 500px */
        }
        document.body.removeChild(ruler);

        /* Set proportional widths via colgroup */
        var totalW = maxWidths.reduce(function (sum, w) { return sum + w; }, 0);
        var cg = tbl.querySelector('colgroup');
        if (!cg) { cg = document.createElement('colgroup'); tbl.insertBefore(cg, tbl.firstChild); }
        cg.innerHTML = '';
        /* First col: row-delete column (fixed narrow) */
        var delCol = document.createElement('col'); delCol.style.width = '22px'; cg.appendChild(delCol);
        maxWidths.forEach(function (w) {
          var col = document.createElement('col');
          col.style.width = Math.max(Math.round((w / totalW) * 100), 5) + '%';
          cg.appendChild(col);
        });
      }

      /* ── Toolbar buttons ── */
      var btns = document.createElement('div'); btns.className = 'tm-btns';
      var hdrBtn = document.createElement('button'); hdrBtn.className = 'ph-btn' + (hasHeader ? ' on' : '');
      hdrBtn.style.fontSize = '12px'; hdrBtn.textContent = 'Toggle Header';
      hdrBtn.addEventListener('click', function () {
        hasHeader = !hasHeader;
        hdrBtn.classList.toggle('on', hasHeader);
        rebuildRowIndices();
        updateInfo();
      });
      btns.appendChild(hdrBtn);

      [['+ Row', function () {
        var cc = tbl.rows[1] ? tbl.rows[1].cells.length - 1 : 0; /* -1 for del col */
        var ri = tbl.rows.length - 1; /* -1 for colDelRow */
        var tr = document.createElement('tr');
        var delTd = document.createElement('td'); delTd.className = 'tm-del-row'; delTd.textContent = '✕';
        delTd.addEventListener('click', function () {
          var hasContent = false;
          Array.from(tr.cells).forEach(function (td) {
            if (td === delTd) return;
            var ta = td.querySelector('textarea'); if (ta && ta.value.trim()) hasContent = true;
          });
          if (hasContent && !confirm('Delete this row? It contains data.')) return;
          tbl.removeChild(tr);
          rebuildRowIndices(); updateInfo();
        });
        tr.appendChild(delTd);
        for (var c = 0; c < cc; c++) tr.appendChild(mkCell('', ri, c));
        tbl.appendChild(tr);
        rebuildRowIndices(); updateInfo();
        requestAnimationFrame(function () { tr.querySelectorAll('textarea').forEach(autoSize); });
      }],
      ['+ Col', function () {
        var ci = tbl.rows[1] ? tbl.rows[1].cells.length - 1 : 0;
        Array.from(tbl.rows).forEach(function (tr, ri) {
          if (tr === colDelRow) return;
          tr.appendChild(mkCell('', ri, ci));
        });
        buildColDelRow();
        rebuildRowIndices(); updateInfo();
        redistributeColWidths();
      }]
      ].forEach(function (pair) {
        var b = document.createElement('button'); b.textContent = pair[0]; b.className = 'ph-btn'; b.style.fontSize = '12px';
        b.addEventListener('click', pair[1]); btns.appendChild(b);
      });
      tMd.appendChild(btns);

      function serializeCellValue(ta) {
        return ta.value
          .replace(/\{newline\}[ \t]*\n[ \t]*/g, '{newline} ')
          .replace(/\n/g, '{newline} ')
          .trim();
      }

      /* ── Save handler ── */
      saveBtn.addEventListener('click', function () {
        var rows = Array.from(tbl.rows).filter(function (tr) { return tr !== colDelRow; });
        var lines = rows.map(function (tr) {
          return Array.from(tr.cells).filter(function (td) { return !td.classList.contains('tm-del-row'); })
            .map(function (td) { return serializeCellValue(td.firstChild); });
        }).map(function (r) { return '| ' + r.join(' | ') + ' |'; });
        /* Insert header separator after first row if header is active */
        if (hasHeader && lines.length > 0) {
          var cc = rows[0] ? rows[0].cells.length - 1 : 1;
          var sep = '| ' + Array(cc).fill('-----').join(' | ') + ' |';
          lines.splice(1, 0, sep);
        }
        replaceWith(lines.join('\n'));
        if (oTA) {
          oTA.dispatchEvent(new Event('input', { bubbles: true }));
          oTA.dispatchEvent(new Event('change', { bubbles: true }));
        }
        tMd.style.display = 'none';
      });

      updateInfo();
    }
  })();

  document.addEventListener('paste', function (e) {
    if (document.activeElement.type !== 'textarea') return;
    var html = e.clipboardData.getData('text/html'); if (!html) return;
    var doc2 = new DOMParser().parseFromString(html, 'text/html');
    var tbl = doc2.querySelector('table'); if (!tbl) return;
    var arr = Array.from(tbl.rows).map(function (row) { return Array.from(row.cells).map(function (c) { c.querySelectorAll('br').forEach((br) => br.replaceWith('\n')); return (c.textContent || '').trim(); }); });
    var md = arr.map(function (row) { return '\n| ' + row.map(function (c) { return c.replace(/\n/g, '{newline}'); }).join(' | ') + ' |'; }).join('');
    var ta = document.activeElement, s = ta.selectionStart, end = ta.selectionEnd;
    ta.setRangeText(md, s, end, 'select'); e.preventDefault();
  });

  (function () {
    var body = document.getElementById('phabricator-standard-page-body'); if (!body) return;
    var frm = body.querySelector('form'); if (!frm) return; var action = frm.action;
    var evRe = /\/calendar\/event\/edit\/(\d+)/, taskRe = /\/maniphest\/task\/edit\/(\d+)/;
    var cloneBtn = document.getElementById('_PHE_CLONE');
    function handleClone(url) { cloneBtn.addEventListener('click', function () { alert('Clone clicked!'); body.querySelectorAll('button[name="__submit__"]').forEach(function (b) { b.textContent = 'Make Clone'; frm.action = url; }); }); }
    if (evRe.test(action)) { cloneBtn.textContent = 'Clone E' + action.match(evRe)[1]; cloneBtn.style.display = ''; handleClone('/calendar/event/edit/form/3/'); }
    else if (taskRe.test(action)) { cloneBtn.textContent = 'Clone T' + action.match(taskRe)[1]; cloneBtn.style.display = ''; handleClone('/maniphest/task/edit/form/2/'); }
  })();

  (function () {
    var crumb = document.querySelector('.phabricator-last-crumb .phui-crumb-name');
    var taskId = crumb ? crumb.innerText.replace(/\s/g, '') : (window.location.href.match(/[T|E]\d{4}/) || [null])[0];
    document.querySelectorAll('.phui-timeline-extra').forEach(function (extra) {
      var a = extra.querySelector('a'); if (!a) return;
      var href = (taskId || '') + a.getAttribute('href');
      var span = document.createElement('span'); span.className = 'block-id'; span.textContent = href; span.title = 'Copy';
      span.onclick = function (evt) { var h = evt.target.textContent; navigator.clipboard.writeText(h); evt.target.textContent = 'Copied!'; evt.target.classList.add('show-copied'); setTimeout(function () { evt.target.textContent = h; evt.target.classList.remove('show-copied'); }, 1000); };
      extra.appendChild(span);
    });
  })();

  function showLoader(msg) { var el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999999;display:flex;align-items:center;justify-content:center'; el.innerHTML = '<div style="background:#1e1e1e;color:#d4d4d4;padding:24px 36px;border-radius:8px;font:15px Consolas,monospace">⏳ ' + msg + '</div>'; document.body.appendChild(el); return el; }

  $.mergeBase = getTA() ? getTA().value : '';
  attachAutoMerge();
  startMinimap();

  /* Auto-enter edit mode on any edit page,
     or when an inline comment editor dialog is open */
  if (/\/edit\//.test(PAGE) ||
    document.querySelector('.jx-client-dialog .remarkup-assist-bar')) {
    document.getElementById('_PHE_EDIT').click();
  }

})();