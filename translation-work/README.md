# Website translation workspace

Goal: professional translations of the whole website into 10 languages, delivered as ONE file
(`content-packs/translations-all.json`) that is uploaded in Dashboard -> Import / Export -> Import. Uploading again never creates duplicates:
each translation is matched by its English text and simply replaces the old one.

## Languages (code, register)
| code | language | register |
|---|---|---|
| ar | Arabic | Modern Standard Arabic, formal business tone; right-to-left |
| de | German | formal "Sie" |
| fr | French | formal "vous" |
| hi | Hindi | formal "आप", clear everyday business Hindi (keep common English loanwords such as visa, licence if that is how professionals say it) |
| zh | Chinese (Simplified) | formal, professional |
| es | Spanish | neutral, formal "usted" |
| it | Italian | formal "Lei" |
| ja | Japanese | polite です・ます, business register |
| ko | Korean | formal 합쇼체 / polite business tone |
| nl | Dutch | formal "u" |

Priority order: ar, de, fr, hi, zh, es, it, ja, ko, nl.

## The source
`source.json` = every English unit a visitor can see, exactly as the website's translator sees it:
- `stage1` (about 3,100 units / 48,000 words): header, footer, home, about, contact, lists, FAQs, every service page, every country page and state page.
- `stage2` (about 9,700 units / 289,000 words): service x country pages and blog posts.
Regenerate it with `CONTENT_DIR=<content> node scripts/export-translation-source.js <site url>`; sentences that changed on the live site show up as new units.

A unit is either plain text, or a short piece of HTML (a paragraph that contains links or bold text), for example
`See our <a href="/services/trade-license">trade licence service</a> for details.`
For HTML units: translate the visible words, keep every tag and every `href` exactly as given, and put the tags where they belong in the
translated sentence. Never add tags.

## Rules for every translation
1. Translate meaning, not word by word. Sound like a native professional writing for business owners and investors.
2. Keep numbers, percentages, AED amounts, dates, phone numbers, e-mail addresses and URLs exactly (you may write "AED" as the local word for dirham).
3. Keep the brand `Al Anfal Doc` in Latin letters. Keep `Ejari` in Latin letters. Official names of authorities may be given in the target language followed by the English abbreviation (DET, MOHRE, GDRFA, ICP), as in `glossary.json`.
4. Use `glossary.json` for recurring terms so all pages agree.
5. Legal wording matters: we provide document preparation, processing and application support. We do not issue visas, licences or permits and never promise approval. Do not make a sentence sound stronger or weaker than the English.
6. Do not add information, advice or promises. Do not remove information.
7. Keep the length similar (menu and button text must stay short).
8. Words in capitals in the English (buttons like `READ MORE`) may stay capitalised where the language has capitals.

## Workflow
```bash
node scripts/translation-todo.js ar --stage 1 --count 120     # prints "id<TAB>English" for the next untranslated units
# write the translations as JSON:  { "<id>": "translation", ... }  into any file, for example /tmp/ar-chunk.json
node scripts/translation-apply.js ar /tmp/ar-chunk.json         # merges into translation-work/ar.json and rejects entries that change numbers, tags or links
node scripts/build-translations.js --stage 1                    # merges all languages into content-packs/translations-all.json and prints a coverage report
```
`translation-work/<lang>.json` holds `{ "English unit": "translation" }`. Commit these files regularly. Update `PROGRESS.md` after each batch.

## Quality pass
After a language reaches 100% of stage 1: re-read about 5% of the units at random against the English, check the glossary terms,
check that buttons and headings are short, and run the website in that language (header globe icon) on the home page, a service page, a country page and the FAQs.
