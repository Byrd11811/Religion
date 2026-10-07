"""Build the reviewed Mesopotamian catalog and ORACC transliteration selection.

The large upstream ORACC archives are deliberately not committed.  This
script validates their embedded CC0 declarations, retains the exact subset
used by Atlas (including hashes and catalog fields), and deterministically
regenerates the portable seed files from that retained subset.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
TRADITION_ID = "ancient-mesopotamia-sumer-akkad-babylon-assyria"
TRADITION = "Ancient Mesopotamia / Sumer / Akkad / Babylon / Assyria"
LITERARY_ARCHIVE_URL = "https://oracc.museum.upenn.edu/json/epsd2-literary.zip"
QCAT_ARCHIVE_URL = "https://oracc.museum.upenn.edu/json/qcat.zip"
CC0_URL = "https://creativecommons.org/publicdomain/zero/1.0/"
LITERARY_RETAINED = ROOT / "data/open-data/oracc-epsd2-literary-selected.json"
QCAT_RETAINED = ROOT / "data/open-data/oracc-qcat-selected.json"


def q(number: int) -> str:
    return f"Q{number:06d}"


# One row is one named composition or historically transmitted corpus.  A
# multi-tablet series remains one work; its internal tablets never inflate the
# work count.
NEW_WORKS: list[dict[str, Any]] = [
    {"id": "enki-and-ninmah", "title": "Enki and Ninmah", "qids": [q(333)], "category": "Mythological narrative", "themes": ["creation"]},
    {"id": "enki-journey-nippur", "title": "Enki's Journey to Nippur", "qids": [q(335)], "category": "Mythological narrative", "themes": ["ritual"]},
    {"id": "enlil-and-ninlil", "title": "Enlil and Ninlil", "qids": [q(336)], "category": "Mythological narrative", "themes": []},
    {"id": "enlil-and-sud", "title": "Enlil and Sud", "qids": [q(337)], "category": "Mythological narrative", "themes": []},
    {"id": "inanna-and-enki", "title": "Inanna and Enki", "qids": [q(338)], "category": "Mythological narrative", "themes": ["wisdom"]},
    {"id": "inanna-and-ebih", "title": "Inanna and Ebih", "qids": [q(339)], "category": "Mythological narrative", "themes": ["war"]},
    {"id": "inanna-and-shukaletuda", "title": "Inanna and Shukaletuda", "qids": [q(340)], "category": "Mythological narrative", "themes": ["judgment"]},
    {"id": "inanna-and-gudam", "title": "Inanna and Gudam", "qids": [q(341)], "category": "Mythological narrative", "themes": []},
    {"id": "inanna-and-an", "title": "Inanna and An", "qids": [q(342)], "category": "Mythological narrative", "themes": []},
    {"id": "dumuzid-and-geshtinanna", "title": "Dumuzid and Geshtinanna", "qids": [q(344)], "category": "Mythological narrative", "themes": ["afterlife"]},
    {"id": "dumuzid-and-his-sisters", "title": "Dumuzid and His Sisters", "qids": [q(345)], "category": "Mythological narrative", "themes": ["afterlife"]},
    {"id": "dumuzid-dream", "title": "Dumuzid's Dream", "qids": [q(347)], "category": "Mythological narrative", "themes": ["death"]},
    {"id": "inanna-and-bilulu", "title": "Inanna and Bilulu", "qids": [q(348)], "category": "Mythological narrative / hymn", "themes": ["ritual"]},
    {"id": "nanna-journey-nippur", "title": "Nanna-Suen's Journey to Nippur", "qids": [q(349)], "category": "Mythological narrative", "themes": ["ritual"]},
    {"id": "ninurta-return-nippur", "title": "Ninurta's Return to Nippur", "qids": [q(350)], "category": "Divine hymn / narrative", "themes": ["war"]},
    {"id": "ninurta-exploits", "title": "Ninurta's Exploits", "qids": [q(351)], "category": "Mythological narrative", "themes": ["war"]},
    {"id": "ningishzida-journey-netherworld", "title": "Ningishzida's Journey to the Netherworld", "qids": [q(356)], "category": "Mythological narrative", "themes": ["afterlife"]},
    {"id": "how-grain-came-to-sumer", "title": "How Grain Came to Sumer", "qids": [q(358)], "category": "Mythological narrative", "themes": ["creation"]},
    {"id": "gilgamesh-and-aga", "title": "Gilgamesh and Aga", "qids": [q(361)], "category": "Heroic narrative", "themes": ["war"]},
    {"id": "gilgamesh-and-bull-of-heaven", "title": "Gilgamesh and the Bull of Heaven", "qids": [q(362)], "category": "Heroic narrative", "themes": ["death"]},
    {"id": "death-of-gilgamesh", "title": "The Death of Gilgamesh", "qids": [q(363)], "category": "Heroic narrative", "themes": ["afterlife", "death"]},
    {"id": "gilgamesh-enkidu-netherworld", "title": "Gilgamesh, Enkidu and the Netherworld", "qids": [q(364)], "category": "Heroic narrative", "themes": ["afterlife"]},
    {"id": "gilgamesh-and-huwawa", "title": "Gilgamesh and Huwawa", "qids": [q(365), q(366)], "category": "Heroic narrative", "themes": ["death"]},
    {"id": "lugalbanda-mountain-cave", "title": "Lugalbanda in the Mountain Cave", "qids": [q(367)], "category": "Heroic narrative", "themes": []},
    {"id": "lugalbanda-anzud-bird", "title": "Lugalbanda and the Anzud Bird", "qids": [q(368)], "category": "Heroic narrative", "themes": []},
    {"id": "enmerkar-lord-aratta", "title": "Enmerkar and the Lord of Aratta", "qids": [q(369)], "category": "Heroic narrative", "themes": ["kingship"]},
    {"id": "enmerkar-ensuhgiranna", "title": "Enmerkar and Ensuhgiranna", "qids": [q(370)], "category": "Heroic narrative", "themes": ["kingship"]},
    {"id": "rulers-of-lagash", "title": "The Rulers of Lagash", "qids": [q(372)], "category": "Historiographic composition", "themes": ["kingship"]},
    {"id": "history-of-tummal", "title": "The History of the Tummal", "qids": [q(373)], "category": "Historiographic composition", "themes": ["kingship"]},
    {"id": "cursing-of-agade", "title": "The Cursing of Agade", "qids": [q(375)], "category": "Historiographic composition", "themes": ["judgment", "kingship"]},
    {"id": "victory-of-utu-hegal", "title": "The Victory of Utu-hegal", "qids": [q(376)], "category": "Historiographic composition", "themes": ["war", "kingship"]},
    {"id": "lament-sumer-and-ur", "title": "The Lament for Sumer and Ur", "qids": [q(380)], "category": "City lament", "themes": ["suffering"]},
    {"id": "death-of-ur-namma", "title": "The Death of Ur-Namma", "qids": [q(386)], "category": "Royal praise poetry", "themes": ["afterlife", "death", "kingship"]},
    {"id": "exaltation-of-inanna", "title": "The Exaltation of Inanna", "qids": [q(623)], "category": "Divine hymn", "themes": ["ritual"]},
    {"id": "enlil-in-ekur", "title": "Enlil in the Ekur", "qids": [q(619)], "category": "Divine hymn", "themes": ["ritual"]},
    {"id": "sumerian-temple-hymns", "title": "The Sumerian Temple Hymns", "qids": [q(750)], "category": "Temple hymn collection", "themes": ["ritual"]},
    {"id": "kesh-temple-hymn", "title": "The Kesh Temple Hymn", "qids": [q(751)], "category": "Temple hymn", "themes": ["ritual"]},
    {"id": "shrines-of-inanna", "title": "The Shrines of Inanna", "qids": [q(753)], "category": "Temple hymn", "themes": ["ritual"]},
    {"id": "hymn-to-ninkasi", "title": "A Hymn to Ninkasi", "qids": [q(714)], "category": "Divine hymn", "themes": ["ritual"]},
    {"id": "hymn-to-nungal", "title": "A Hymn to Nungal", "qids": [q(736)], "category": "Divine hymn", "themes": ["judgment"]},
    {"id": "debate-hoe-and-plough", "title": "The Debate Between Hoe and Plough", "qids": [q(760)], "category": "Debate poem", "themes": ["wisdom"]},
    {"id": "debate-grain-and-sheep", "title": "The Debate Between Grain and Sheep", "qids": [q(761)], "category": "Debate poem", "themes": ["wisdom"]},
    {"id": "debate-winter-and-summer", "title": "The Debate Between Winter and Summer", "qids": [q(762)], "category": "Debate poem", "themes": ["wisdom"]},
    {"id": "debate-bird-and-fish", "title": "The Debate Between Bird and Fish", "qids": [q(764)], "category": "Debate poem", "themes": ["wisdom"]},
    {"id": "song-of-the-hoe", "title": "The Song of the Hoe", "qids": [q(778)], "category": "Song / literary composition", "themes": ["creation"]},
    {"id": "nergal-and-ereshkigal", "title": "Nergal and Ereshkigal", "group": "nergal-ereshkigal", "category": "Akkadian mythological narrative", "themes": ["afterlife"]},
    {"id": "erra-and-ishum", "title": "Erra and Ishum", "group": "erra-ishum", "category": "Akkadian mythological poem", "themes": ["war", "suffering"]},
    {"id": "anzu-epic", "title": "The Anzu Epic", "group": "anzu", "category": "Akkadian heroic myth", "themes": ["wisdom", "war"]},
    {"id": "etana-epic", "title": "The Epic of Etana", "group": "etana", "category": "Akkadian epic", "themes": ["kingship"]},
    {"id": "creation-of-mankind", "title": "The Creation of Mankind", "group": "creation-mankind", "category": "Mythological narrative", "themes": ["creation"]},
    {"id": "maqlu-series", "title": "Maqlu", "group": "maqlu", "category": "Incantation and ritual series", "themes": ["evil", "ritual"]},
    {"id": "dialogue-of-pessimism", "title": "The Dialogue of Pessimism", "group": "dialogue-pessimism", "category": "Wisdom dialogue", "themes": ["wisdom"]},
    {"id": "marduk-ordeal", "title": "The Marduk Ordeal", "group": "marduk-ordeal", "category": "Cultic explanatory work", "themes": ["ritual"]},
    {"id": "babylonian-king-list", "title": "The Babylonian King List", "group": "babylonian-king-list", "category": "King list / historiographic composition", "themes": ["kingship"]},
    {"id": "an-anum-god-list", "title": "An = Anum God List", "group": "an-anum", "category": "Lexical god list", "themes": ["wisdom"]},
    {"id": "enuma-anu-enlil", "title": "Enuma Anu Enlil", "group": "enuma-anu-enlil", "category": "Celestial omen series", "themes": ["wisdom"]},
    {"id": "shumma-alu", "title": "Shumma Alu", "group": "shumma-alu", "category": "Terrestrial omen series", "themes": ["wisdom"]},
    {"id": "sakikku", "title": "Sakikku Diagnostic Handbook", "group": "sakikku", "category": "Diagnostic omen series", "themes": ["wisdom"]},
    {"id": "shumma-izbu", "title": "Shumma Izbu", "group": "shumma-izbu", "category": "Birth omen series", "themes": ["wisdom"]},
    {"id": "barutu", "title": "Barutu", "group": "barutu", "category": "Extispicy omen series", "themes": ["ritual", "wisdom"]},
    {"id": "gudea-cylinders", "title": "The Gudea Cylinders", "special": "gudea", "category": "Royal temple-building inscription", "themes": ["ritual", "kingship"]},
    {"id": "assyrian-royal-religious-inscriptions", "title": "Assyrian Royal Religious Inscriptions", "special": "rinap", "category": "Royal inscription research corpus", "themes": ["ritual", "kingship", "war"]},
]


EXISTING: dict[str, dict[str, Any]] = {
    "epic-of-gilgamesh": {"special": "gilgamesh-study"},
    "enuma-elish": {"group": "enuma-elish", "category": "Akkadian creation epic", "themes": ["creation"]},
    "atrahasis-epic": {"special": "atrahasis", "category": "Akkadian mythological epic", "themes": ["creation", "flood", "suffering"]},
    "eridu-genesis": {"qids": [q(357)], "category": "Sumerian flood narrative", "themes": ["creation", "flood"]},
    "descent-of-inanna": {"qids": [q(343)], "category": "Sumerian mythological narrative", "themes": ["afterlife", "death"]},
    "descent-of-ishtar": {"special": "ishtar-descent", "category": "Akkadian mythological narrative", "themes": ["afterlife", "death"]},
    "sumerian-king-list": {"qids": [q(371)], "category": "King list / historiographic composition", "themes": ["kingship"]},
    "instructions-of-shuruppak": {"qids": [q(782)], "category": "Sumerian wisdom instruction", "themes": ["wisdom"]},
    "enki-and-ninhursag": {"qids": [q(332)], "category": "Sumerian mythological narrative", "themes": ["creation"]},
    "enki-and-the-world-order": {"qids": [q(334)], "category": "Sumerian mythological narrative", "themes": ["creation", "kingship"]},
    "lament-for-ur": {"qids": [q(379)], "category": "Sumerian city lament", "themes": ["suffering"]},
    "ludlul-bel-nemeqi": {"group": "ludlul", "category": "Akkadian wisdom poem", "themes": ["suffering", "wisdom"]},
    "babylonian-theodicy": {"special": "theodicy", "category": "Akkadian wisdom dialogue", "themes": ["suffering", "wisdom"]},
    "code-of-hammurabi": {"group": "hammurabi-laws", "category": "Royal law collection", "themes": ["law", "judgment", "kingship"]},
    "adapa-myth": {"group": "adapa", "category": "Akkadian mythological narrative", "themes": ["wisdom"]},
}

EXISTING_TITLES = {
    "epic-of-gilgamesh": "Epic of Gilgamesh",
    "enuma-elish": "Enuma Elish",
    "atrahasis-epic": "Atrahasis Epic",
    "eridu-genesis": "Eridu Genesis",
    "descent-of-inanna": "Descent of Inanna",
    "descent-of-ishtar": "Descent of Ishtar",
    "sumerian-king-list": "Sumerian King List",
    "instructions-of-shuruppak": "Instructions of Shuruppak",
    "enki-and-ninhursag": "Enki and Ninhursag",
    "enki-and-the-world-order": "Enki and the World Order",
    "lament-for-ur": "Lament for Ur",
    "ludlul-bel-nemeqi": "Ludlul bel nemeqi",
    "babylonian-theodicy": "Babylonian Theodicy",
    "code-of-hammurabi": "Code of Hammurabi",
    "adapa-myth": "Adapa Myth",
}


SELECTED_EDITIONS: dict[str, str] = {
    "enki-and-ninhursag": q(332),
    "enki-and-ninmah": q(333),
    "enki-and-the-world-order": q(334),
    "enki-journey-nippur": q(335),
    "enlil-and-ninlil": q(336),
    "enlil-and-sud": q(337),
    "inanna-and-enki": q(338),
    "inanna-and-ebih": q(339),
    "inanna-and-shukaletuda": q(340),
    "descent-of-inanna": q(343),
    "dumuzid-dream": q(347),
    "ninurta-exploits": q(351),
    "eridu-genesis": q(357),
    "gilgamesh-and-aga": q(361),
    "death-of-gilgamesh": q(363),
    "gilgamesh-enkidu-netherworld": q(364),
    "gilgamesh-and-huwawa": q(365),
    "lugalbanda-mountain-cave": q(367),
    "lugalbanda-anzud-bird": q(368),
    "enmerkar-lord-aratta": q(369),
    "sumerian-king-list": q(371),
    "cursing-of-agade": q(375),
    "lament-for-ur": q(379),
    "lament-sumer-and-ur": q(380),
    "debate-winter-and-summer": q(762),
    "instructions-of-shuruppak": q(782),
}


GROUP_RULES = {
    "nergal-ereshkigal": lambda v: v.get("id_composite") == q(2884),
    "erra-ishum": lambda v: str(v.get("designation", "")).startswith("Erra and Išum "),
    "anzu": lambda v: str(v.get("designation", "")).startswith("SB Anzu "),
    "etana": lambda v: "Epic of Etana" in str(v.get("designation", "")),
    "creation-mankind": lambda v: v.get("id_composite") == q(2289),
    "maqlu": lambda v: str(v.get("designation", "")).startswith(("Maqlû ", "Maqlu ")),
    "dialogue-pessimism": lambda v: v.get("id_composite") == q(9235),
    "marduk-ordeal": lambda v: v.get("id_composite") == q(9250),
    "babylonian-king-list": lambda v: v.get("id_composite") == q(2506),
    "an-anum": lambda v: str(v.get("designation", "")).startswith("An Anum "),
    "enuma-anu-enlil": lambda v: str(v.get("designation", "")).startswith("Enuma Anu Enlil "),
    "shumma-alu": lambda v: str(v.get("designation", "")).startswith("Šumma Alu "),
    "sakikku": lambda v: str(v.get("designation", "")).startswith("Sakikku "),
    "shumma-izbu": lambda v: str(v.get("designation", "")).startswith("Šumma Izbu "),
    "barutu": lambda v: str(v.get("designation", "")).startswith("SB Barutu "),
    "enuma-elish": lambda v: str(v.get("designation", "")).startswith("Enuma Eliš "),
    "ludlul": lambda v: str(v.get("designation", "")).startswith("Ludlul "),
    "hammurabi-laws": lambda v: v.get("id_composite") == q(614),
    "adapa": lambda v: v.get("id_composite") == q(2295),
}


ANUNNA_EVIDENCE = [
    (q(333), "4", "enki-and-ninmah"),
    (q(334), "8", "enki-and-the-world-order"),
    (q(337), "Ver.1, Seg.A, 39", "enlil-and-sud"),
    (q(339), "88", "inanna-and-ebih"),
    (q(343), "167", "descent-of-inanna"),
    (q(351), "72", "ninurta-exploits"),
    (q(367), "Seg.A, 428", "lugalbanda-mountain-cave"),
    (q(368), "82", "lugalbanda-anzud-bird"),
    (q(379), "152", "lament-for-ur"),
]


WITNESS_SPECS = [
    ("P260875", "CBS 04561", "Penn Museum, Philadelphia", "Nippur (modern Nuffar)", -1900, -1600, ["enki-and-ninhursag"], q(332), ["Sumerian"], "Tablet"),
    ("P259234", "CBS 02168 + CBS 02202 + CBS 11327 + CBS 12738 + CBS 13386 + N 1889", "Penn Museum, Philadelphia", "Nippur (modern Nuffar)", -1900, -1600, ["enki-and-ninmah"], q(333), ["Sumerian"], "Tablet"),
    ("P268601", "CBS 13571 + CBS 13602 + CBS 13617 + CBS 13623 + CBS 13629 + N 3276 + N 4838 (+) N 6278", "Penn Museum, Philadelphia", "Nippur (modern Nuffar)", -1900, -1600, ["inanna-and-enki"], q(338), ["Sumerian"], "Tablet"),
    ("P264321", "CBS 06894", "Penn Museum, Philadelphia", "Nippur (modern Nuffar)", -1900, -1600, ["descent-of-inanna"], q(343), ["Sumerian"], "Tablet"),
    ("P223705", "IM 124648", "National Museum of Iraq, Baghdad", "Sippar-Yahrurum (modern Tell Abu Habbah)", -626, -539, ["ninurta-exploits"], q(351), ["Sumerian", "Akkadian"], "Tablet"),
    ("P252033", "MS 3027", "Schøyen Collection, Oslo", None, -1900, -1600, ["death-of-gilgamesh"], q(363), ["Sumerian"], "Tablet"),
    ("P101741", "IM 090106", "National Museum of Iraq, Baghdad", "Nippur (modern Nuffar)", -1900, -1600, ["lugalbanda-mountain-cave"], q(367), ["Sumerian"], "Tablet"),
    ("P255183", "N 3623 + N 7457 + Ist Ni 09601 + UM 29-13-194", "Istanbul Archaeological Museums and Penn Museum", "Nippur (modern Nuffar)", -1900, -1600, ["enmerkar-lord-aratta"], q(369), ["Sumerian"], "Joined tablet"),
    ("P384786", "Ashm 1923-0444", "Ashmolean Museum, Oxford", None, -1900, -1600, ["sumerian-king-list"], q(371), ["Sumerian"], "Prism"),
    ("P010233", "IM 070204 +", "National Museum of Iraq, Baghdad", "uncertain (modern Abu Salabikh)", -2600, -2500, ["instructions-of-shuruppak"], q(782), ["Sumerian"], "Tablet"),
]


def sha(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def validate_cc0(metadata: dict[str, Any], expected_project: str) -> None:
    if metadata.get("project") != expected_project:
        raise ValueError(f"Unexpected ORACC project: {metadata.get('project')}")
    if metadata.get("license-url") != CC0_URL or "CC0" not in metadata.get("license", ""):
        raise ValueError(f"{expected_project} archive does not declare CC0")


def extract_lines(document: dict[str, Any]) -> list[dict[str, str]]:
    lines: list[dict[str, str]] = []
    current: str | None = None
    tokens: list[str] = []

    def flush() -> None:
        nonlocal current, tokens
        if current is not None and tokens:
            lines.append({"label": current, "text": " ".join(tokens)})
        current, tokens = None, []

    def walk(value: Any) -> None:
        nonlocal current
        if isinstance(value, list):
            for item in value:
                walk(item)
            return
        if not isinstance(value, dict):
            return
        if value.get("node") == "d" and value.get("type") == "line-start":
            flush()
            current = str(value.get("label") or value.get("n") or value.get("ref", "").split(".")[-1])
            return
        if value.get("node") == "l":
            form = (value.get("f") or {}).get("form")
            if form:
                tokens.append(str(form))
            return
        for key, child in value.items():
            if key not in {"f", "props"}:
                walk(child)

    walk(document.get("cdl", []))
    flush()
    return lines


def refresh_retained(literary_archive: Path, qcat_archive: Path) -> None:
    with zipfile.ZipFile(literary_archive) as archive:
        metadata = json.loads(archive.read("epsd2/literary/metadata.json"))
        validate_cc0(metadata, "epsd2/literary")
        catalog = json.loads(archive.read("epsd2/literary/catalogue.json"))["members"]
        all_epsd_qids = sorted(
            {
                qid
                for spec in [*NEW_WORKS, *EXISTING.values()]
                for qid in spec.get("qids", [])
            }
        )
        epsd_catalog_rows = [
            dict(catalog[qid], id_composite=qid) for qid in all_epsd_qids
        ]
        qids = sorted(set(SELECTED_EDITIONS.values()))
        works = []
        for qid in qids:
            raw = archive.read(f"epsd2/literary/corpusjson/{qid}.json")
            document = json.loads(raw)
            lines = extract_lines(document)
            if not lines:
                raise ValueError(f"No transliteration lines extracted for {qid}")
            entry = catalog[qid]
            works.append(
                {
                    "qId": qid,
                    "title": entry.get("designation"),
                    "sourceUrl": f"https://oracc.museum.upenn.edu/epsd2/literary/{qid}",
                    "sourceJsonSha256": sha(raw),
                    "catalog": {key: entry.get(key) for key in ["period", "genre", "subgenre", "provenience", "distribution", "sources", "keywords"]},
                    "lines": lines,
                }
            )
        write_json(
            LITERARY_RETAINED,
            {
                "formatVersion": 1,
                "sourceArchive": LITERARY_ARCHIVE_URL,
                "archiveSha256": sha(literary_archive.read_bytes()),
                "projectMetadata": {key: metadata.get(key) for key in ["project", "source", "license", "license-url", "UTC-timestamp"]},
                "extraction": "Document-order ORACC line-start labels and lexical f.form values; no translation or single-witness diplomatic text inferred.",
                "works": works,
            },
        )

    with zipfile.ZipFile(qcat_archive) as archive:
        metadata = json.loads(archive.read("qcat/metadata.json"))
        validate_cc0(metadata, "qcat")
        catalog = json.loads(archive.read("qcat/catalogue.json"))["members"]
        groups: dict[str, list[dict[str, Any]]] = {}
        for name, rule in GROUP_RULES.items():
            rows = [dict(value, id_composite=value.get("id_composite", key)) for key, value in catalog.items() if rule(dict(value, id_composite=value.get("id_composite", key)))]
            rows.sort(key=lambda row: row["id_composite"])
            if not rows:
                raise ValueError(f"No Q Catalogue rows selected for {name}")
            groups[name] = rows
        groups["epsd-catalog"] = epsd_catalog_rows
        write_json(
            QCAT_RETAINED,
            {
                "formatVersion": 1,
                "sourceArchive": QCAT_ARCHIVE_URL,
                "archiveSha256": sha(qcat_archive.read_bytes()),
                "projectMetadata": {key: metadata.get(key) for key in ["project", "source", "license", "license-url", "UTC-timestamp"]},
                "groups": groups,
            },
        )


def period_summary(periods: list[str]) -> str:
    unique = list(dict.fromkeys(p for p in periods if p))
    return ", ".join(unique) if unique else "period not supplied"


def epsd_record(spec: dict[str, Any], catalog: dict[str, Any], edition_id: str | None) -> dict[str, Any]:
    qids = spec["qids"]
    first = catalog[qids[0]]
    identifiers = ", ".join(qids)
    period = period_summary([catalog[qid].get("period", "") for qid in qids])
    distribution = first.get("distribution") or first.get("provenience") or "not supplied"
    witness_ids = sorted({pid for qid in qids for pid in str(catalog[qid].get("sources") or "").split() if pid.startswith("P")})
    source_url = f"https://oracc.museum.upenn.edu/epsd2/literary/{qids[0]}"
    source_status = "Reviewed CC0 Sumerian composite transliteration; no English translation bundled" if edition_id else "Reviewed ORACC composition metadata; no source text bundled"
    return {
        "category": spec.get("category", first.get("subgenre") or "Mesopotamian composition"),
        "canonStatus": "Ancient Mesopotamian composition; modern canon categories are not inferred.",
        "startDate": None,
        "endDate": None,
        "dateConfidence": f"ORACC catalogs the represented composite tradition as {period}; that witness-period label is not treated as a secure composition date.",
        "region": first.get("provenience") or "Mesopotamia",
        "lat": None,
        "lng": None,
        "languages": ["Sumerian"],
        "author": "Authorship is not identified in the cited ORACC composition record.",
        "description": f"{spec['title']} is registered by ORACC as {identifiers}. The catalog classifies it as {first.get('subgenre') or first.get('genre') or 'a literary composition'}.",
        "historicalContext": f"The ePSD2 literary catalog reports {period} transmission and the distribution/provenience summary “{distribution}”. These are catalog facts about the represented evidence, not proof of an original performance date.",
        "manuscripts": f"ORACC links {len(witness_ids)} distinct P-number source record{'s' if len(witness_ids) != 1 else ''} to {identifiers}. A Q identifier is a scholarly composite; it is not one physical tablet.",
        "themes": spec.get("themes", []),
        "sourceStatus": source_status,
        "copyright": "ORACC JSON data released under CC0 1.0; no English translation bundled" if edition_id else "Public metadata under ORACC CC0; edition rights not assessed",
        "sourceUrl": source_url,
        "metadataSources": [source_url, LITERARY_ARCHIVE_URL],
        "editionId": edition_id,
        "confidence": "B",
    }


def qcat_record(spec: dict[str, Any], groups: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    rows = groups[spec["group"]]
    qids = [row["id_composite"] for row in rows]
    first, last = qids[0], qids[-1]
    identifier_text = first if len(qids) == 1 else f"{len(qids)} Q records ({first} through {last} in the retained selection)"
    periods = period_summary([str(row.get("period") or "") for row in rows])
    genres = list(dict.fromkeys(str(row.get("subgenre") or row.get("genre") or "") for row in rows if row.get("subgenre") or row.get("genre")))
    source_url = f"https://oracc.museum.upenn.edu/qcat/{first}"
    return {
        "category": spec.get("category", genres[0] if genres else "Mesopotamian composition or corpus"),
        "canonStatus": "Ancient Mesopotamian composition or transmitted corpus; modern canon categories are not inferred.",
        "startDate": None,
        "endDate": None,
        "dateConfidence": f"The retained ORACC Q Catalogue rows report {periods}; those are catalog period labels and are not converted into an unsupported composition range.",
        "region": next((str(row.get("place")) for row in rows if row.get("place")), "Mesopotamia"),
        "lat": None,
        "lng": None,
        "languages": [],
        "author": "Authorship is not identified in the retained Q Catalogue metadata.",
        "description": f"{spec['title']} is represented in the ORACC Q Catalogue by {identifier_text}. The retained rows classify it as {', '.join(genres) if genres else 'a cataloged Mesopotamian textual corpus'}.",
        "historicalContext": f"The Q Catalogue supplies registry-level identifiers and period/genre metadata ({periods}). Atlas does not infer a complete edition, a single witness, or a composition date from those rows.",
        "manuscripts": f"Registry scope: {len(qids)} composition/tablet-section identifier{'s' if len(qids) != 1 else ''}: {', '.join(qids[:8])}{' …' if len(qids) > 8 else ''}. Physical witnesses require separate P-number records.",
        "themes": spec.get("themes", []),
        "sourceStatus": "Reviewed ORACC Q Catalogue metadata; no source text bundled",
        "copyright": "Public metadata under ORACC CC0; edition rights not assessed",
        "sourceUrl": source_url,
        "metadataSources": [source_url, QCAT_ARCHIVE_URL],
        "editionId": None,
        "confidence": "B",
    }


def special_record(spec: dict[str, Any]) -> dict[str, Any]:
    kind = spec["special"]
    if kind == "gudea":
        return {
            "category": spec["category"], "canonStatus": "Royal votive and commemorative inscription; modern canon categories are not inferred.",
            "startDate": -2120, "endDate": -2110, "dateConfidence": "Louvre object record dates Cylinders A and B to approximately 2120–2110 BCE; this range applies to the physical inscriptions.",
            "region": "Girsu (modern Tello)", "lat": None, "lng": None, "languages": ["Sumerian"],
            "author": "Royal inscription of Gudea; individual scribal authorship is not identified.",
            "description": "The paired Gudea Cylinders describe the building of Ningirsu's temple. ORACC registers the composition as Q000377; the Louvre catalogs Cylinders A and B as separate terracotta objects.",
            "historicalContext": "The record joins the named composition for research while keeping its two surviving museum objects distinct. It does not split columns or episodes into separate works.",
            "manuscripts": "Cylinder A: Louvre MNB 1512. Cylinder B: Louvre MNB 1511. ORACC composite Q000377 presents Cylinders A and B.",
            "themes": spec["themes"], "sourceStatus": "Reviewed ORACC and Louvre metadata; no text bundled", "copyright": "Metadata links only; reproduction rights assessed at the source", 
            "sourceUrl": "https://oracc.museum.upenn.edu/etcsri/Q000377", "metadataSources": ["https://oracc.museum.upenn.edu/etcsri/Q000377", "https://collections.louvre.fr/en/ark:/53355/cl010124631"],
            "editionId": None, "confidence": "B",
        }
    if kind == "rinap":
        return {
            "category": spec["category"], "canonStatus": "Modern research corpus of royal inscriptions; not a single ancient canon or composition.",
            "startDate": None, "endDate": None, "dateConfidence": "Corpus-level record; ruler- and object-specific dates must be taken from individual RINAP inscriptions.",
            "region": "Assyria", "lat": None, "lng": None, "languages": [],
            "author": "Multiple Assyrian rulers and scribal producers; consult individual inscription records.",
            "description": "A research gateway to the Royal Inscriptions of the Neo-Assyrian Period, including inscriptions with religious invocations, temple work, ritual settings and claims of divine authorization.",
            "historicalContext": "This corpus-level record makes Assyrian religious inscriptions discoverable without pretending that a multi-reign project is one authored work.",
            "manuscripts": "Many separately cataloged inscriptions and objects; use RINAP identifiers and individual object records for witness claims.",
            "themes": spec["themes"], "sourceStatus": "Reviewed ORACC project metadata; no source text bundled", "copyright": "Metadata link only; edition rights vary by RINAP record", 
            "sourceUrl": "https://oracc.museum.upenn.edu/rinap/", "metadataSources": ["https://oracc.museum.upenn.edu/rinap/", "https://oracc.museum.upenn.edu/projectlist.html"],
            "editionId": None, "confidence": "B",
        }
    raise ValueError(kind)


def unresolved_existing(record_id: str, spec: dict[str, Any]) -> dict[str, Any]:
    sources = {
        "gilgamesh-study": ["https://www.gutenberg.org/ebooks/11000", "https://oracc.museum.upenn.edu/qcat/"],
        "atrahasis": ["https://oracc.museum.upenn.edu/amgg/Listofdeities/Igigi/index.html", "https://oracc.museum.upenn.edu/qcat/"],
        "ishtar-descent": ["https://oracc.museum.upenn.edu/amgg/Listofdeities/InanaIshtar/index.html", "https://oracc.museum.upenn.edu/qcat/"],
        "theodicy": ["https://oracc.museum.upenn.edu/qcat/"],
    }[spec["special"]]
    base = {
        "category": spec.get("category", "Mesopotamian composition"),
        "canonStatus": "Ancient Mesopotamian composition; modern canon categories are not inferred.",
        "startDate": None, "endDate": None,
        "dateConfidence": "Composition and witness dates require an edition-level source; no numeric date is inferred from the catalog title.",
        "region": "Mesopotamia", "lat": None, "lng": None, "languages": [],
        "author": "Authorship is not established by the cited catalog metadata.",
        "description": "A reviewed Mesopotamian research record. Atlas retains it as one composition and does not infer a complete text, witness dependency or modern interpretation from its title.",
        "historicalContext": "The linked scholarly catalog provides the current research entry point. Detailed recension, period and witness review remains edition-specific.",
        "manuscripts": "No physical witness is associated by this catalog-level review; add only a cited P-number or institutional object record.",
        "themes": spec.get("themes", []),
        "sourceStatus": "Reviewed scholarly metadata; no new source text bundled",
        "copyright": "Metadata links only; edition rights not assessed",
        "sourceUrl": sources[0], "metadataSources": sources, "editionId": None, "confidence": "C",
    }
    if record_id == "epic-of-gilgamesh":
        base.update({
            "description": "Ancient Mesopotamian epic represented here by a public-domain historical study with translated Old Babylonian selections. The bundled publication is not the complete Standard Babylonian Epic.",
            "sourceStatus": "Reviewed historical study and translated selections",
            "copyright": "Public-domain English edition (USA)",
            "sourceUrl": sources[0], "editionId": "pg-11000-epic-of-gilgamesh", "confidence": "B",
        })
    return base


def make_record(spec: dict[str, Any], literary_catalog: dict[str, Any], qcat_groups: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    edition_id = f"oracc-epsd2-{SELECTED_EDITIONS[spec['id']].lower()}" if spec["id"] in SELECTED_EDITIONS else None
    if "qids" in spec:
        detail = epsd_record(spec, literary_catalog, edition_id)
    elif "group" in spec:
        detail = qcat_record(spec, qcat_groups)
    else:
        detail = special_record(spec)
    return {"id": spec["id"], "title": spec["title"], "traditionId": TRADITION_ID, "tradition": TRADITION, **detail}


def build() -> None:
    literary = json.loads(LITERARY_RETAINED.read_text(encoding="utf-8"))
    qcat = json.loads(QCAT_RETAINED.read_text(encoding="utf-8"))
    validate_cc0(literary["projectMetadata"], "epsd2/literary")
    validate_cc0(qcat["projectMetadata"], "qcat")
    retained_works = {work["qId"]: work for work in literary["works"]}

    # Catalog records needed beyond the selected full-text subset are copied
    # from the retained qcat groups or derived from the selected literary rows.
    literary_catalog: dict[str, Any] = {}
    # The selected retained file contains full catalog fields for editions.
    for work in literary["works"]:
        literary_catalog[work["qId"]] = {"designation": work["title"], **work["catalog"]}
    # Non-edition ePSD rows were retained inside the Q Catalogue selection under
    # the special epsd-catalog group when the archive was refreshed.
    for row in qcat["groups"].get("epsd-catalog", []):
        literary_catalog[row["id_composite"]] = row

    all_epsd_qids = {qid for spec in [*NEW_WORKS, *EXISTING.values()] for qid in spec.get("qids", [])}
    missing = sorted(all_epsd_qids - literary_catalog.keys())
    if missing:
        raise ValueError(f"Retained source is missing ePSD catalog rows: {', '.join(missing)}")

    records = [make_record(spec, literary_catalog, qcat["groups"]) for spec in NEW_WORKS]
    if len(records) != 62:
        raise ValueError(f"Expected 62 additive records, got {len(records)}")

    overrides = []
    for record_id, spec in EXISTING.items():
        full_spec = {"id": record_id, "title": EXISTING_TITLES[record_id]}
        full_spec.update(spec)
        if "qids" in spec:
            detail = epsd_record(full_spec, literary_catalog, f"oracc-epsd2-{SELECTED_EDITIONS[record_id].lower()}" if record_id in SELECTED_EDITIONS else None)
        elif "group" in spec:
            detail = qcat_record(full_spec, qcat["groups"])
        else:
            detail = unresolved_existing(record_id, spec)
        detail["id"] = record_id
        detail.pop("title", None)
        overrides.append(detail)

    additions = {
        "overrides": overrides,
        "records": records,
        "transliterationWorks": [{"id": work_id} for work_id in sorted(SELECTED_EDITIONS)],
    }
    write_json(ROOT / "data/seed/mesopotamia-additions.json", additions)

    work_title = {record["id"]: record["title"] for record in records}
    # Existing titles are read from the catalog only for display-independent
    # edition metadata; the work ID remains the stable join.
    editions, passages = [], []
    for work_id, qid in SELECTED_EDITIONS.items():
        source = retained_works[qid]
        rendered_lines = [f"{line['label']}: {line['text']}" for line in source["lines"]]
        chunks = [rendered_lines[i : i + 20] for i in range(0, len(rendered_lines), 20)]
        edition_id = f"oracc-epsd2-{qid.lower()}"
        source_url = source["sourceUrl"]
        title = work_title.get(work_id, source["title"])
        editions.append({
            "id": edition_id,
            "textId": work_id,
            "title": f"{title} — ORACC ePSD2 {qid} composite transliteration",
            "translator": "ORACC ePSD2 editors (composite transliteration; no English translation)",
            "sourceUrl": source_url,
            "downloadUrl": LITERARY_ARCHIVE_URL,
            "license": "Public domain dedication: CC0 1.0 for the ORACC JSON data; source and scholarly responsibility retained.",
            "language": "Sumerian transliteration",
            "sha256": sha("\n".join(rendered_lines)),
            "passageCount": len(chunks),
            "complete": False,
            "note": f"Exact ORACC lexical forms and line labels extracted from the ePSD2 scholarly composite {qid}. This is not an English translation. It is not a diplomatic edition of one tablet. Damaged and reconstructed composite evidence requires consultation of the ORACC record; retained source JSON SHA-256: {source['sourceJsonSha256']}.",
        })
        for index, chunk in enumerate(chunks, 1):
            first_label = chunk[0].split(":", 1)[0]
            last_label = chunk[-1].split(":", 1)[0]
            content = "\n".join(chunk)
            passages.append({
                "id": f"{edition_id}-{index}", "textId": work_id, "editionId": edition_id, "sequence": index,
                "reference": f"ORACC {qid} lines {first_label}–{last_label}", "content": content, "sourceUrl": source_url,
                "themes": ["anunnaki"] if re.search(r"\{d\}a-nun-na(?:-ke₄)?", content, re.IGNORECASE) else [],
                "contentType": "Primary text",
            })
    write_json(ROOT / "data/seed/mesopotamia-editions.json", editions)
    write_json(ROOT / "data/seed/mesopotamia-passages.json", passages)

    witnesses = []
    for pid, inventory, repository, discovery, start, end, work_ids, qid, languages, object_type in WITNESS_SPECS:
        cdli = f"https://cdli.earth/{pid}"
        composite = f"https://oracc.museum.upenn.edu/epsd2/literary/{qid}"
        witnesses.append({
            "id": f"cdli-{pid.lower()}",
            "title": f"{inventory} ({pid})",
            "workIds": work_ids,
            "recensionId": None,
            "type": object_type,
            "inventoryNumber": inventory,
            "repository": repository,
            "discoveryLocation": discovery,
            "currentLocation": repository,
            "dateStart": start,
            "dateEnd": end,
            "dateNotes": f"CDLI period range for the physical object ({abs(start)}–{abs(end)} BCE); it does not date the composition or every layer of the ORACC composite.",
            "material": "Clay",
            "languages": languages,
            "scripts": ["Cuneiform"],
            "condition": None,
            "completeness": None,
            "provenance": f"CDLI object {pid}; ORACC {qid} lists this P-number among the sources used for the scholarly composite.",
            "digitizationUrl": cdli,
            "iiifManifest": None,
            "rights": "Public institutional metadata; image and edition rights remain with their respective source records",
            "sources": [cdli, composite],
            "decipherment": "Readable edition available",
            "evidence": "Securely attested",
            "description": f"A cataloged physical witness associated with ORACC composite {qid}. This composition-level association does not establish that every composite line survives on this object.",
            "access": "Public metadata",
        })
    write_json(ROOT / "data/seed/mesopotamia-archive.json", {"witnesses": witnesses, "artifacts": [], "images": []})

    evidence = []
    for qid, label, work_id in ANUNNA_EVIDENCE:
        source = retained_works[qid]
        line = next((line for line in source["lines"] if line["label"] == label), None)
        if not line or "{d}a-nun-na" not in line["text"]:
            raise ValueError(f"Reviewed Anunna line missing: {qid} {label}")
        evidence.append({
            "id": f"{qid.lower()}-{re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')}",
            "workId": work_id, "qId": qid, "line": label, "transliteration": line["text"], "sourceUrl": source["sourceUrl"],
            "note": "Exact ORACC composite transliteration. Atlas supplies no English translation for this line and does not treat the Q composite as one physical tablet.",
        })
    write_json(
        ROOT / "data/research/anunnaki-evidence.json",
        {
            "formatVersion": 1,
            "aliases": ["Anunna", "Anuna", "Anunnaku", "Anunnaki"],
            "primarySources": evidence,
            "scholarship": [
                {"id": "oracc-amgg-anunna", "title": "Anunna (Anunnaku, Anunnaki): a group of gods", "author": "Nicole Brisch", "summary": "ORACC's scholarly overview describes a changing collective term: high gods or a local pantheon in Sumerian evidence, and sometimes underworld gods in later evidence. Membership and number vary by period and context.", "sourceUrl": "https://oracc.museum.upenn.edu/amgg/listofdeities/anunna/", "evidence": "Mainstream scholarly overview"},
                {"id": "oracc-amgg-igigi", "title": "Igigi / Igigu and the Anunna", "author": "Nicole Brisch", "summary": "The relationship between Igigi and Anunna is historically variable and not fully resolved; the labels should not be flattened into one timeless roster.", "sourceUrl": "https://oracc.museum.upenn.edu/amgg/Listofdeities/Igigi/index.html", "evidence": "Mainstream scholarly overview"},
            ],
            "alternatives": [
                {"id": "scope-high-gods-local-pantheon", "title": "Scope of the collective", "summary": "Attested uses can denote leading gods broadly or the pantheon of a particular city. The cited overview says the exact membership is unclear.", "sourceUrl": "https://oracc.museum.upenn.edu/amgg/listofdeities/anunna/", "evidence": "Competing contextual readings within scholarship"},
                {"id": "later-underworld-use", "title": "Later underworld emphasis", "summary": "Later Akkadian usage can emphasize underworld gods in contrast with the Igigi, while earlier Sumerian uses are not restricted to that role.", "sourceUrl": "https://oracc.museum.upenn.edu/amgg/listofdeities/anunna/", "evidence": "Historically differentiated interpretation"},
            ],
            "modernClaims": [
                {"id": "sitchin-nibiru", "title": "Anunnaki as visitors from Nibiru", "claimant": "Zecharia Sitchin", "publication": "The 12th Planet", "year": 1976, "summary": "The publisher presents Sitchin's modern claim that the Anunnaki came from a planet called Nibiru and periodically landed on Earth.", "sourceUrl": "https://www.simonandschuster.net/books/The-12th-Planet-%28Book-I%29/Zecharia-Sitchin/9780939680887", "evidence": "Primary source for the modern claim; not evidence about antiquity"},
                {"id": "sitchin-human-workers", "title": "Anunnaki creation of human workers", "claimant": "Zecharia Sitchin", "publication": "Divine Encounters", "year": 2002, "summary": "The publisher attributes to Sitchin the hypothesis that Enki created humanity as a primitive worker for extraterrestrial Anunnaki.", "sourceUrl": "https://www.simonandschuster.net/books/Divine-Encounters/Zecharia-Sitchin/9781879181885", "evidence": "Primary source for the modern claim; not evidence about antiquity"},
            ],
            "comparisons": [
                {"id": "deities-versus-extraterrestrials", "modernClaimId": "sitchin-nibiru", "ancientEvidenceIds": ["q000333-4", "q000334-8", "q000343-167"], "ancientRecord": "The cited ORACC lines attest the divine-name spelling in Sumerian compositions; ORACC's scholarly overview treats Anunna/Anunnaki as a group of deities whose scope changes by context.", "finding": "The cited ancient evidence and scholarly overview do not identify the group as extraterrestrial visitors or name Nibiru as their home.", "limitation": "This comparison is bounded to the cited lines and overview; it is not a claim that every surviving Mesopotamian text has been exhaustively searched."},
                {"id": "collective-versus-fixed-race", "modernClaimId": "sitchin-nibiru", "ancientEvidenceIds": ["q000337-ver-1-seg-a-39", "q000351-72", "q000379-152"], "ancientRecord": "The name occurs in different literary settings, and the scholarly overview warns that membership, number and function vary across periods.", "finding": "The source record supports a variable divine collective, not a single fixed biological population described by modern racial or technological terms.", "limitation": "A transliteration attestation alone does not settle translation, theology or historical development."},
                {"id": "human-workers-claim", "modernClaimId": "sitchin-human-workers", "ancientEvidenceIds": ["q000333-4"], "ancientRecord": "The cited line is retained as untranslated Sumerian composite evidence; Atlas does not supply a meaning beyond the attested divine-name form.", "finding": "Nothing in this cited line establishes extraterrestrial genetic engineering or gold-mining labor.", "limitation": "Other creation traditions require their own editions and philological analysis; absence from one line is not universal negative proof."},
            ],
        },
    )
    print(f"Wrote {len(records)} new records, {len(overrides)} overrides, {len(editions)} transliteration editions, {len(passages)} passages, {len(witnesses)} witnesses, and {len(evidence)} Anunna attestations.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--literary-archive", type=Path, default=ROOT / "work/epsd2-literary.zip")
    parser.add_argument("--qcat-archive", type=Path, default=ROOT / "work/qcat.zip")
    parser.add_argument("--retained-only", action="store_true", help="Regenerate seeds without refreshing retained subsets")
    args = parser.parse_args()
    if not args.retained_only:
        refresh_retained(args.literary_archive, args.qcat_archive)
    build()


if __name__ == "__main__":
    main()
