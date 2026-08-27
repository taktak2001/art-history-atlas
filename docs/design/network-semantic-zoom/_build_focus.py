# -*- coding: utf-8 -*-
exec(open('_gen2.py',encoding='utf-8').read())

def page_nozoom(mode,era,svg,sheet):
    full = page(mode,era,svg,0,sheet)
    import re as _re
    return _re.sub(r'  <div class="zoomfab".*?</div>\n  </div>\n','',full,flags=_re.S)
MED,ITA,NET,FRA = '#705B49','#974136','#A9652B','#406789'

EXTRA_CSS['FOCUS'] = '''    .sheet { position: absolute; left: 0; right: 0; top: 470px; height: 374px; background: #FFFFFF;
      border-radius: 22px 22px 0 0; box-shadow: 0 -1px 0 rgba(214,210,200,0.9), 0 -20px 48px rgba(38,38,42,0.18);
      overflow: hidden; }

    .grab { width: 40px; height: 5px; margin: 9px auto 0; border-radius: 3px; background: #D2CCC0; }
    .sheet-head { display: flex; align-items: center; gap: 13px; padding: 10px 20px 12px; }
    .disc { width: 44px; height: 44px; flex: none; border-radius: 50%; background: #974136;
      box-shadow: inset 0 0 0 3px #FFFFFF, 0 0 0 1px rgba(151,65,54,0.35); }
    .sheet-title { font-family: 'Hiragino Mincho ProN','YuMincho','Yu Mincho','Noto Serif JP',Georgia,serif;
      font-size: 20px; font-weight: 500; letter-spacing: 0.03em; line-height: 1.25; }
    .sheet-meta { margin-top: 4px; color: #6B6A68; font-size: 11.5px; font-variant-numeric: tabular-nums; }
    .icobtn { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid #D6D2C8; border-radius: 50%; }
    .sec { padding: 11px 20px 0; border-top: 1px solid #D6D2C8; margin: 0 20px; }
    .sec:first-child { border-top: 0; }
    .eyebrow { color: #6B6A68; font-size: 9.5px; font-weight: 650; letter-spacing: 0.14em; }
    .sec p { margin: 6px 0 11px; font-size: 12.5px; line-height: 1.78; }
    .who { display: flex; gap: 6px; margin: 8px 0 11px; }
    .who span { display: inline-flex; align-items: center; height: 28px; padding: 0 11px; white-space: nowrap; }
    .who span {
      border: 1px solid #D6D2C8; border-radius: 14px; font-size: 11.5px; }
    .work { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 8px 0; border-top: 1px solid #EFEBE2; }
    .work:first-of-type { border-top: 0; margin-top: 6px; }
    .work b { font-size: 12.5px; font-weight: 600; }
    .work small { color: #6B6A68; font-size: 10.5px; white-space: nowrap; }
    .sheet-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 58px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 20px; border-top: 1px solid #D6D2C8; background: #FFFFFF; }
    .more { display: inline-flex; align-items: center; gap: 9px; height: 42px; padding: 0 19px;
      border: 1px solid #1C1C1E; border-radius: 21px; font-size: 13px; font-weight: 600; }
    .relcount { color: #5C5C60; font-size: 11.5px; }
'''

fo_lanes = lanes([
 ( 40,66,MED,[('地中海・',69,'地中海・古代'),('古代',81,None)],66),
 (106,66,ITA,[('イタリア',142,None)],139),
 (172,66,NET,[('フランドル・',201,'フランドル・オランダ'),('オランダ',213,None)],198),
 (238,66,FRA,[('フランス',274,None)],271)])
fo_axis = axis([(112,'古代'),(150,'1400'),(190,'1600'),(226,'1750'),(272,'1900'),(300,'1950'),(340,'2000')],brk=133,
  extra='    <g stroke="#1C1C1E" stroke-opacity="0.10" stroke-width="1">\n'
        '      <line x1="150" y1="40" x2="150" y2="304"/><line x1="198" y1="40" x2="198" y2="304"/>\n    </g>\n')

# ── 選択から遠いほど大胆に落とす ──
faint = ('''    <g opacity="0.13">
      <circle cx="196" cy="73" r="4.5" fill="#1C1C1E"/>
      <circle cx="110" cy="205" r="4.5" fill="#1C1C1E"/>
      <circle cx="300" cy="258" r="4.5" fill="#1C1C1E"/>
      <circle cx="322" cy="286" r="4.5" fill="#1C1C1E"/>
      <circle cx="352" cy="258" r="4.5" fill="#1C1C1E"/>
      <path d="M300,258 H314 q8,0 8,8 V286" fill="none" stroke="#1C1C1E" stroke-width="2" stroke-dasharray="9 6"/>
    </g>
''')

two_hop = ('    <g opacity="0.45">\n'
           '      <g fill="none" stroke-width="2.1">\n'
           '        <path d="M200,139 V189 q0,8 8,8 H206" stroke="%s" stroke-dasharray="5 4" marker-end="url(#m-net)"/>\n'
           '        <path d="M200,139 H224 q8,0 8,8 V250 q0,8 8,8 H232" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>\n'
           '        <path d="M158,205 H206" stroke="%s" stroke-linecap="round" marker-end="url(#m-net)"/>\n'
           '      </g>\n'
           '      <circle cx="206" cy="205" r="6" fill="#F6F4EF" stroke="%s" stroke-width="2.2"/><circle cx="206" cy="205" r="2.2" fill="%s"/>\n'
           '      <circle cx="232" cy="258" r="6" fill="#F6F4EF" stroke="%s" stroke-width="2.2"/><circle cx="232" cy="258" r="2.2" fill="%s"/>\n'
           '      <g font-size="11.5" font-weight="500" fill="#1C1C1E" dominant-baseline="middle"\n'
           '         stroke="#F6F4EF" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke fill">\n'
           '        <text x="215" y="205">オランダ黄金時代</text>\n'
           '        <text x="241" y="258">ロココ</text>\n'
           '      </g>\n    </g>\n') % (ITA,ITA,NET,NET,NET,FRA,FRA)

one_hop = '''    <g fill="none" stroke-width="2.4">
      <path d="M124,73 V131 q0,8 8,8 H150" stroke="%s" stroke-dasharray="9 5" marker-end="url(#m-med)"/>
      <path d="M150,139 H200" stroke="%s" stroke-linecap="round" marker-end="url(#m-ita)"/>
      <path d="M146,139 V197 q0,8 8,8 H158" stroke="%s" stroke-dasharray="1.5 6" stroke-linecap="round"/>
      <path d="M154,139 V270 q0,8 8,8 H268 q8,0 8,8 V286" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-ita)"/>
    </g>
''' % (MED,ITA,ITA,ITA)

fo_chips = chips([(128,88,'復興',MED),(160,132,'継承',ITA),(150,168,'同時代',ITA),(158,224,'反発',ITA)])
fo_st = stations([(124,73,MED),(200,139,ITA),(158,205,NET),(276,286,FRA)])
sel = ('    <g>\n'
       '      <circle cx="150" cy="139" r="16" fill="#974136" fill-opacity="0.10"/>\n'
       '      <circle cx="150" cy="139" r="11" fill="#F6F4EF"/>\n'
       '      <circle cx="150" cy="139" r="8.5" fill="#974136"/>\n    </g>\n')
fo_lb = labels([(133,73,'古代ギリシア'),(209,139,'バロック'),(167,191,'北方ルネサンス'),(285,286,'キュビスム')])
sel_lb = ('    <text x="150" y="120" font-size="15" font-weight="700" fill="#1C1C1E" text-anchor="middle" '
          'dominant-baseline="middle">伊ルネサンス</text>\n')

fo_svg = ('  <svg class="map" style="top:172px" viewBox="0 0 390 306" width="390" height="306" role="img" '
          'aria-label="イタリア・ルネサンスを選択した関係ネットワーク（Focus）">\n'
          + MARKERS + fo_lanes + fo_axis + faint + two_hop + one_hop + fo_chips + fo_st + sel + fo_lb + sel_lb + '  </svg>\n\n')

sheet = '''  <div class="sheet">
    <div class="grab"></div>
    <div class="sheet-head">
      <div class="disc"></div>
      <div>
        <div class="sheet-title">イタリア・ルネサンス</div>
        <div class="sheet-meta">c. 1400–1520　｜　イタリア</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <div class="icobtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C5C60" stroke-width="1.6"><path d="M7 4h10v16l-5-4-5 4z" stroke-linejoin="round"/></svg></div>
        <div class="icobtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C5C60" stroke-width="1.6"><circle cx="17" cy="6" r="2.6"/><circle cx="7" cy="12" r="2.6"/><circle cx="17" cy="18" r="2.6"/><path d="M9.3 10.8 14.7 7.4M9.3 13.2l5.4 3.4" stroke-linecap="round"/></svg></div>
      </div>
    </div>
    <div class="sec">
      <div class="eyebrow">概要</div>
      <p>古典古代の復興と人文主義を背景に、線遠近法・解剖学・古典的比例を統合した様式。人間と現世を積極的に肯定する視覚言語が確立した。</p>
    </div>
    <div class="sec">
      <div class="eyebrow">代表作家</div>
      <div class="who"><span title="レオナルド・ダ・ヴィンチ">レオナルド</span><span title="ミケランジェロ・ブオナローティ">ミケランジェロ</span><span title="ラファエロ・サンティ">ラファエロ</span></div>
    </div>
    <div class="sec">
      <div class="eyebrow">代表作品</div>
      <div class="work"><b>モナ・リザ</b><small>レオナルド｜1503〜1519年頃</small></div>
      <div class="work"><b>アテナイの学堂</b><small>ラファエロ｜1509〜1511年</small></div>
          </div>
    <div class="sec">
      <div class="eyebrow">関係</div>
    </div>
    <div class="sheet-bar">
      <div class="more">詳細を見る<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <span class="relcount">関係 6件</span>
    </div>
  </div>
'''
open('Focus.dc.html','w',encoding='utf-8').write(page_nozoom('FOCUS','ルネサンス',fo_svg,sheet))
print('focus written')
