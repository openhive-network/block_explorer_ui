# Bundled fonts

## DejaVuSans.ttf

Used server-side only, by `utils/og/rasterize.ts`, to render the Open Graph
share cards (`/api/og/cover`, `/api/og/account/[accountName]`). It is bundled
rather than read from the host so the cards rasterize identically in local dev
and in the Alpine standalone image. It covers the Latin text plus ★ (U+2605)
and → (U+2192), the only non-ASCII glyphs the cards use.

Source: https://dejavu-fonts.github.io/

Licence: DejaVu Fonts Licence (a permissive, Bitstream Vera derived licence that
allows redistribution and bundling). Fonts are (c) Bitstream Inc. and (c) Tavmjong
Bah; DejaVu changes are in the public domain. Full text:
https://dejavu-fonts.github.io/License.html
