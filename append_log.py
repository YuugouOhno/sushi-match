import json

log_path = "/Users/yuugou/yuugou/logs/cc/sushi-match/log.jsonl"

entries = [
    {
        "timestamp": "2026-03-15T00:57:23",
        "title": "二人を比較タブ追加・相性可視化コンポーネント実装",
        "category": "実装",
        "changes": [
            {
                "file": "/Users/yuugou/dev/personal/sushi-match/index.html",
                "description": "二人を比較タブを追加。スコアサマリーカード・ネタ別順位比較ドットプロット・3指標横棒グラフを実装し、相性の視覚的可視化機能を追加"
            }
        ],
        "decisions": [
            {
                "what": "新タブとして比較・可視化UIを独立させた",
                "why": "既存の並べ替え・診断機能と分離することで操作フローが明確になり、UX上の混乱を避けられる",
                "alternatives": "同一タブ内にインライン展開する案もあったが、コンテンツ量が多く視認性が下がるため別タブが適切"
            },
            {
                "what": "スコア指標を順位差・上位3件一致・順序一致の3軸で可視化",
                "why": "単一スコアではどこが似ているかが伝わらないため、ユーザーが自分たちの嗜好の類似点を具体的に把握できるよう多軸表示を採用",
                "alternatives": "総合スコアのみ表示する簡素な案もあったが、要件定義の複合指標方針と整合しないため採用しなかった"
            }
        ]
    },
    {
        "timestamp": "2026-03-15T00:57:24",
        "title": "いらすとや寿司イラスト取得・UIへの適用",
        "category": "実装",
        "changes": [
            {
                "file": "/Users/yuugou/dev/personal/sushi-match/index.html",
                "description": "いらすとやの寿司ネタイラスト10種をpublic/ディレクトリにダウンロードし、HTMLのネタ表示部分をイラスト画像に置き換え。未配布ネタは代替ネタに変更して10種を確保"
            }
        ],
        "decisions": [
            {
                "what": "いらすとやのイラストを使用し、対応するネタがない場合は別ネタに差し替えた",
                "why": "ユーザー指定のイラスト素材サイトに従い、かつ10種類の枠を維持するため、ラインナップを素材の有無に合わせて調整した",
                "alternatives": "代替ネタではなくプレースホルダー表示のままにする案もあったが、見た目の完成度を優先してネタ自体を差し替えた"
            },
            {
                "what": "イラスト画像をpublic/に配置してHTMLから相対パスで参照",
                "why": "単一HTMLファイルとしての構成を維持しながら、外部リソースとして画像を管理する最もシンプルな方法",
                "alternatives": "Base64でHTML内にインライン埋め込みする案もあったがファイルサイズが肥大化するため採用しなかった"
            }
        ]
    }
]

with open(log_path, "a", encoding="utf-8") as f:
    for entry in entries:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

print("Done: 2 entries appended")
