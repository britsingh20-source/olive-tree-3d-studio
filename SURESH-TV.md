# Mr. Suresh — TV unit

The current customer record is [customers/suresh/design.json](customers/suresh/design.json).
Current implementation, tests and unresolved verification are in [customers/suresh/STATUS.md](customers/suresh/STATUS.md).

Start a new chat using [CONTINUE.md](CONTINUE.md). Follow [AGENTS.md](AGENTS.md) and [docs/STUDIO-WORKFLOW.md](docs/STUDIO-WORKFLOW.md).

## Rebuild source geometry

```sh
python scripts/extract-prem-skp.py input.skp extracted.json
python scripts/prepare-suresh-layout.py extracted.json dist/suresh/exact-layout.js
```

The bounded extractor is not a general SketchUp converter. See STATUS.md before running or reporting check-suresh.mjs; photo loading changed after its historical pass.
