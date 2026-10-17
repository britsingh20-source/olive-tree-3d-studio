from pathlib import Path
import hashlib,io,zipfile
root=Path(__file__).resolve().parents[1]
archive=b''.join(p.read_bytes() for p in sorted((root/'assets').glob('site-assets.zip.*')))
assert hashlib.sha256(archive).hexdigest()==(root/'assets/SHA256SUM').read_text().strip(), 'Asset checksum mismatch'
with zipfile.ZipFile(io.BytesIO(archive)) as z:
 for name in z.namelist():
  target=(root/name).resolve()
  assert target.is_relative_to(root), 'Unsafe archive path'
 z.extractall(root)
print('Website assets restored')
