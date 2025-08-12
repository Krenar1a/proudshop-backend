import sqlite3, json, os
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'proudshop.db')
DB_PATH = os.path.abspath(DB_PATH)
print('Using DB:', DB_PATH)
con = sqlite3.connect(DB_PATH)
cur = con.cursor()
cur.execute('PRAGMA table_info(products)')
product_cols = [r[1] for r in cur.fetchall()]
print('PRODUCT_COLS:', product_cols)
chat_tables = []
for t in ('chat_sessions','chat_messages'):
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,))
    if cur.fetchone():
        chat_tables.append(t)
print('CHAT_TABLES:', chat_tables)
cur.execute("SELECT version_num FROM alembic_version")
print('ALEMBIC_VERSION:', cur.fetchall())
