#!/usr/bin/env python3
"""Generate the reviewed Phase 16 comparison-pack seed.

The pack records point at existing Atlas works, editions, passages, witnesses,
protocols, and the bounded Anunnaki research dataset. They intentionally retain
metadata-only and culturally restricted gaps instead of inventing evidence.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "seed" / "comparison-packs.json"


def citation(
    passage_id: str,
    edition_id: str,
    locator: str,
    content_type: str,
    source_url: str,
) -> dict[str, str]:
    return {
        "passageId": passage_id,
        "editionId": edition_id,
        "locator": locator,
        "contentType": content_type,
        "sourceUrl": source_url,
    }


def slot(
    slot_id: str,
    label: str,
    requested_range: str,
    status: str,
    source_category: str,
    evidence_note: str,
    *,
    work_ids: list[str] | None = None,
    witness_ids: list[str] | None = None,
    artifact_ids: list[str] | None = None,
    protocol_ids: list[str] | None = None,
    recension_ids: list[str] | None = None,
    citations: list[dict[str, str]] | None = None,
    research_refs: list[dict[str, str]] | None = None,
    gap: str = "",
    community: str = "",
) -> dict[str, object]:
    return {
        "id": slot_id,
        "label": label,
        "requestedRange": requested_range,
        "status": status,
        "sourceCategory": source_category,
        "evidenceNote": evidence_note,
        "workIds": work_ids or [],
        "witnessIds": witness_ids or [],
        "artifactIds": artifact_ids or [],
        "protocolIds": protocol_ids or [],
        "recensionIds": recension_ids or [],
        "citations": citations or [],
        "researchRefs": research_refs or [],
        "gap": gap,
        "community": community,
    }


def comparison(
    comparison_id: str,
    mode: str,
    title: str,
    summary: str,
    evidence_slot_ids: list[str],
    source_categories: list[str],
    influence_assessment: str,
    caution: str,
) -> dict[str, object]:
    return {
        "id": comparison_id,
        "mode": mode,
        "title": title,
        "summary": summary,
        "evidenceSlotIds": evidence_slot_ids,
        "contextSlotIds": [],
        "sourceCategories": source_categories,
        "influenceAssessment": influence_assessment,
        "caution": caution,
    }


def pack(
    pack_id: str,
    title: str,
    subtitle: str,
    topic_routes: list[dict[str, str]],
    slots: list[dict[str, object]],
    comparisons: list[dict[str, object]],
    completion_note: str,
) -> dict[str, object]:
    return {
        "id": pack_id,
        "title": title,
        "route": f"/compare/{pack_id}",
        "subtitle": subtitle,
        "topicRoutes": topic_routes,
        "slots": slots,
        "comparisons": comparisons,
        "completionNote": completion_note,
    }


BIBLE = "https://www.gutenberg.org/ebooks/10"

afterlife_slots = [
    slot("afterlife-pyramid-texts", "Pyramid Texts", "Pyramid Texts", "metadata-only", "academic-catalog-metadata", "Atlas has reviewed academic metadata, but no bounded edition passage for comparison.", work_ids=["pyramid-texts"], gap="A source/edition/witness-linked passage selection is still required."),
    slot("afterlife-coffin-texts", "Coffin Texts", "Coffin Texts", "metadata-only", "academic-catalog-metadata", "Atlas has reviewed academic metadata, but no bounded edition passage for comparison.", work_ids=["coffin-texts"], gap="A source/edition/witness-linked passage selection is still required."),
    slot("afterlife-book-of-dead", "Book of the Dead", "Book of the Dead", "evidence-ready", "historical-edition-commentary-and-translation", "The cited historical edition segment contains translated declaration material inside Budge's commentary; it is not labeled as a modern critical translation.", work_ids=["book-of-the-dead"], citations=[citation("pg-7145-book-of-the-dead-22", "pg-7145-book-of-the-dead", "Edition segment 22", "Scholarly commentary", "https://www.gutenberg.org/ebooks/7145")], witness_ids=["met-witness-548344"], artifact_ids=["met-548344-d08b0db3cb9f"], gap="The current passage classification is mixed commentary/translation and should not be presented as a witness-level diplomatic text."),
    slot("afterlife-amduat", "Amduat", "Amduat", "metadata-only", "museum-and-academic-metadata", "Museum and academic records identify the work, but Atlas has no bounded translation passage.", work_ids=["amduat"], gap="Add a rights-reviewed edition and passage-level source chain."),
    slot("afterlife-book-of-gates", "Book of Gates", "Book of Gates", "metadata-only", "museum-and-academic-metadata", "Institutional metadata identifies the composition; no passage is bundled.", work_ids=["book-of-gates"], gap="Add a rights-reviewed edition and passage-level source chain."),
    slot("afterlife-mesopotamian", "Mesopotamian underworld", "Mesopotamian underworld", "evidence-ready", "primary-transliteration", "The cited ORACC composite is source-language transliteration, not an Atlas-generated English translation and not one physical tablet.", work_ids=["gilgamesh-enkidu-netherworld"], citations=[citation("oracc-epsd2-q000364-1", "oracc-epsd2-q000364", "ORACC Q000364 lines Ver.1, 1–Ver.1, 20", "Primary text", "https://oracc.museum.upenn.edu/epsd2/literary/Q000364")], gap="A reviewed English translation is not bundled."),
    slot("afterlife-zoroastrian", "Zoroastrian afterlife", "Zoroastrian afterlife", "metadata-only", "scholarly-reference-metadata", "The Avesta record is linked to Encyclopaedia Iranica, but no edition passage is bundled.", work_ids=["avesta"], gap="Add source-bounded Avestan and translated passages relevant to judgment and postmortem fate."),
    slot("afterlife-greek", "Greek underworld", "Greek underworld", "evidence-ready", "historical-literary-translation", "The Odyssey citation is a public-domain historical translation and literary evidence, not a map of one universal Greek afterlife belief.", work_ids=["odyssey"], citations=[citation("pg-1727-389", "pg-1727", "Edition segment 389", "Unknown", "https://www.gutenberg.org/ebooks/1727")], gap="The segment's content classification remains Unknown and needs editorial review."),
    slot("afterlife-jewish", "Jewish traditions", "Jewish traditions", "evidence-ready", "scriptural-historical-translation", "Daniel 12:2 is one textual position; it does not stand for every Jewish period or community.", work_ids=["daniel"], citations=[citation("pg-10-daniel-296", "pg-10-daniel", "Daniel 12:2", "Primary text", BIBLE)]),
    slot("afterlife-christian", "Christianity", "Christianity", "evidence-ready", "scriptural-historical-translation", "Revelation 20:5 is one Christian apocalyptic passage and is kept distinct from later systematic teaching.", work_ids=["revelation"], citations=[citation("pg-10-revelation-281", "pg-10-revelation", "Revelation 20:5", "Primary text", BIBLE)]),
    slot("afterlife-islam", "Islam", "Islam", "evidence-ready", "scriptural-historical-translation", "The cited historical English translation is evidence for the edition's wording and requires translator-context caution.", work_ids=["quran"], citations=[citation("pg-3434-70", "pg-3434", "Edition segment 70", "Unknown", "https://www.gutenberg.org/ebooks/3434")], gap="The passage needs sura/verse normalization and content-type review."),
    slot("afterlife-hindu", "Hindu traditions", "Hinduism", "evidence-ready", "historical-translation", "The Katha Upanishad selection engages Yama and death; it is not a summary of all Hindu traditions.", work_ids=["katha-upanishad"], citations=[citation("pg-3283-katha-upanishad-4", "pg-3283-katha-upanishad", "Edition segment 4", "Unknown", "https://www.gutenberg.org/ebooks/3283")], gap="The segment includes editorial framing and still needs content-type review."),
    slot("afterlife-buddhist", "Buddhist traditions", "Buddhism", "evidence-ready", "historical-translation", "The Dhammapada passage is a historical translation and one Buddhist textual voice, not a pan-Buddhist doctrine statement.", work_ids=["dhammapada"], citations=[citation("pg-2017-3", "pg-2017", "Edition segment 3", "Unknown", "https://www.gutenberg.org/ebooks/2017")], gap="Verse boundaries and content type remain to be normalized."),
    slot("afterlife-tibetan-bardo", "Tibetan Bardo", "Tibetan Bardo", "metadata-only", "catalog-metadata", "Atlas retains the Bardo Thodol title as discovery metadata only.", work_ids=["tibetan-book-of-the-dead-bardo-thodol"], gap="No licensed or public-domain edition passage has been reviewed and bundled."),
    slot("afterlife-chinese", "Chinese traditions", "Chinese traditions", "evidence-ready", "source-language-primary-text", "The Infinite Life Sutra selection is a Chinese source-language text. Atlas does not silently present it as an English translation.", work_ids=["infinite-life-sutra"], citations=[citation("pg-25498-infinite-life-sutra-8", "pg-25498-infinite-life-sutra", "Edition block 8", "Primary text", "https://www.gutenberg.org/ebooks/25498")], gap="A reviewed translation and school-specific interpretive context are not bundled."),
    slot("afterlife-indigenous", "Lakota sacred narratives", "Indigenous traditions", "culturally-restricted", "community-protocol-metadata", "This community-specific record is represented by public metadata only. It is not a proxy for all Indigenous traditions.", work_ids=["lakota-sacred-narratives"], protocol_ids=["protocol-09"], community="Lakota communities", gap="Narrative content and afterlife interpretation are excluded pending community-specific authority and review."),
]

creation_slots = [
    slot("creation-egyptian", "Egyptian creation traditions", "Egyptian creation traditions", "evidence-ready", "historical-edition-translation", "The selected passage is one Egyptian cosmogonic source in a historical edition, not a universal Egyptian creation account.", work_ids=["book-of-knowing-evolutions-ra"], citations=[citation("pg-9411-book-of-knowing-evolutions-ra-3", "pg-9411-book-of-knowing-evolutions-ra", "Edition segment 3", "Primary text", "https://www.gutenberg.org/ebooks/9411")]),
    slot("creation-enuma-elish", "Enuma Elish", "Enuma Elish", "metadata-only", "oracc-catalog-metadata", "The ORACC catalogue establishes the work record, but no selected source passage is bundled.", work_ids=["enuma-elish"], gap="Add a source/edition-bounded passage before using Enuma Elish as comparative textual evidence."),
    slot("creation-genesis", "Genesis", "Genesis", "evidence-ready", "scriptural-historical-translation", "Genesis 1:1 is cited from the bundled public-domain edition.", work_ids=["genesis"], citations=[citation("pg-10-genesis-2", "pg-10-genesis", "Genesis 1:1", "Primary text", BIBLE)]),
    slot("creation-rig-veda", "Rig Veda", "Rig Veda", "metadata-only", "scholarly-discovery-metadata", "Atlas links institutional discovery metadata, but no reviewed edition passage.", work_ids=["rig-veda"], gap="Add a hymn-specific edition and passage rather than treating the whole Veda as one creation account."),
    slot("creation-popol-vuh", "Popol Vuh", "Popol Vuh", "culturally-restricted", "community-protocol-metadata", "The K’iche’ Maya record remains metadata-only under a community-review protocol.", work_ids=["popol-vuh"], protocol_ids=["protocol-01"], community="K’iche’ Maya", gap="No narrative content may be exported or synthesized without community and edition review."),
    slot("creation-theogony", "Greek Theogony", "Greek Theogony", "metadata-only", "institutional-text-metadata", "The Perseus-linked work record is present, but no Atlas passage is bundled.", work_ids=["theogony"], gap="Add a passage-level edition record and translation responsibility."),
    slot("creation-norse", "Norse creation", "Norse", "evidence-ready", "historical-literary-translation", "The Völuspá segment in this historical edition names Ymir and a pre-cosmic gap; it is literary evidence, not proof of a single historic Norse creed.", work_ids=["poetic-edda"], citations=[citation("pg-73533-poetic-edda-30", "pg-73533-poetic-edda", "Edition segment 30", "Unknown", "https://www.gutenberg.org/ebooks/73533")], gap="The segment needs poem/stanza and content-type normalization."),
    slot("creation-chinese", "Chinese traditions", "Chinese traditions", "evidence-ready", "historical-philosophical-translation", "The Tao Te Ching selection concerns generative language in one historical translation; it should not be relabeled as a single Chinese creation myth.", work_ids=["tao-te-ching"], citations=[citation("pg-216-5", "pg-216", "Edition segment 5", "Unknown", "https://www.gutenberg.org/ebooks/216")], gap="Chapter boundaries and content type require review."),
    slot("creation-polynesian", "Kumulipo", "Polynesian traditions", "culturally-restricted", "community-protocol-metadata", "Kumulipo is represented as a Kānaka Maoli genealogy tradition, not generic Polynesian scripture.", work_ids=["kumulipo"], protocol_ids=["protocol-16"], community="Kānaka Maoli / Native Hawaiian genealogy tradition", gap="Content comparison is blocked pending community-specific authority, version, recorder, and permission review."),
    slot("creation-dine", "Diné creation narratives", "Indigenous creation narratives", "culturally-restricted", "community-protocol-metadata", "The Diné record is community-specific and metadata-only.", work_ids=["navajo-dine-creation-narratives"], protocol_ids=["protocol-07"], community="Diné communities", gap="No narrative content is exposed or treated as one fixed scripture."),
    slot("creation-hopi", "Hopi emergence narratives", "Indigenous creation narratives", "culturally-restricted", "community-protocol-metadata", "The Hopi record is community-specific and metadata-only.", work_ids=["hopi-emergence-narratives"], protocol_ids=["protocol-08"], community="Hopi communities", gap="No narrative content is exposed or universalized."),
    slot("creation-dinka", "Dinka creation traditions", "Indigenous creation narratives", "culturally-restricted", "community-protocol-metadata", "The Dinka record requires local community attribution rather than a generic African or Indigenous label.", work_ids=["dinka-creation-traditions"], protocol_ids=["protocol-15"], community="Dinka communities; local attribution required", gap="Content is excluded pending community, version, recorder, and permission review."),
]

wisdom_slots = [
    slot("wisdom-ptahhotep", "Instruction of Ptahhotep", "Ptahhotep", "evidence-ready", "historical-edition-translation", "A bounded passage from the historical English edition is available.", work_ids=["instruction-of-ptahhotep"], citations=[citation("pg-30508-instruction-of-ptahhotep-3", "pg-30508-instruction-of-ptahhotep", "Edition segment 3", "Primary text", "https://www.gutenberg.org/ebooks/30508")]),
    slot("wisdom-amenemope", "Instruction of Amenemope", "Amenemope", "metadata-only", "academic-catalog-metadata", "Academic metadata is present without an Atlas edition passage.", work_ids=["instruction-of-amenemope"], gap="Add a rights-reviewed edition and passage selections."),
    slot("wisdom-proverbs", "Proverbs", "Proverbs", "evidence-ready", "scriptural-historical-translation", "Proverbs 1:1–4 is preserved as a bounded passage in the bundled edition.", work_ids=["proverbs"], citations=[citation("pg-10-proverbs-2", "pg-10-proverbs", "Proverbs 1:1", "Primary text", BIBLE)]),
    slot("wisdom-ecclesiastes", "Ecclesiastes", "Ecclesiastes", "evidence-ready", "scriptural-historical-translation", "The cited passage represents one bounded textual voice on seeking wisdom.", work_ids=["ecclesiastes"], citations=[citation("pg-10-ecclesiastes-15", "pg-10-ecclesiastes", "Ecclesiastes 1:13", "Primary text", BIBLE)]),
    slot("wisdom-analects", "Analects", "Analects", "evidence-ready", "historical-philosophical-translation", "The cited historical English translation discusses virtue; it is not a stand-in for all Ru/Confucian traditions.", work_ids=["analects"], citations=[citation("pg-3330-2", "pg-3330", "Edition segment 2", "Unknown", "https://www.gutenberg.org/ebooks/3330")], gap="Chapter/section and content-type normalization remain incomplete."),
    slot("wisdom-tao", "Tao Te Ching", "Tao Te Ching", "evidence-ready", "historical-philosophical-translation", "The selected historical translation presents one formulation of sage practice.", work_ids=["tao-te-ching"], citations=[citation("pg-216-2", "pg-216", "Edition segment 2", "Unknown", "https://www.gutenberg.org/ebooks/216")], gap="Chapter and content-type normalization remain incomplete."),
    slot("wisdom-dhammapada", "Dhammapada", "Dhammapada", "evidence-ready", "historical-translation", "A bounded passage on hatred and its cessation is available in a historical translation.", work_ids=["dhammapada"], citations=[citation("pg-2017-2", "pg-2017", "Edition segment 2", "Unknown", "https://www.gutenberg.org/ebooks/2017")], gap="Verse boundaries and content type remain to be normalized."),
    slot("wisdom-stoics", "Epictetus — Enchiridion", "Stoics", "evidence-ready", "historical-philosophical-edition", "The selected edition segment distinguishes what is and is not in human power; editorial framing is retained.", work_ids=["epictetus-enchiridion"], citations=[citation("pg-45109-7", "pg-45109", "Edition segment 7", "Unknown", "https://www.gutenberg.org/ebooks/45109")], gap="The segment mixes introduction and discussion and needs content-type review."),
    slot("wisdom-ifa", "Yorùbá Ifá Odu traditions", "Indigenous wisdom traditions", "culturally-restricted", "community-protocol-metadata", "The requested broad category is represented by one named community-specific example, not by a universal Indigenous wisdom corpus.", work_ids=["yoruba-ifa-odu-corpus"], protocol_ids=["protocol-13"], community="Yorùbá Ifá communities and authorized practitioners", gap="No Odu content is compared pending practitioner/community authority and version-level review."),
    slot("wisdom-haudenosaunee", "Haudenosaunee Great Law / narratives", "Indigenous wisdom traditions", "culturally-restricted", "community-protocol-metadata", "This is a distinct Haudenosaunee metadata record and is not conflated with the Ifá example.", work_ids=["haudenosaunee-great-law-creation-narratives"], protocol_ids=["protocol-10"], community="Haudenosaunee Confederacy nations", gap="Content comparison is blocked pending nation-specific authority and source context."),
]

devil_slots = [
    slot("devil-hebrew-bible", "Job", "Hebrew Bible", "evidence-ready", "scriptural-historical-translation", "Job 1:6 preserves a bounded occurrence of Satan in its narrative context.", work_ids=["job"], citations=[citation("pg-10-job-7", "pg-10-job", "Job 1:6", "Primary text", BIBLE)]),
    slot("devil-second-temple", "1 Enoch", "Second Temple literature", "evidence-ready", "historical-apocalyptic-translation", "The cited historical edition segment refers to Satans; this is not automatically the same role as every later devil concept.", work_ids=["1-enoch"], citations=[citation("pg-77935-1-enoch-69", "pg-77935-1-enoch", "Edition segment 69", "Unknown", "https://www.gutenberg.org/ebooks/77935")], gap="Content-type and section normalization remain incomplete."),
    slot("devil-new-testament", "Gospel of Matthew", "New Testament", "evidence-ready", "scriptural-historical-translation", "Matthew 4:1 supplies one bounded devil occurrence.", work_ids=["gospel-of-matthew"], citations=[citation("pg-10-gospel-of-matthew-38", "pg-10-gospel-of-matthew", "Gospel of Matthew 4:1", "Primary text", BIBLE)]),
    slot("devil-quran", "Quran", "Quran", "evidence-ready", "scriptural-historical-translation", "The cited historical translation uses the form Eblis and must remain translation-specific.", work_ids=["quran"], citations=[citation("pg-3434-133", "pg-3434", "Edition segment 133", "Unknown", "https://www.gutenberg.org/ebooks/3434")], gap="Normalize the sura/verse locator and compare additional translations."),
    slot("devil-zoroastrian", "Avesta", "Zoroastrian texts", "metadata-only", "scholarly-reference-metadata", "A source-linked Avesta work record exists without selected passages.", work_ids=["avesta"], gap="Add source-bounded Avestan and translated passages before comparison."),
    slot("devil-codex-gigas", "Codex Gigas Devil portrait", "Codex Gigas imagery", "metadata-only", "institutional-witness-metadata", "The National Library of Sweden witness record establishes the manuscript and portrait context; no image is bundled as comparative evidence.", witness_ids=["codex-gigas"], gap="Add a rights-reviewed image/artifact record and iconographic scholarship."),
    slot("devil-demonology", "Historical demonology", "demonology", "missing-source", "missing-bounded-source", "A broad category label is not a source.", gap="Select specific dated demonological works, editions, passages, and scholarship before making a comparative claim."),
    slot("devil-lesser-key", "Lesser Key of Solomon", "Lesser Key of Solomon", "metadata-only", "institutional-witness-metadata", "The work and Sloane MS 3648 are linked as metadata; operational ritual content is not extracted.", work_ids=["lesser-key-of-solomon"], witness_ids=["bl-sloane-3648-lemegeton"], gap="No bounded text passage or reviewed demon classification is included."),
    slot("devil-dante", "Dante — Divine Comedy", "Dante", "evidence-ready", "literary-reception", "The citation is literary reception evidence and is explicitly non-scriptural.", work_ids=["divine-comedy"], witness_ids=["bl-yates-thompson-36-dante"], citations=[citation("pg-1004-phase12-2", "pg-1004-phase12", "Edition segment 2", "Unknown", "https://www.gutenberg.org/ebooks/1004")], gap="The segment is a table-of-contents context and needs canto-level normalization."),
    slot("devil-faust", "Goethe — Faust, Part One", "Faust", "evidence-ready", "literary-reception", "Mephistopheles appears in a literary work; the citation does not establish religious doctrine.", work_ids=["faust-part-one"], citations=[citation("pg-14591-phase12-27", "pg-14591-phase12", "Edition segment 27", "Unknown", "https://www.gutenberg.org/ebooks/14591")]),
    slot("devil-paradise-lost", "Milton — Paradise Lost", "Paradise Lost", "evidence-ready", "literary-reception", "This is literary reception evidence, explicitly non-scriptural.", work_ids=["paradise-lost"], citations=[citation("pg-20-3", "pg-20", "Edition segment 3", "Unknown", "https://www.gutenberg.org/ebooks/20")]),
    slot("devil-satanic-writings", "Modern Satanist writings", "Satanic writings", "metadata-only", "modern-copyrighted-work-metadata", "Modern movement texts remain metadata-only; their copyright and self-description are respected.", work_ids=["the-satanic-bible", "selected-modern-satanic-philosophical-texts"], gap="No copyrighted text is reproduced; add licensed excerpts or independent scholarship for claim-level analysis."),
    slot("devil-skeptical", "Hume — Dialogues Concerning Natural Religion", "skeptical philosophical critiques", "evidence-ready", "philosophical-critique", "The cited passage treats the problem of evil philosophically rather than as a demonological entity claim.", work_ids=["david-hume-dialogues-concerning-natural-religion"], citations=[citation("pg-4583-95", "pg-4583", "Edition segment 95", "Unknown", "https://www.gutenberg.org/ebooks/4583")]),
]

anunnaki_slots = [
    slot("anunnaki-ancient", "Ancient Anunna occurrences", "ancient occurrences", "evidence-ready", "primary-transliteration", "Nine exact ORACC composite transliteration attestations are retained without invented English translations.", work_ids=["enki-and-ninmah", "enki-and-the-world-order", "enlil-and-sud", "inanna-and-ebih", "descent-of-inanna", "ninurta-exploits", "lugalbanda-mountain-cave", "lugalbanda-anzud-bird", "lament-for-ur"], research_refs=[{"collection": "primarySources", "id": item} for item in ["q000333-4", "q000334-8", "q000337-ver-1-seg-a-39", "q000339-88", "q000343-167", "q000351-72", "q000367-seg-a-428", "q000368-82", "q000379-152"]], gap="These are composite transliterations, not a single witness or complete translation."),
    slot("anunnaki-mythology", "Mesopotamian mythological contexts", "Mesopotamian mythology", "evidence-ready", "primary-transliteration", "The ancient occurrence set spans multiple compositions and does not imply one fixed roster or role.", work_ids=["enki-and-ninmah", "enki-and-the-world-order", "descent-of-inanna"], research_refs=[{"collection": "primarySources", "id": "q000333-4"}, {"collection": "primarySources", "id": "q000334-8"}, {"collection": "primarySources", "id": "q000343-167"}], gap="Full composition translations and witness-level context remain incomplete."),
    slot("anunnaki-scholarship", "Mainstream academic scholarship", "academic scholarship", "evidence-ready", "mainstream-scholarship", "ORACC's Ancient Mesopotamian Gods and Goddesses project supplies the bounded scholarly overview.", research_refs=[{"collection": "scholarship", "id": "oracc-amgg-anunna"}, {"collection": "scholarship", "id": "oracc-amgg-igigi"}]),
    slot("anunnaki-alternatives", "Alternative contextual readings", "alternative scholarship", "evidence-ready", "competing-scholarly-interpretation", "The alternatives are bounded contextual readings within scholarship, not ancient-astronaut claims mislabeled as scholarship.", research_refs=[{"collection": "alternatives", "id": "scope-high-gods-local-pantheon"}, {"collection": "alternatives", "id": "later-underworld-use"}]),
    slot("anunnaki-modern", "Sitchin / ancient-astronaut claims", "modern Sitchin/ancient-astronaut claims", "evidence-ready", "modern-claim-primary-source", "Publisher pages establish what Sitchin's modern books claim; they are not evidence about ancient Mesopotamia.", research_refs=[{"collection": "modernClaims", "id": "sitchin-nibiru"}, {"collection": "modernClaims", "id": "sitchin-human-workers"}]),
]

ethiopian_slots = [
    slot("ethiopian-western-canon", "Greek 1–2 Maccabees records", "Western canon comparison", "metadata-only", "catalog-metadata", "The Greek Maccabees records are comparison anchors only and are never used as aliases for Ethiopian Meqabyan.", work_ids=["1-maccabees", "2-maccabees"], gap="No bundled passage or community/edition-specific Western canon table is attached to these records."),
    slot("ethiopian-canon", "Ethiopian Orthodox canon records", "Ethiopian canon", "metadata-only", "community-canon-metadata", "Community-sourced canon memberships exist for Enoch, Jubilees, Sinodos, Didascalia, and Clement. This does not universalize the enumeration to Eritrean or other communities.", work_ids=["1-enoch", "jubilees", "ethiopic-sinodos", "ethiopic-didascalia", "ethiopic-clement"], gap="Only selected community memberships are currently modeled; edition-specific enumeration remains incomplete."),
    slot("ethiopian-enoch", "1 Enoch and Geʽez textual tradition", "Enoch", "evidence-ready", "historical-translation-plus-recension-metadata", "The bundled English historical edition is linked separately from the Geʽez textual-tradition record; it is not represented as a diplomatic Geʽez witness.", work_ids=["1-enoch", "ethiopian-enoch-tradition"], recension_ids=["enoch-geez-textual-tradition"], citations=[citation("pg-77935-1-enoch-69", "pg-77935-1-enoch", "Edition segment 69", "Unknown", "https://www.gutenberg.org/ebooks/77935")], gap="A Geʽez witness and modern critical translation are not bundled."),
    slot("ethiopian-jubilees", "Jubilees / Kufale", "Jubilees", "metadata-only", "community-and-recension-metadata", "The community source and Geʽez textual-tradition record are present without a selected passage.", work_ids=["jubilees"], recension_ids=["jubilees-geez-textual-tradition"], gap="Add witness-, edition-, and passage-level evidence."),
    slot("ethiopian-meqabyan", "First–Third Ethiopian Meqabyan", "Meqabyan", "metadata-only", "community-canon-metadata", "The three Ethiopian Meqabyan works have distinct IDs and are not Greek 1–3 Maccabees.", work_ids=["ethiopic-1-meqabyan", "ethiopic-2-meqabyan", "ethiopic-3-meqabyan"], gap="No reviewed edition passages are bundled."),
    slot("ethiopian-sinodos", "Ethiopic Sinodos", "church-order texts", "metadata-only", "community-canon-metadata", "Sinodos is retained as its own church-order compilation record.", work_ids=["ethiopic-sinodos"], gap="No edition or passage is bundled."),
    slot("ethiopian-covenant", "Ethiopic Books of Covenant", "church-order texts", "metadata-only", "community-canon-metadata", "The Books of Covenant remain a distinct record within the church-order range.", work_ids=["ethiopic-books-of-covenant"], gap="No edition or passage is bundled."),
    slot("ethiopian-clement", "Ethiopic Clement", "church-order texts", "metadata-only", "community-canon-metadata", "The listed Ethiopic Clement is not silently equated with every work called Clement.", work_ids=["ethiopic-clement"], gap="No edition or passage is bundled."),
    slot("ethiopian-didascalia", "Ethiopic Didascalia", "church-order texts", "metadata-only", "community-canon-metadata", "Didascalia is represented through the named community enumeration.", work_ids=["ethiopic-didascalia"], gap="No edition or passage is bundled."),
    slot("ethiopian-kebra", "Kebra Nagast", "Kebra Nagast", "metadata-only", "institutional-witness-metadata", "Kebra Nagast is linked to British Library Or 818 as a physical witness record; no passage is inferred from the witness link.", work_ids=["kebra-nagast"], witness_ids=["bl-or-818-kebra-nagast"], gap="A rights-reviewed edition and passage selection remain missing."),
]

indigenous_slots = [
    slot("indigenous-kiche", "K’iche’ Maya — Popol Vuh", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "The record is public metadata under a K’iche’ Maya community-review protocol.", work_ids=["popol-vuh"], protocol_ids=["protocol-01"], community="K’iche’ Maya", gap="No narrative content or influence claim is exported."),
    slot("indigenous-dine", "Diné creation narratives", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "The record is public metadata under a Diné community-review protocol.", work_ids=["navajo-dine-creation-narratives"], protocol_ids=["protocol-07"], community="Diné communities", gap="Version, recorder, audience, permission, and content review remain required."),
    slot("indigenous-hopi", "Hopi emergence narratives", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "The record is public metadata under a Hopi community-review protocol.", work_ids=["hopi-emergence-narratives"], protocol_ids=["protocol-08"], community="Hopi communities", gap="Version, recorder, audience, permission, and content review remain required."),
    slot("indigenous-dinka", "Dinka creation traditions", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "The regional title cannot replace local Dinka community attribution.", work_ids=["dinka-creation-traditions"], protocol_ids=["protocol-15"], community="Dinka communities; local attribution required", gap="No narrative comparison is made without local source and permission context."),
    slot("indigenous-kanaka-maoli", "Kānaka Maoli — Kumulipo", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "Kumulipo is retained as a genealogy tradition with a named cultural authority.", work_ids=["kumulipo"], protocol_ids=["protocol-16"], community="Kānaka Maoli / Native Hawaiian genealogy tradition", gap="No version is presented as a generic Polynesian creation scripture."),
    slot("indigenous-maori", "Māori creation genealogies", "Multiple community-specific creation traditions", "culturally-restricted", "community-protocol-metadata", "The record requires iwi- and hapū-specific authority.", work_ids=["maori-creation-genealogies"], protocol_ids=["protocol-17"], community="Māori iwi and hapū; specific authority required", gap="No narrative content or pan-Māori version is inferred."),
]

packs = [
    pack(
        "afterlife",
        "Afterlife",
        "Sixteen required traditions and corpora, with funerary, scriptural, literary, source-language, metadata, and community-protocol layers kept separate.",
        [{"label": "Afterlife ontology", "href": "/ontology/afterlife"}, {"label": "Egypt collection", "href": "/library/egypt"}],
        afterlife_slots,
        [
            comparison("afterlife-similarity", "similarity", "Postmortem destinations and judgment appear in several bounded sources", "The cited Egyptian-edition material, Daniel, Revelation, the Quran translation, the Katha Upanishad edition, and the Dhammapada edition each contain postmortem language. This is a limited thematic comparison, not an equivalence of destinations, persons, or judgments.", ["afterlife-book-of-dead", "afterlife-jewish", "afterlife-christian", "afterlife-islam", "afterlife-hindu", "afterlife-buddhist"], ["historical-edition-commentary-and-translation", "scriptural-historical-translation", "historical-translation"], "independent-development-possible", "Shared themes do not prove contact, descent, or borrowing."),
            comparison("afterlife-difference", "difference", "Ritual, resurrection, philosophical, and source-language records answer different questions", "The Egyptian funerary edition, Christian apocalyptic resurrection passage, Greek literary underworld, and Chinese Buddhist source-language text differ in genre, textual function, and evidence layer.", ["afterlife-book-of-dead", "afterlife-christian", "afterlife-greek", "afterlife-chinese"], ["historical-edition-commentary-and-translation", "scriptural-historical-translation", "historical-literary-translation", "source-language-primary-text"], "not-assessed", "Do not collapse ritual provision, resurrection, literary katabasis, and Pure Land language into one afterlife model."),
            comparison("afterlife-chronology", "chronology", "Egyptian funerary stages are visible even where texts remain metadata-only", "Pyramid Texts, Coffin Texts, Book of the Dead, Amduat, and Book of Gates remain distinct stages in Atlas. Only the Book of the Dead currently has a bounded edition citation in this pack.", ["afterlife-pyramid-texts", "afterlife-coffin-texts", "afterlife-book-of-dead", "afterlife-amduat", "afterlife-book-of-gates"], ["academic-catalog-metadata", "historical-edition-commentary-and-translation", "museum-and-academic-metadata"], "not-applicable", "Metadata chronology must not be presented as if all five corpora had equivalent passage coverage."),
        ],
        "Incomplete: Egyptian, Zoroastrian, Tibetan, and community-specific Indigenous source depth remains visible as metadata or protocol-limited gaps.",
    ),
    pack(
        "creation",
        "Creation",
        "Requested creation sources remain distinct by genre, language, community, and evidence depth.",
        [{"label": "Creation ontology", "href": "/ontology/creation"}, {"label": "Story parallels", "href": "/stories"}],
        creation_slots,
        [
            comparison("creation-similarity", "similarity", "Several available sources describe emergence or ordering", "The bounded Egyptian, Genesis, Norse, and Tao Te Ching edition passages each use generative or pre-cosmic language, but their agents, genres, and concepts differ.", ["creation-egyptian", "creation-genesis", "creation-norse", "creation-chinese"], ["historical-edition-translation", "scriptural-historical-translation", "historical-literary-translation", "historical-philosophical-translation"], "independent-development-possible", "Thematic resemblance alone supplies no evidence of borrowing."),
            comparison("creation-difference", "difference", "Cosmogony, scripture, poetry, and philosophical generation are not interchangeable", "The selected records differ in form and function. The Tao Te Ching selection is not relabeled as myth, and Völuspá is not treated as a universal historic Norse confession.", ["creation-egyptian", "creation-genesis", "creation-norse", "creation-chinese"], ["historical-edition-translation", "scriptural-historical-translation", "historical-literary-translation", "historical-philosophical-translation"], "not-assessed", "Comparison preserves genre and translation limits."),
            comparison("creation-alternatives", "alternative-interpretation", "Unavailable and culturally governed sources constrain the preset", "Enuma Elish, Rig Veda, Theogony, Popol Vuh, Kumulipo, Diné, Hopi, and Dinka records cannot yet support equal passage-level comparison in Atlas.", ["creation-enuma-elish", "creation-rig-veda", "creation-theogony", "creation-popol-vuh", "creation-polynesian", "creation-dine", "creation-hopi", "creation-dinka"], ["oracc-catalog-metadata", "scholarly-discovery-metadata", "institutional-text-metadata", "community-protocol-metadata"], "not-assessed", "Absence of bundled content is a data limitation, not evidence that a tradition lacks creation knowledge."),
        ],
        "Incomplete: several required sources are metadata-only, and community-governed narratives remain unavailable for content comparison.",
    ),
    pack(
        "wisdom",
        "Wisdom",
        "Practical instruction, scriptural wisdom, philosophical counsel, and community-governed knowledge are compared without treating 'wisdom' as one universal genre.",
        [{"label": "Knowledge ontology", "href": "/ontology/knowledge"}, {"label": "Egypt collection", "href": "/library/egypt"}],
        wisdom_slots,
        [
            comparison("wisdom-similarity", "similarity", "Instruction and self-cultivation recur across several available editions", "Ptahhotep, Proverbs, the Analects, the Dhammapada, and Epictetus each preserve bounded instructional material, while retaining distinct genres and aims.", ["wisdom-ptahhotep", "wisdom-proverbs", "wisdom-analects", "wisdom-dhammapada", "wisdom-stoics"], ["historical-edition-translation", "scriptural-historical-translation", "historical-philosophical-translation", "historical-translation", "historical-philosophical-edition"], "independent-development-possible", "Instructional resemblance is not a lineage claim."),
            comparison("wisdom-contradiction", "contradiction", "Wisdom's value is framed differently within the bundled biblical corpus", "Proverbs opens by commending wisdom and instruction, while Ecclesiastes records the burdens of seeking wisdom. The tension is proposition- and passage-specific, not a claim that either whole work has one simple position.", ["wisdom-proverbs", "wisdom-ecclesiastes"], ["scriptural-historical-translation"], "not-applicable", "A two-passage tension does not exhaust either work's argument."),
            comparison("wisdom-difference", "difference", "Community-governed knowledge is not filled in by analogy", "The Ifá and Haudenosaunee records remain separate, protocol-governed metadata slots. Atlas does not infer their teachings from Egyptian, biblical, Chinese, Buddhist, or Stoic sources.", ["wisdom-ifa", "wisdom-haudenosaunee", "wisdom-ptahhotep", "wisdom-analects"], ["community-protocol-metadata", "historical-edition-translation", "historical-philosophical-translation"], "not-assessed", "Unavailable community content remains a visible gap."),
        ],
        "Incomplete: Amenemope and both community-governed examples lack passage-level evidence in Atlas.",
    ),
    pack(
        "devil-evil",
        "Devil / Evil",
        "Adversarial figures, apocalyptic texts, literary reception, modern movements, material imagery, and philosophical evil remain separate evidence categories.",
        [{"label": "Evil ontology", "href": "/ontology/evil"}, {"label": "Esoteric collection", "href": "/library/esoteric"}],
        devil_slots,
        [
            comparison("devil-chronology", "chronology", "Adversarial language occurs in distinct textual and later literary contexts", "Job, 1 Enoch, Matthew, the Quran translation, Dante, Goethe, and Milton belong to different periods, genres, and source categories. The sequence does not by itself prove a single line of evolution.", ["devil-hebrew-bible", "devil-second-temple", "devil-new-testament", "devil-quran", "devil-dante", "devil-faust", "devil-paradise-lost"], ["scriptural-historical-translation", "historical-apocalyptic-translation", "literary-reception"], "possible-influence-requires-separate-evidence", "Chronology is not a transmission graph."),
            comparison("devil-difference", "difference", "Scripture, manuscript imagery, grimoires, and literature are different records", "The Codex Gigas witness, Lesser Key witness, scriptural passages, and literary works cannot be merged into one demonology source category.", ["devil-hebrew-bible", "devil-codex-gigas", "devil-lesser-key", "devil-paradise-lost"], ["scriptural-historical-translation", "institutional-witness-metadata", "literary-reception"], "not-assessed", "A manuscript nickname or portrait does not establish supernatural authorship."),
            comparison("devil-alternative", "alternative-interpretation", "The philosophical problem of evil is not a demon entity claim", "Hume's dialogue raises a philosophical challenge about evil, while Job and Matthew contain personified adversarial figures in bounded passages.", ["devil-skeptical", "devil-hebrew-bible", "devil-new-testament"], ["philosophical-critique", "scriptural-historical-translation"], "not-applicable", "Do not classify skeptical critique as demonology or as a religious confession."),
        ],
        "Incomplete: Zoroastrian passages, Codex Gigas imagery, a bounded demonology corpus, and Lesser Key passages remain missing or metadata-only.",
    ),
    pack(
        "anunnaki",
        "Anunnaki",
        "Ancient attestations, mainstream scholarship, contextual alternatives, and modern popular claims are separated by source category.",
        [{"label": "Anunna research guide", "href": "/explore/anunnaki"}, {"label": "Anunna entity", "href": "/entities/anunna"}],
        anunnaki_slots,
        [
            comparison("anunnaki-difference", "difference", "Ancient divine-name attestations do not state modern extraterrestrial claims", "The exact ORACC transliterations attest the divine-name spelling in ancient compositions. The publisher pages establish that Sitchin later made Nibiru and ancient-astronaut claims; they do not move those claims into the ancient evidence layer.", ["anunnaki-ancient", "anunnaki-modern"], ["primary-transliteration", "modern-claim-primary-source"], "unsupported-by-cited-ancient-evidence", "Atlas does not turn absence in a few lines into a universal negative claim about every Mesopotamian text."),
            comparison("anunnaki-chronology", "chronology", "Modern claims are chronologically and evidentially separate", "The modern publication claims date to the twentieth and twenty-first centuries; the ancient occurrences belong to Sumerian and Akkadian source contexts. This establishes separation, not a claim about motive.", ["anunnaki-ancient", "anunnaki-modern"], ["primary-transliteration", "modern-claim-primary-source"], "modern-reinterpretation", "Publisher descriptions are primary evidence for modern claims only."),
            comparison("anunnaki-alternative", "alternative-interpretation", "Scholarly alternatives concern historical scope and role", "ORACC's overview and the recorded alternative readings concern a variable divine collective, local pantheons, and later underworld emphasis. They are not endorsements of ancient-astronaut claims.", ["anunnaki-scholarship", "anunnaki-alternatives", "anunnaki-modern"], ["mainstream-scholarship", "competing-scholarly-interpretation", "modern-claim-primary-source"], "unsupported-by-cited-scholarship", "Alternative contextual readings within Assyriology must not be relabeled as popular alternative history."),
        ],
        "Evidence-ready within the bounded dataset, with explicit limits: the nine attestations are not an exhaustive survey or complete translated corpus.",
    ),
    pack(
        "ethiopian-tradition",
        "Ethiopian Tradition",
        "Canon, textual tradition, church-order works, Meqabyan, and Kebra Nagast are kept community-, edition-, work-, and witness-specific.",
        [{"label": "Ethiopia, Eritrea & the Horn", "href": "/library/horn"}, {"label": "Canon explorer", "href": "/canon"}],
        ethiopian_slots,
        [
            comparison("ethiopian-difference", "difference", "Ethiopian Meqabyan remains distinct from Greek Maccabees", "Atlas uses separate work IDs for First–Third Ethiopian Meqabyan and Greek 1–2 Maccabees. Similar English numbering does not create title or content equivalence.", ["ethiopian-western-canon", "ethiopian-meqabyan"], ["catalog-metadata", "community-canon-metadata"], "not-applicable", "No content comparison is claimed while both sides lack bundled passages."),
            comparison("ethiopian-textual", "chronology", "Geʽez preservation metadata and English editions are separate layers", "The Enoch pack slot distinguishes a historical English translation from the Geʽez textual-tradition record. Jubilees currently has only community and recension metadata.", ["ethiopian-enoch", "ethiopian-jubilees"], ["historical-translation-plus-recension-metadata", "community-and-recension-metadata"], "documented-textual-tradition-not-edition-identity", "A textual-tradition record is not a claim that the bundled English edition derives from one identified Geʽez witness."),
            comparison("ethiopian-alternative", "alternative-interpretation", "Canon, church order, national epic, and witness context remain separate", "Sinodos, Books of Covenant, Clement, Didascalia, and Kebra Nagast occupy different work and genre contexts. Their presence in one regional pack does not make them one canon tier or one kind of authority.", ["ethiopian-sinodos", "ethiopian-covenant", "ethiopian-clement", "ethiopian-didascalia", "ethiopian-kebra"], ["community-canon-metadata", "institutional-witness-metadata"], "not-applicable", "Ethiopian community evidence is not automatically copied to the independent Eritrean Orthodox Tewahedo Church."),
        ],
        "Incomplete: only 1 Enoch has a bundled passage; Jubilees, Meqabyan, church-order works, and Kebra Nagast need edition-level evidence.",
    ),
    pack(
        "indigenous-creation",
        "Indigenous Creation",
        "A protocol-first comparison of six community-specific records. Atlas does not expose restricted content or manufacture similarities to fill the corpus gap.",
        [{"label": "Global Indigenous collection", "href": "/library/indigenous"}, {"label": "Creation ontology", "href": "/ontology/creation"}],
        indigenous_slots,
        [
            comparison("indigenous-difference", "difference", "Six communities require six authority and context records", "K’iche’ Maya, Diné, Hopi, Dinka, Kānaka Maoli, and Māori records each retain their own community authority. A shared discovery pack does not create a pan-Indigenous canon or narrative.", ["indigenous-kiche", "indigenous-dine", "indigenous-hopi", "indigenous-dinka", "indigenous-kanaka-maoli", "indigenous-maori"], ["community-protocol-metadata"], "not-assessed", "Only public metadata is compared; narrative content is not exposed."),
            comparison("indigenous-chronology", "chronology", "Chronology cannot be normalized from the current metadata", "The current records do not assert comparable composition dates, performance dates, versions, or recorder histories. Atlas therefore leaves chronological comparison unresolved.", ["indigenous-kiche", "indigenous-dine", "indigenous-hopi", "indigenous-dinka", "indigenous-kanaka-maoli", "indigenous-maori"], ["community-protocol-metadata"], "not-assessed", "Unknown dates are not converted into invented timeline positions."),
            comparison("indigenous-alternative", "alternative-interpretation", "Contact, influence, and independent development remain unassessed", "The pack records no source-level contact evidence among these six community-specific traditions. It therefore provides no borrowing, diffusion, or independent-development verdict.", ["indigenous-kiche", "indigenous-dine", "indigenous-hopi", "indigenous-dinka", "indigenous-kanaka-maoli", "indigenous-maori"], ["community-protocol-metadata"], "not-assessed", "Similarity cannot be assessed from metadata titles, and lack of documented contact in this seed is not proof of isolation."),
        ],
        "Intentionally incomplete: all six records are metadata-only under community-review protocols, so no narrative-content comparison is presented.",
    ),
]

# A source selection whose corpus segment is still classified as Unknown stays
# inspectable, but it cannot support a comparative finding. Keep those records
# distinct from title-only metadata so the outstanding editorial work is clear.
for configured_pack in packs:
    slot_by_id = {item["id"]: item for item in configured_pack["slots"]}
    for configured_slot in configured_pack["slots"]:
        citations = configured_slot["citations"]
        if (
            configured_slot["status"] == "evidence-ready"
            and citations
            and not configured_slot["researchRefs"]
            and all(item["contentType"] == "Unknown" for item in citations)
        ):
            configured_slot["status"] = "unclassified-selection"
            if not configured_slot["gap"]:
                configured_slot["gap"] = (
                    "The bounded segment remains classified as Unknown and cannot support "
                    "a comparative claim until its source role is reviewed."
                )

    coverage_note_ids = {
        "afterlife-chronology",
        "creation-alternatives",
        "wisdom-difference",
        "devil-difference",
        "devil-alternative",
        "ethiopian-difference",
        "ethiopian-textual",
        "ethiopian-alternative",
        "indigenous-difference",
        "indigenous-chronology",
        "indigenous-alternative",
    }
    for configured_output in configured_pack["comparisons"]:
        referenced_ids = configured_output["evidenceSlotIds"]
        if configured_output["id"] in coverage_note_ids:
            configured_output["kind"] = "coverage-note"
            configured_output["evidenceSlotIds"] = []
            configured_output["contextSlotIds"] = referenced_ids
            active_ids = referenced_ids
        else:
            configured_output["kind"] = "comparison-finding"
            configured_output["evidenceSlotIds"] = [
                item_id
                for item_id in referenced_ids
                if slot_by_id[item_id]["status"] == "evidence-ready"
            ]
            configured_output["contextSlotIds"] = [
                item_id
                for item_id in referenced_ids
                if slot_by_id[item_id]["status"] != "evidence-ready"
            ]
            active_ids = configured_output["evidenceSlotIds"]
        configured_output["sourceCategories"] = list(
            dict.fromkeys(slot_by_id[item_id]["sourceCategory"] for item_id in active_ids)
        )

# Finding summaries name only evidence-ready selections. Unclassified source
# selections remain visible below each finding as context that cannot support it.
summary_updates = {
    "afterlife-similarity": "The cited Egyptian-edition material, Daniel, and Revelation each contain bounded postmortem language. This is a limited thematic comparison, not an equivalence of destinations, persons, or judgments.",
    "afterlife-difference": "The Egyptian funerary edition, Christian apocalyptic resurrection passage, and Chinese Buddhist source-language text differ in genre, textual function, and evidence layer.",
    "creation-similarity": "The bounded Egyptian and Genesis passages each use generative language, but their agents, genres, and concepts differ.",
    "creation-difference": "The Egyptian historical-edition translation and the Genesis scriptural translation differ in form and textual function; neither stands for every creation tradition in its wider setting.",
    "wisdom-similarity": "Ptahhotep and Proverbs each preserve bounded instructional material while retaining different literary and historical settings.",
    "devil-chronology": "The bounded Job and Matthew passages belong to different periods and textual settings. Their sequence does not by itself prove a single line of evolution.",
}
for configured_pack in packs:
    for configured_output in configured_pack["comparisons"]:
        if configured_output["id"] in summary_updates:
            configured_output["summary"] = summary_updates[configured_output["id"]]

DATA = {
    "formatVersion": 1,
    "datasetVersion": "phase16-2026-10-10",
    "policy": {
        "metadataIsNotEvidence": True,
        "similarityDoesNotProveInfluence": True,
        "restrictedContentExcluded": True,
        "modernClaimsSeparatedFromAncientEvidence": True,
        "communityAndEditionSpecificityRequired": True,
        "snapshotContainsNoPassageText": True,
    },
    "packs": packs,
}


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(DATA, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(packs)} comparison packs")


if __name__ == "__main__":
    main()
