# ⚠️ FONT LICENSING — REQUIRED BEFORE GOING LIVE

This POC self-hosts MD Anderson's brand webfonts for preview fidelity. **Minion
(Adobe) and Univers LT (Monotype/Linotype) are licensed commercial kits** —
lifted from the replica capture (fonts.com-style GUID woffs served by the live
site's clientlib). **Do not publish beyond the POC preview until the
webfont/embedding license is confirmed** (MD Anderson's own licensed kit covers
their domains, not this preview origin).

| File | Family (CSS name) | Foundry / License | Status |
|---|---|---|---|
| `minion-regular.woff` | Minion Regular | Adobe — commercial | ⚠️ UNLICENSED for this origin |
| `minion-semibold.woff` | Minion Semi Bold | Adobe — commercial | ⚠️ UNLICENSED for this origin |
| `minion-bold.woff` | Minion Bold | Adobe — commercial | ⚠️ UNLICENSED for this origin |
| `minion-w01-cap-regular.woff` | Minion W01 Cap Regular | Adobe via Monotype W01 kit | ⚠️ UNLICENSED for this origin |
| `minion-w01-smbd-cap.woff` | Minion W01 SmBd Cap (Regular) | Adobe via Monotype W01 kit | ⚠️ UNLICENSED for this origin |
| `univers-45-light.woff` | Univers LT W01_45 Light | Monotype/Linotype — commercial | ⚠️ UNLICENSED for this origin |
| `univers-55-roman.woff` | Univers LT W01_55 Roman | Monotype/Linotype — commercial | ⚠️ UNLICENSED for this origin |
| `univers-65-bold.woff` | Univers LT W01_65 Bold | Monotype/Linotype — commercial | ⚠️ UNLICENSED for this origin |
| `univers-67-boldcn.woff` | UniversLTW01-67BoldCn | Monotype/Linotype — commercial | ⚠️ UNLICENSED for this origin |
| `mdicons.woff` | MDIcons | MD Anderson clientlib (custom icon font) | Client-owned asset — confirm reuse |
| `mda-icons.woff` | mda-icons | MD Anderson clientlib (custom icon font) | Client-owned asset — confirm reuse |
| `fontawesome-webfont.woff` | FontAwesome | MD Anderson clientlib build (FA-derived, custom codepoints) | Confirm reuse (FA 4 font is SIL OFL 1.1, but this is the site's custom build) |
| `open-sans-300.woff2` | Open Sans Light | Google — Apache 2.0 | ✅ OK to self-host |
| `open-sans-regular.woff` | Open Sans Regular | Google — Apache 2.0 | ✅ OK to self-host |

## Remove path (if licensing cannot be confirmed)

1. Delete the Minion/Univers `.woff` files above from `fonts/`.
2. Delete their `@font-face` rules from `styles/fonts.css`.
3. No other change needed: every font stack in `styles/styles.css` names a
   metric-matched local fallback second (`minion-fallback` → Times New Roman,
   `univers-fallback` → Arial, `univers-cn-fallback` → Arial Narrow), so the
   site degrades to metric-identical system faces with zero layout shift.

Also flagged in: the banner comment atop `styles/styles.css`, and
`stardust/eds-conversion-log.md` § Foundation notes.
