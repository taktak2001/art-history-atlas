# -*- coding: utf-8 -*-
exec(open('_gen2.py',encoding='utf-8').read())
MED,ITA,NET,FRA,GER,USA,JPN = '#705B49','#974136','#A9652B','#406789','#2F6F6C','#694C84','#9B5269'

# ══════════ OVERVIEW ══════════
# レーン高は一律ではなく、そのレーンに要る段数で決める（混んだ地域ほど高い）
ov_lanes = lanes([
 ( 40, 66,MED,[('地中海・',69,'地中海・古代'),('古代',81,None)],66),
 (106, 82,ITA,[('イタリア',150,None)],147),
 (188, 66,NET,[('フランドル・',217,'フランドル・オランダ'),('オランダ',229,None)],214),
 (254,116,FRA,[('フランス',315,None)],312),
 (370, 78,GER,[('中央',405,'ドイツ・中央ヨーロッパ'),('ヨーロッパ',417,None)],402),
 (448, 88,USA,[('アメリカ',495,None)],492),
 (536, 66,JPN,[('日本',572,None)],569)])
ov_axis = axis([(108,'1400'),(144,'1600'),(180,'1750'),(226,'1900'),(258,'1950'),(306,'2000'),(350,'2026')],brk=94)
ov_routes = '''    <!-- Overviewは線より配置を読む。主幹（継承・反発・影響）とそれ以外で強さを変える -->
    <g fill="none" stroke-width="2" opacity="0.28">
      <path d="M104,135 V213 q0,8 8,8 H124" stroke="%s" stroke-dasharray="1.5 6" stroke-linecap="round"/>
      <path d="M195,409 V468 q0,8 8,8 H254" stroke="%s" stroke-dasharray="2 6" stroke-linecap="round"/>
      <path d="M272,508 V561 q0,8 8,8 H282" stroke="%s" stroke-dasharray="1.5 6" stroke-linecap="round"/>
    </g>
    <g fill="none" stroke-width="2.2" opacity="0.55">
      <path d="M98,73 V127 q0,8 8,8 H108" stroke="%s" stroke-dasharray="9 5" marker-end="url(#m-med)"/>
      <path d="M108,135 H136 q8,0 8,8 V163" stroke="%s" stroke-linecap="round" marker-end="url(#m-ita)"/>
      <path d="M112,135 V266 q0,8 8,8 H234 q8,0 8,8 V286" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-ita)"/>
      <path d="M180,286 V401 q0,8 8,8 H195" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M180,286 H198 q8,0 8,8 V316" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M195,409 V324 q0,-8 8,-8 H206" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-ger)"/>
      <path d="M206,316 H214 q8,0 8,8 V346" stroke="%s" stroke-linecap="round" marker-end="url(#m-fra)"/>
      <path d="M156,569 V354 q0,-8 8,-8 H222" stroke="%s" stroke-dasharray="18 8" marker-end="url(#m-jpn)"/>
      <path d="M254,476 H264 q8,0 8,8 V508" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-usa)"/>
    </g>
''' % (ITA,GER,USA, MED,ITA,ITA,FRA,FRA,GER,FRA,JPN,USA)
ov_st = stations([(98,73,MED),(108,135,ITA),(144,163,ITA),(124,221,NET),(180,286,FRA),(206,316,FRA),
                  (222,346,FRA),(242,286,FRA),(195,409,GER),(254,476,USA),(272,508,USA),(156,569,JPN),(282,569,JPN)])
ov_lb = labels([(107,73,'古代ギリシア'),(100,120,'伊ルネサンス'),(153,163,'バロック'),(133,221,'北方ルネサンス'),
                (171,286,'新古典主義','end'),(219,316,'写実主義'),(231,346,'印象派'),(251,286,'キュビスム'),
                (204,409,'ロマン主義'),(247,459,'抽象表現主義'),(281,508,'ミニマリズム'),(165,569,'浮世絵'),(291,569,'もの派')])
ov_svg = ('  <svg class="map" style="top:172px" viewBox="0 0 390 680" width="390" height="680" role="img" aria-label="美術運動の関係ネットワーク（Overview）">\n'
          + MARKERS + ov_lanes + ov_axis + ov_routes + ov_st + ov_lb + '  </svg>\n\n')
open('Main.dc.html','w',encoding='utf-8').write(page('OVERVIEW','通史',ov_svg,14))

# ══════════ STUDY ══════════
st_lanes = lanes([
 ( 40, 48,MED,[('地中海・',60,'地中海・古代'),('古代',72,None)],57),
 ( 88, 80,ITA,[('イタリア',131,None)],128),
 (168, 76,NET,[('フランドル・',202,'フランドル・オランダ'),('オランダ',214,None)],199),
 (244,152,FRA,[('フランス',323,None)],320),
 (396, 92,GER,[('中央',437,'ドイツ・中央ヨーロッパ'),('ヨーロッパ',449,None)],434),
 (488, 80,USA,[('アメリカ',531,None)],528),
 (568, 28,JPN,[('日本',585,None)],582)])
st_axis = axis([(100,'1600'),(136,'1650'),(172,'1700'),(208,'1750'),(244,'1800'),(280,'1850'),(316,'1900'),(352,'1950')],
  extra='    <line x1="316" y1="38" x2="316" y2="590" stroke="#1C1C1E" stroke-opacity="0.13" stroke-width="1"/>\n'
        '    <rect x="313" y="36" width="6" height="4" fill="#1C1C1E" fill-opacity="0.42"/>\n')
st_routes = '''    <g fill="none" stroke-width="2.2" opacity="0.82">
      <path d="M100,128 H164 q8,0 8,8 V286" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M100,128 V206" stroke="%s" stroke-dasharray="5 4" marker-end="url(#m-net)"/>
      <path d="M172,286 H200 q8,0 8,8 V322" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M208,322 V416 q0,8 8,8 H244" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-ger)"/>
      <path d="M208,322 H262 q8,0 8,8 V358" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M244,424 H265 q8,0 8,-8 V358" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M276,358 V294 q0,-8 8,-8 H287" stroke="%s" stroke-linecap="round" marker-end="url(#m-fra)"/>
      <path d="M287,286 H297 q8,0 8,8 V322" stroke="%s" stroke-dasharray="9 6" marker-end="url(#m-fra)"/>
      <path d="M305,322 V458 q0,8 8,8 H320" stroke="%s" stroke-dasharray="18 8" marker-end="url(#m-ger)"/>
    </g>
''' % (ITA,ITA,FRA,FRA,FRA,GER,FRA,FRA,FRA)
st_chips = chips([(176,215,'反発',ITA),(212,372,'反発',FRA),(264,300,'継承',FRA),(307,424,'影響',FRA)])
st_st = stations([(100,128,ITA),(100,206,NET),(172,286,FRA),(208,322,FRA),(273,358,FRA),(287,286,FRA),
                  (305,322,FRA),(244,424,GER),(320,466,GER),(347,528,USA)],r=6,w=2.4)
st_lb = labels([(109,114,'バロック'),(92,192,'オランダ黄金時代'),(181,286,'ロココ'),(200,308,'新古典主義','end'),
                (264,358,'写実主義','end'),(296,270,'印象派'),(314,336,'ポスト印象派'),(253,424,'ロマン主義'),
                (329,466,'表現主義'),(356,528,'抽象表現主義')])
st_edge = ('    <g font-size="10" fill="#6B6A68" opacity="0.75" stroke="#F6F4EF" stroke-width="3.6"\n'
           '       stroke-linejoin="round" paint-order="stroke fill">\n'
           '      <text x="94" y="152">◀ 伊ルネサンス 1400</text>\n    </g>\n')
st_svg = ('  <svg class="map" style="top:172px" viewBox="0 0 390 680" width="390" height="680" role="img" aria-label="美術運動の関係ネットワーク（Study）">\n'
          + MARKERS + st_lanes + st_axis + st_routes + st_chips + st_st + st_lb + st_edge + '  </svg>\n\n')
open('Study.dc.html','w',encoding='utf-8').write(page('STUDY','19世紀',st_svg,14))
print('overview + study rebuilt')
