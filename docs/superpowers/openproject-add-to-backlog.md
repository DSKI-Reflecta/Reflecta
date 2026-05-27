# OpenProject: Add Items to the Backlog

> **Guide for agentic workers:** This document explains how to create work package items in the Reflecta project backlog on the OpenProject instance at `http://54.154.135.39`.

---

## Overview

OpenProject uses **work packages** as its universal work item. Adding an item to the _product backlog_ means creating a work package of the correct type (e.g. `Feature`, `Bug`, `User Story`) with **no sprint/version assigned**, so it lands in the unscheduled product backlog.

The Reflecta project identifier is **`reflecta`**.  
Base URL: `http://54.154.135.39`  
API base: `http://54.154.135.39/api/v3`

---

## Step 0: Obtain an API Token

All API calls require authentication. Use an API token with HTTP Basic Auth:

- **Username:** `apikey` (literal string, not your login name)
- **Password:** your personal API token

To generate a token:

1. Log in to `http://54.154.135.39/my/access_tokens`
2. Click **Generate** and copy the token (format: `opapi-...`)

Store the token in an environment variable:

```bash
export OP_TOKEN="opapi-YOUR_TOKEN_HERE"
export OP_BASE="http://54.154.135.39/api/v3"
```

All examples below use `$OP_TOKEN` and `$OP_BASE`.

---

## Step 1: Look Up the Project ID

The API uses numeric project IDs, not identifiers. Fetch the Reflecta project record once to get it:

```bash
curl -s -u "apikey:$OP_TOKEN" \
  "$OP_BASE/projects/reflecta" \
  | python -m json.tool | grep '"id"'
```

Expected output (example):

```json
"id": 1,
```

Save this for use in subsequent calls:

```bash
export PROJECT_ID=1
```

---

## Step 2: Discover Available Types

Work packages require a `type` link. The types available in the project may differ from the global list. Fetch the project's configured types:

```bash
curl -s -u "apikey:$OP_TOKEN" \
  "$OP_BASE/projects/$PROJECT_ID/types" \
  | python -m json.tool
```

Each entry has an `id` and `name`. Common types for a backlog:

| Name         | Typical Use                 |
| ------------ | --------------------------- |
| `Feature`    | New functionality           |
| `Bug`        | Defects to fix              |
| `User Story` | User-facing stories (Scrum) |
| `Task`       | Technical tasks             |
| `Epic`       | Large feature groupings     |

Note the `id` of the type you want. For example:

```bash
export TYPE_ID=1   # e.g. Feature
```

---

## Step 3: Discover Available Statuses and Priorities

### Statuses

```bash
curl -s -u "apikey:$OP_TOKEN" "$OP_BASE/statuses" | python -m json.tool
```

For a new backlog item, use a status like **`New`** or **`Open`**. Note its `id`.

```bash
export STATUS_ID=1   # e.g. "New"
```

### Priorities

```bash
curl -s -u "apikey:$OP_TOKEN" "$OP_BASE/priorities" | python -m json.tool
```

Common values: `Low`, `Normal`, `High`, `Immediate`. Note the `id` of your desired priority.

```bash
export PRIORITY_ID=8   # e.g. "Normal"
```

---

## Step 4: Create the Backlog Item

POST a new work package to the project. **Do not include a `version` (sprint) link** — omitting it places the item in the product backlog.

### Minimal Request

```bash
curl -s -X POST \
  -u "apikey:$OP_TOKEN" \
  -H "Content-Type: application/json" \
  "$OP_BASE/projects/$PROJECT_ID/work_packages" \
  -d '{
    "subject": "As a user, I want to export my journal as PDF",
    "_links": {
      "type": { "href": "/api/v3/types/'"$TYPE_ID"'" },
      "status": { "href": "/api/v3/statuses/'"$STATUS_ID"'" },
      "priority": { "href": "/api/v3/priorities/'"$PRIORITY_ID"'" }
    }
  }' | python -m json.tool
```

### Full Request with All Common Fields

```bash
curl -s -X POST \
  -u "apikey:$OP_TOKEN" \
  -H "Content-Type: application/json" \
  "$OP_BASE/projects/$PROJECT_ID/work_packages" \
  -d '{
    "subject": "Add dark mode support",
    "description": {
      "format": "markdown",
      "raw": "## Summary\nAllow users to switch between light and dark themes.\n\n## Acceptance Criteria\n- Toggle in settings\n- Persists across sessions\n- Applies to all pages"
    },
    "storyPoints": 3,
    "estimatedTime": "PT4H",
    "_links": {
      "type":     { "href": "/api/v3/types/'"$TYPE_ID"'" },
      "status":   { "href": "/api/v3/statuses/'"$STATUS_ID"'" },
      "priority": { "href": "/api/v3/priorities/'"$PRIORITY_ID"'" }
    }
  }' | python -m json.tool
```

**Field reference:**

| Field                | Type              | Notes                                        |
| -------------------- | ----------------- | -------------------------------------------- |
| `subject`            | string (required) | Title of the work package, max 255 chars     |
| `description.format` | string            | Use `"markdown"`                             |
| `description.raw`    | string            | Markdown body text                           |
| `storyPoints`        | integer           | Requires Backlogs module enabled in project  |
| `estimatedTime`      | ISO 8601 duration | e.g. `"PT4H"` = 4 hours, `"P1D"` = 1 day     |
| `startDate`          | date string       | `"YYYY-MM-DD"` — leave unset for unscheduled |
| `dueDate`            | date string       | `"YYYY-MM-DD"` — leave unset for unscheduled |
| `_links.type`        | HAL link          | Required                                     |
| `_links.status`      | HAL link          | Required                                     |
| `_links.priority`    | HAL link          | Required                                     |
| `_links.assignee`    | HAL link          | Optional: `"/api/v3/users/{id}"`             |
| `_links.version`     | HAL link          | **Omit** to place in product backlog         |

---

## Step 5: Verify the Item Was Created

The response body from the POST contains the new work package's `id`. Confirm it appears in the backlog:

```bash
# View in browser
echo "http://54.154.135.39/projects/reflecta/backlogs"

# Or via API — list unversioned work packages (product backlog)
curl -s -u "apikey:$OP_TOKEN" \
  "$OP_BASE/projects/$PROJECT_ID/work_packages?filters=%5B%7B%22version%22%3A%7B%22operator%22%3A%22%21*%22%2C%22values%22%3A%5B%5D%7D%7D%5D" \
  | python -m json.tool | grep '"subject"'
```

---

## Step 6: Read the Current Backlog

Use the same unscheduled filter to read all product backlog items and include useful fields.

### Read backlog with curl

```bash
curl -s -u "apikey:$OP_TOKEN" \
  "$OP_BASE/projects/$PROJECT_ID/work_packages?pageSize=100&sortBy=%5B%5B%22id%22%2C%22asc%22%5D%5D&filters=%5B%7B%22version%22%3A%7B%22operator%22%3A%22%21*%22%2C%22values%22%3A%5B%5D%7D%7D%5D" \
  | python -m json.tool
```

The response is a collection in `_embedded.elements`. For each item, read:

- `id`
- `subject`
- `_links.type.title`
- `_links.status.title`
- `_links.priority.title`

### Compact output (PowerShell)

```powershell
$res = Invoke-RestMethod -Method Get -Uri "$OP_BASE/projects/$PROJECT_ID/work_packages?pageSize=100&sortBy=%5B%5B%22id%22%2C%22asc%22%5D%5D&filters=%5B%7B%22version%22%3A%7B%22operator%22%3A%22%21*%22%2C%22values%22%3A%5B%5D%7D%7D%5D" -Headers @{ Authorization = "Basic $basic" }
foreach ($wp in $res._embedded.elements) {
  "#{0}`t{1}`t{2}`t{3}`t{4}" -f $wp.id, $wp._links.type.title, $wp._links.status.title, $wp._links.priority.title, $wp.subject
}
```

---

## Python Example

For agents using Python rather than curl:

```python
import os
import requests

BASE = "http://54.154.135.39/api/v3"
AUTH = ("apikey", os.environ["OP_TOKEN"])

def get_project_id(identifier: str) -> int:
    r = requests.get(f"{BASE}/projects/{identifier}", auth=AUTH)
    r.raise_for_status()
    return r.json()["id"]

def get_type_id(project_id: int, type_name: str) -> int:
    r = requests.get(f"{BASE}/projects/{project_id}/types", auth=AUTH)
    r.raise_for_status()
    for t in r.json()["_embedded"]["elements"]:
        if t["name"].lower() == type_name.lower():
            return t["id"]
    raise ValueError(f"Type '{type_name}' not found in project")

def get_status_id(status_name: str) -> int:
    r = requests.get(f"{BASE}/statuses", auth=AUTH)
    r.raise_for_status()
    for s in r.json()["_embedded"]["elements"]:
        if s["name"].lower() == status_name.lower():
            return s["id"]
    raise ValueError(f"Status '{status_name}' not found")

def get_priority_id(priority_name: str) -> int:
    r = requests.get(f"{BASE}/priorities", auth=AUTH)
    r.raise_for_status()
    for p in r.json()["_embedded"]["elements"]:
        if p["name"].lower() == priority_name.lower():
            return p["id"]
    raise ValueError(f"Priority '{priority_name}' not found")

def add_to_backlog(
    subject: str,
    description: str = "",
    type_name: str = "Feature",
    status_name: str = "New",
    priority_name: str = "Normal",
    story_points: int | None = None,
) -> dict:
    project_id = get_project_id("reflecta")
    type_id = get_type_id(project_id, type_name)
    status_id = get_status_id(status_name)
    priority_id = get_priority_id(priority_name)

    payload = {
        "subject": subject,
        "_links": {
            "type":     {"href": f"/api/v3/types/{type_id}"},
            "status":   {"href": f"/api/v3/statuses/{status_id}"},
            "priority": {"href": f"/api/v3/priorities/{priority_id}"},
        },
    }
    if description:
        payload["description"] = {"format": "markdown", "raw": description}
    if story_points is not None:
        payload["storyPoints"] = story_points

    r = requests.post(
        f"{BASE}/projects/{project_id}/work_packages",
        auth=AUTH,
        json=payload,
    )
    r.raise_for_status()
    return r.json()

  def list_backlog(project_identifier: str = "reflecta") -> list[dict]:
    project_id = get_project_id(project_identifier)
    params = {
      "pageSize": 100,
      "sortBy": '[["id","asc"]]',
      "filters": '[{"version":{"operator":"!*","values":[]}}]',
    }
    r = requests.get(
      f"{BASE}/projects/{project_id}/work_packages",
      auth=AUTH,
      params=params,
    )
    r.raise_for_status()
    return r.json().get("_embedded", {}).get("elements", [])

# Usage
item = add_to_backlog(
    subject="Add export to PDF feature",
    description="Users should be able to export journal entries as a PDF.",
    type_name="Feature",
    priority_name="Normal",
    story_points=5,
)
print(f"Created work package #{item['id']}: {item['subject']}")

for wp in list_backlog():
  print(
    f"#{wp['id']} | {wp['_links']['type']['title']} | "
    f"{wp['_links']['status']['title']} | {wp['_links']['priority']['title']} | "
    f"{wp['subject']}"
  )
```

---

## Common Errors

| HTTP Status                | Cause                                   | Fix                                               |
| -------------------------- | --------------------------------------- | ------------------------------------------------- |
| `401 Unauthorized`         | Missing or invalid token                | Check `OP_TOKEN`; use `apikey` as username        |
| `403 Forbidden`            | Account lacks permission in project     | Request `add work packages` permission from admin |
| `404 Not Found`            | Wrong project ID or type/status ID      | Re-fetch IDs; don't hardcode across environments  |
| `422 Unprocessable Entity` | Missing required field or invalid value | Check `message` in response body for details      |

---

## Quick Reference

```
Project URL:  http://54.154.135.39/projects/reflecta
Backlog URL:  http://54.154.135.39/projects/reflecta/backlogs
API root:     http://54.154.135.39/api/v3

Create WP:    POST /api/v3/projects/{id}/work_packages
Read backlog: GET  /api/v3/projects/{id}/work_packages?filters=[{"version":{"operator":"!*","values":[]}}]
List types:   GET  /api/v3/projects/{id}/types
List status:  GET  /api/v3/statuses
List prio:    GET  /api/v3/priorities
Auth:         Basic auth — username: apikey, password: <token>
```
