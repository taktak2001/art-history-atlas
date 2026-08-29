# -*- coding: utf-8 -*-
exec(open('_gen.py',encoding='utf-8').read())

MARKERS = '''    <defs>
      <marker id="m-med" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#705B49"/></marker>
      <marker id="m-ita" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#974136"/></marker>
      <marker id="m-net" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#A9652B"/></marker>
      <marker id="m-fra" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#406789"/></marker>
      <marker id="m-ger" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2F6F6C"/></marker>
      <marker id="m-usa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#694C84"/></marker>
      <marker id="m-jpn" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.2" markerHeight="5.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#9B5269"/></marker>
    </defs>
'''

def lanes(specs, width=390):
    """specs: (top, height, rgb, lines[], dot_y) -- 地域は箱ではなく極薄の帯"""
    bands, seps, labels = [], [], []
    for top, h, rgb, lines, dot in specs:
        bands.append('      <rect x="0" y="%s" width="%s" height="%s" fill="%s" fill-opacity="0.045"/>' % (top, width, h, rgb))
        seps.append('      <line x1="0" y1="%s.5" x2="%s" y2="%s.5"/>' % (top, width, top))
        labels.append('      <circle cx="14" cy="%s" r="2.6" fill="%s"/>' % (dot, rgb))
        for i, (t, y, full) in enumerate(lines):
            ttl = '<title>%s</title>' % full if full else ''
            labels.append('      <text x="24" y="%s">%s%s</text>' % (y, ttl, t))
    return ('    <g>\n' + '\n'.join(bands) + '\n    </g>\n'
            + '    <g stroke="#D6D2C8" stroke-opacity="0.5" stroke-width="1">\n' + '\n'.join(seps) + '\n    </g>\n'
            + '    <line x1="88.5" y1="0" x2="88.5" y2="%s" stroke="#D6D2C8" stroke-opacity="0.7" stroke-width="1"/>\n' % (specs[-1][0]+specs[-1][1])
            + '    <g font-size="10" fill="#5C5C60">\n' + '\n'.join(labels) + '\n    </g>\n')

def axis(ticks, brk=None, extra=''):
    tx = '\n'.join('      <text x="%s" y="25">%s</text>' % (x, t) for x, t in ticks)
    tm = '\n'.join('      <line x1="%s" y1="31" x2="%s" y2="36"/>' % (x, x) for x, t in ticks if t.isdigit())
    b = ''
    if brk:
        b = ('    <g stroke="#6B6A68" stroke-width="1" stroke-linecap="round" opacity="0.55">\n'
             '      <line x1="%s" y1="36" x2="%s" y2="29"/><line x1="%s" y1="36" x2="%s" y2="29"/>\n    </g>\n'
             % (brk, brk+4, brk+3, brk+7))
    return ('    <text x="12" y="25" font-size="9" font-weight="650" letter-spacing="0.12em" fill="#6B6A68">年代表</text>\n'
            '    <g font-size="9.5" fill="#6B6A68" text-anchor="middle" font-variant-numeric="tabular-nums">\n'
            + tx + '\n    </g>\n    <g stroke="#D6D2C8" stroke-width="1">\n' + tm + '\n    </g>\n' + b + extra)

def stations(items, r=6.5, w=2.6):
    out = []
    for x, y, c in items:
        out.append('      <circle cx="%s" cy="%s" r="%s" fill="#F6F4EF" stroke="%s" stroke-width="%s"/>'
                   '<circle cx="%s" cy="%s" r="2.4" fill="%s"/>' % (x, y, r, c, w, x, y, c))
    return '    <g>\n' + '\n'.join(out) + '\n    </g>\n'

def labels(items, size=12, weight=600):
    """駅名は紙色のハローを敷いて線から切り離す（metro mapの常套手段）"""
    out = []
    for it in items:
        x, y, t = it[0], it[1], it[2]
        anchor = ' text-anchor="end"' if len(it) > 3 and it[3] == 'end' else ''
        out.append('      <text x="%s" y="%s"%s>%s</text>' % (x, y, anchor, t))
    return ('    <g font-size="%s" font-weight="%s" fill="#1C1C1E" dominant-baseline="middle"\n'
            '       stroke="#F6F4EF" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke fill">\n'
            % (size, weight) + '\n'.join(out) + '\n    </g>\n')


def chips(items):
    """関係ラベルも矩形の板ではなくハローで置く。板が増えると図が散らかる"""
    out = []
    for x, y, t, c in items:
        out.append('      <text x="%s" y="%s" fill="%s">%s</text>' % (x, y + 11, c, t))
    return ('    <g font-size="10" font-weight="700" stroke="#F6F4EF" stroke-width="4"\n'
            '       stroke-linejoin="round" paint-order="stroke fill">\n'
            + '\n'.join(out) + '\n    </g>\n')
