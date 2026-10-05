import email, pathlib, re, sys

name, headers_path, body_path, output_path = sys.argv[1:]
headers = pathlib.Path(headers_path).read_text(errors="ignore")
match = re.search(r"(?im)^content-type:\s*(.+?)\r?$", headers)
raw = pathlib.Path(body_path).read_bytes()
content_type = match.group(1).strip() if match else ""
if content_type.lower().startswith("multipart/"):
    msg = email.message_from_bytes((f"Content-Type: {content_type}\nMIME-Version: 1.0\n\n").encode() + raw)
    candidates = []
    for part in msg.walk():
        if part.is_multipart():
            continue
        filename = part.get_filename() or ""
        payload = part.get_payload(decode=True) or b""
        if filename.endswith((".js", ".mjs")) or b"export default" in payload or b"export {" in payload:
            candidates.append((filename, payload))
    if not candidates:
        raise SystemExit(f"no JavaScript part found for {name}")
    _, payload = max(candidates, key=lambda item: len(item[1]))
else:
    payload = raw
text = payload.decode("utf-8")
if len(text) < 100:
    raise SystemExit(f"source too small for {name}")
pathlib.Path(output_path).write_text(text)
print(f"{name}: {len(text)} bytes")
