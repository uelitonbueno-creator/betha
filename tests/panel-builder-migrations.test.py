"""Validate panel D1 migrations in an isolated SQLite memory database."""
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [
    "20261009_panel_drafts.sql",
    "20261009_panel_placement.sql",
    "20261009_panel_sort_order.sql",
]
connection = sqlite3.connect(":memory:")
for filename in MIGRATIONS:
    sql = (ROOT / "backend" / "migrations" / filename).read_text(encoding="utf-8")
    connection.executescript(sql)

columns = {row[1]: row for row in connection.execute("PRAGMA table_info(bi_panel_drafts)")}
required = {"id", "tenant_id", "system_id", "owner_id", "title",
            "definition_json", "view_id", "sort_order", "created_at", "updated_at"}
assert required <= set(columns), f"Missing columns: {required - set(columns)}"
assert columns["view_id"][3] == 1, "view_id must be NOT NULL"
assert columns["sort_order"][3] == 1, "sort_order must be NOT NULL"
connection.execute(
    """INSERT INTO bi_panel_drafts
    (id,tenant_id,system_id,owner_id,title,definition_json)
    VALUES (?,?,?,?,?,?)""",
    ("test-id", "tenant-a", "contabil", "alice", "Title", "{}"),
)
view, order = connection.execute(
    "SELECT view_id,sort_order FROM bi_panel_drafts WHERE id='test-id'"
).fetchone()
assert (view, order) == ("", 0), "Existing draft defaults must be compatible"
indexes = {row[1] for row in connection.execute("PRAGMA index_list(bi_panel_drafts)")}
assert "idx_bi_panel_sort" in indexes
assert "idx_bi_panel_drafts_scope" in indexes
print("Panel D1 migrations: schema, defaults and indexes verified.")
