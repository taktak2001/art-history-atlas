# Network View Modes — 設計キャンバス

関係ネットワークを「情報量の3段階」ではなく「閲覧目的の3種類」で設計し直したときの
モックアップ。mobile 390px。

- `Main.dc.html` — OVERVIEW（美術史全体はどう流れたかを眺める）
- `Study.dc.html` — STUDY（この時代の関係を読む。日常利用の標準）
- `Focus.dc.html` — FOCUS（選んだムーブメントを理解する）
- `canvas.json` — 配置と、決めた規則の注記

実装は `src/lib/network-mode.ts` と `src/components/NetworkGraph.tsx`。
数値（1-hop 100% / 2-hop 45% / 背景 13%、主幹線 55% / その他 28%）は
`src/app/globals.css` の `[data-node-emphasis]` / `[data-edge-emphasis]` に集約している。

`_gen*.py` / `_build*.py` は初回のアートボード生成に使った補助スクリプト。
以後の変更は `.dc.html` を直接編集する。
