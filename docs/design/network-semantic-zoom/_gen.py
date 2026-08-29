# -*- coding: utf-8 -*-
CSS = '''    body { margin: 0; }
    a { color: #7A3C2A; } a:hover { color: #5E2C1F; }
    .screen { position: relative; width: 390px; height: 844px; background: #F6F4EF; color: #1C1C1E;
      font-family: 'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic','Meiryo','Noto Sans JP',system-ui,sans-serif;
      font-feature-settings: 'palt'; overflow: hidden; }
    .rule { border-bottom: 1px solid #D6D2C8; }
    .hdr { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px 0 20px; }
    .mark { display: grid; width: 68px; gap: 1px; font-size: 10px; font-weight: 650; line-height: 11px; letter-spacing: 0.02em; }
    .mark span { display: block; text-align: justify; text-align-last: justify; white-space: nowrap; }
    .hdr-btns { display: flex; align-items: center; gap: 8px; }
    .rbtn { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #D6D2C8; border-radius: 50%; color: #5C5C60; }
    .searchrow { display: flex; align-items: center; height: 60px; padding: 0 20px; }
    .search { display: flex; align-items: center; gap: 10px; width: 100%; height: 38px; padding: 0 13px;
      border: 1px solid #D6D2C8; border-radius: 8px; background: #FFFFFF; color: #6B6A68; font-size: 13px; }
    .moderow { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px;
      border-top: 1px solid #D6D2C8; background: #F0EEE8; }
    .seg { display: flex; height: 34px; border: 1px solid #D6D2C8; border-radius: 5px; overflow: hidden; }
    .seg > div { display: grid; place-items: center; padding: 0 13px; font-size: 10.5px; font-weight: 600;
      letter-spacing: 0.08em; color: #5C5C60; border-left: 1px solid #D6D2C8; }
    .seg > div:first-child { border-left: 0; }
    .seg > div[data-on='true'] { background: #1C1C1E; color: #F6F4EF; font-weight: 700; }
    .era { display: flex; align-items: center; gap: 5px; font-family: 'Hiragino Mincho ProN','YuMincho','Yu Mincho','Noto Serif JP',Georgia,serif;
      font-size: 15px; font-weight: 500; letter-spacing: 0.02em; }
    .map { position: absolute; left: 0; width: 390px; }
    .zoomfab { position: absolute; right: 14px; display: flex; align-items: center; height: 36px;
      border: 1px solid #D6D2C8; border-radius: 18px; background: rgba(255,255,255,0.94);
      box-shadow: 0 2px 10px rgba(38,38,42,0.10); overflow: hidden; }
    .zoomfab > div { display: grid; place-items: center; width: 38px; height: 100%; color: #5C5C60; }
    .zoomfab > div + div { border-left: 1px solid #D6D2C8; }
    svg text { font-family: 'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic','Meiryo','Noto Sans JP',system-ui,sans-serif; }
'''

def chrome(mode, era):
    seg = ''.join(
        '<div%s>%s</div>' % (' data-on="true"' if m == mode else '', m)
        for m in ('OVERVIEW', 'STUDY', 'FOCUS'))
    return '''<div class="screen">

  <div class="hdr rule">
    <div class="mark"><span>ART</span><span>HISTORY</span><span>ATLAS</span></div>
    <div class="hdr-btns">
      <div class="rbtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.4 8.4 0 1 0 20 14.5Z" stroke-linejoin="round"/></svg></div>
      <div class="rbtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/></svg></div>
    </div>
  </div>

  <div class="searchrow rule">
    <div class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5" stroke-linecap="round"/></svg>
      <span>ムーブメントを検索</span>
    </div>
  </div>

  <div class="moderow rule">
    <div class="seg">%s</div>
    <span class="era">%s<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  </div>
''' % (seg, era)

ZOOM = '''  <div class="zoomfab" style="bottom: %spx">
    <div><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div style="font-size:17px">−</div>
    <div style="font-size:15px">＋</div>
  </div>
'''

def page(mode, era, svg, zoom_bottom, sheet=''):
    return '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
%s%s  </style>
</helmet>

%s
%s%s%s</div>
</x-dc>
<script data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {}
</script>
</body>
</html>
''' % (CSS, EXTRA_CSS.get(mode, ''), chrome(mode, era), svg, ZOOM % zoom_bottom, sheet)

EXTRA_CSS = {}
