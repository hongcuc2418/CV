# Third-party components

All runtime assets are shipped locally. No CDN or API key is required.

| Component | Version/source | License / notices |
| --- | --- | --- |
| pdf-lib | 1.17.1, official UMD distribution | MIT; `public/vendor/pdf-lib-LICENSE.md` |
| @pdf-lib/fontkit | 1.1.1, npm tarball `pdf-lib-fontkit-1.1.1.tgz` | MIT declaration and standard terms in `public/vendor/fontkit-LICENSE.txt`; shipped README and package metadata retained |
| DejaVu Sans Regular/Bold; DejaVu Serif Regular | System DejaVu TTF distribution, copied without altering font data; filenames aliased for app use | Bitstream Vera / DejaVu notices, `public/fonts/LICENSE-DejaVu.txt` |

Provenance: pdf-lib UMD came from installed package `pdf-lib@1.17.1`; fontkit from the version-pinned public npm package. Fontkit tarball shasum: `f18473892b65e3253eb73f4569785abd2c03b1e0`. Font metrics and PDF embedding share these same font bytes. Original font family copyright notices remain in the TTF files. No proprietary fonts or personal photos are bundled.

Project-specific layout, editor, model, migration, storage and export code is in `public/`. The synthetic PNG under `tests/fixtures/` is only test data, not an applicant portrait.
