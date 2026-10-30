"""Run the studio's bounded SKP extractor with stage-specific diagnostics."""
import importlib.util
import json
import sys
import zipfile
from pathlib import Path


def fail(code, stage, message, **extra):
    print(json.dumps(dict(status=code, stage=stage, message=message, **extra)))
    return 2


def main():
    if len(sys.argv) != 3:
        return fail("USAGE", "arguments", "Usage: read_skp.py INPUT.skp OUTPUT.json")
    source, output = map(Path, sys.argv[1:])
    if not source.is_file():
        return fail("SOURCE_NOT_AVAILABLE", "access", "Local source bytes are not available; materialize the attached file first.")
    if source.stat().st_size == 0:
        return fail("EMPTY_SOURCE", "access", "The local file is empty; verify the transfer.")
    if source.resolve() == output.resolve():
        return fail("INVALID_OUTPUT", "arguments", "Output must differ from the source SKP.")
    try:
        with zipfile.ZipFile(source) as archive:
            if "model.dat" not in archive.namelist():
                return fail("UNSUPPORTED_CONTAINER", "container", "ZIP has no model.dat; this reader has not established corruption.")
    except (zipfile.BadZipFile, OSError) as exc:
        return fail("UNSUPPORTED_CONTAINER", "container", str(exc))
    spec = importlib.util.spec_from_file_location("studio_skp_extractor", Path(__file__).with_name("extract_skp.py"))
    extractor = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(extractor)
    try:
        result = extractor.extract(source)
    except Exception as exc:
        return fail("UNSUPPORTED_LAYOUT", "parse", f"{type(exc).__name__}: {exc}", reader="bounded model.dat root-face TLV extractor")
    instances = result.get("omittedNonCabinetInstances", {})
    unsupported = {name: count for name, count in instances.items() if name != "Ty" and count}
    if unsupported:
        return fail("UNSUPPORTED_COMPONENTS", "validation", "Root-only extraction cannot establish complete cabinet geometry.", instances=instances)
    if not result["vertices"] or not result["faces"]:
        return fail("UNSUPPORTED_LAYOUT", "validation", "No validated root cabinet geometry was extracted.", instances=instances)
    points = list(result["vertices"].values())
    low = [min(p[i] for p in points) for i in range(3)]
    high = [max(p[i] for p in points) for i in range(3)]
    summary = dict(status="EXTRACTION_OK", stage="complete", source=source.name, sha256=result["sha256"], units=result["sourceUnits"], vertices=len(points), edges=len(result["edges"]), faces=len(result["faces"]), bounds=[high[i]-low[i] for i in range(3)], instances=instances)
    result["validationSummary"] = summary
    try:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    except OSError as exc:
        return fail("OUTPUT_UNAVAILABLE", "write", str(exc))
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
