#!/usr/bin/env python3
import json
import os
import sys
from urllib.parse import urlparse

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

BASE = "https://analyticsadmin.googleapis.com/v1beta"
SCOPE = "https://www.googleapis.com/auth/analytics.edit"
PROPERTY_ID = os.getenv("GA4_PROPERTY_ID", "551422989").replace("properties/", "")
PROPERTY = f"properties/{PROPERTY_ID}"
APPLY = os.getenv("GA4_APPLY", "false").lower() == "true"
PRIMARY_NAME = "4PLANET Web"
PRIMARY_URI = "https://4planet.org"
LIVE_DOMAINS = [
    "4planet.org",
    "4planetmagazine.com",
    "s4piens.com",
    "cre4tors.com",
    "4planetmarket.com",
]

CUSTOM_DIMENSIONS = [
    ("site_host", "Site host", "Production hostname across the 4PLANET domain family."),
    ("product_area", "Product area", "4PLANET product or public area for the event."),
    ("use_kind", "Meaningful use kind", "Privacy-safe meaningful-use interaction class."),
    ("entry_kind", "Entry kind", "How a user entered a 4PLANET product surface."),
    ("completion_type", "Completion type", "Article, journey or task completion class."),
    ("destination_product", "Destination product", "Product reached through deeper exploration."),
    ("share_method", "Share method", "Native, copied or linked share action."),
    ("interest_surface", "Interest surface", "Join, follow, watch, partner or fund interest surface."),
]

KEY_EVENTS = [
    ("join_interest", "ONCE_PER_EVENT"),
    ("purchase", "ONCE_PER_EVENT"),
]


def die(msg: str):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def api(session, method, path, *, params=None, body=None):
    url = f"{BASE}/{path.lstrip('/')}"
    response = session.request(method, url, params=params, json=body, timeout=30)
    if response.status_code >= 400:
        die(f"{method} {url} -> {response.status_code}: {response.text[:1200]}")
    if response.status_code == 204 or not response.text.strip():
        return {}
    return response.json()


def write_output(name: str, value: str):
    output = os.getenv("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as f:
            f.write(f"{name}={value}\n")


def host(uri: str) -> str:
    try:
        return (urlparse(uri).hostname or "").lower().removeprefix("www.")
    except Exception:
        return ""


def main():
    raw = os.getenv("GA4_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        die("GA4_SERVICE_ACCOUNT_JSON is missing")
    try:
        info = json.loads(raw)
    except json.JSONDecodeError as exc:
        die(f"GA4_SERVICE_ACCOUNT_JSON is not valid JSON: {exc}")

    credentials = service_account.Credentials.from_service_account_info(info, scopes=[SCOPE])
    session = AuthorizedSession(credentials)

    prop = api(session, "GET", PROPERTY)
    print(f"Property: {prop.get('displayName')} ({PROPERTY})")
    print(f"Timezone: {prop.get('timeZone')} | Currency: {prop.get('currencyCode')}")
    if prop.get("displayName") != "4Planet":
        print("WARNING: property display name differs from expected 4Planet")

    stream_payload = api(session, "GET", f"{PROPERTY}/dataStreams", params={"pageSize": 200})
    streams = stream_payload.get("dataStreams", [])
    web_streams = [s for s in streams if s.get("type") == "WEB_DATA_STREAM"]

    print("\nExisting web streams:")
    for s in web_streams:
        web = s.get("webStreamData", {})
        print(f"- {s.get('displayName')} | {web.get('defaultUri')} | {web.get('measurementId')} | {s.get('name')}")

    primary = next((s for s in web_streams if host(s.get("webStreamData", {}).get("defaultUri", "")) == "4planet.org"), None)
    if primary is None:
        primary = next((s for s in web_streams if s.get("displayName", "").strip().lower() in {"4planet", "4planet web"}), None)

    if primary is None:
        if not APPLY:
            die("No primary 4planet.org web stream exists; run with GA4_APPLY=true to create one")
        primary = api(
            session,
            "POST",
            f"{PROPERTY}/dataStreams",
            body={
                "type": "WEB_DATA_STREAM",
                "displayName": PRIMARY_NAME,
                "webStreamData": {"defaultUri": PRIMARY_URI},
            },
        )
        print(f"Created primary stream: {primary.get('name')}")
    elif APPLY:
        current_name = primary.get("displayName", "")
        current_uri = primary.get("webStreamData", {}).get("defaultUri", "")
        if current_name != PRIMARY_NAME or host(current_uri) != "4planet.org":
            primary = api(
                session,
                "PATCH",
                primary["name"],
                params={"updateMask": "displayName,webStreamData.defaultUri"},
                body={
                    "name": primary["name"],
                    "type": "WEB_DATA_STREAM",
                    "displayName": PRIMARY_NAME,
                    "webStreamData": {"defaultUri": PRIMARY_URI},
                },
            )
            print("Normalized primary stream name/default URI")

    measurement_id = primary.get("webStreamData", {}).get("measurementId", "")
    if not measurement_id:
        refreshed = api(session, "GET", primary["name"])
        measurement_id = refreshed.get("webStreamData", {}).get("measurementId", "")
        primary = refreshed
    if not measurement_id:
        die("Primary stream has no GA4 measurement ID")

    print(f"\nPRIMARY_MEASUREMENT_ID={measurement_id}")
    print("Production domain family:")
    for domain in LIVE_DOMAINS:
        print(f"- {domain}")
    print("Cross-domain linker is enforced in the 4PLANET client code; GA Admin API does not expose the UI's domain list as a stable v1beta resource.")

    existing_dims_payload = api(session, "GET", f"{PROPERTY}/customDimensions", params={"pageSize": 200})
    existing_dims = {d.get("parameterName"): d for d in existing_dims_payload.get("customDimensions", [])}
    for parameter, display, description in CUSTOM_DIMENSIONS:
        if parameter in existing_dims:
            print(f"Custom dimension exists: {parameter}")
        elif APPLY:
            api(
                session,
                "POST",
                f"{PROPERTY}/customDimensions",
                body={
                    "parameterName": parameter,
                    "displayName": display,
                    "description": description,
                    "scope": "EVENT",
                },
            )
            print(f"Created custom dimension: {parameter}")
        else:
            print(f"Would create custom dimension: {parameter}")

    existing_key_payload = api(session, "GET", f"{PROPERTY}/keyEvents", params={"pageSize": 200})
    existing_keys = {k.get("eventName"): k for k in existing_key_payload.get("keyEvents", [])}
    for event_name, counting_method in KEY_EVENTS:
        if event_name in existing_keys:
            print(f"Key event exists: {event_name}")
        elif APPLY:
            api(
                session,
                "POST",
                f"{PROPERTY}/keyEvents",
                body={"eventName": event_name, "countingMethod": counting_method},
            )
            print(f"Created key event: {event_name}")
        else:
            print(f"Would create key event: {event_name}")

    extras = [s for s in web_streams if s.get("name") != primary.get("name")]
    if extras:
        print("\nExtra streams retained intentionally until the unified production tag is verified live:")
        for s in extras:
            print(f"- {s.get('displayName')} | {s.get('webStreamData', {}).get('defaultUri')} | {s.get('name')}")

    write_output("measurement_id", measurement_id)
    write_output("primary_stream", primary.get("name", ""))
    print("\nGA4 admin control PASS" if APPLY else "\nGA4 admin audit PASS")


if __name__ == "__main__":
    main()
