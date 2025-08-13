"""add product slug

Revision ID: 0008_add_product_slug
Revises: 0007_add_product_timestamps
Create Date: 2025-08-09

"""
from alembic import op
import sqlalchemy as sa

revision = '0008_add_product_slug'
down_revision = '0007_add_product_timestamps'
branch_labels = None
depends_on = None


def upgrade() -> None:
	bind = op.get_bind()
	inspector = sa.inspect(bind)
	cols = {c['name'] for c in inspector.get_columns('products')}
	if 'slug' not in cols:
		op.add_column('products', sa.Column('slug', sa.String(length=220), nullable=True))
		# Optional: create index if many lookups (guard if re-run)
		indexes = {ix['name'] for ix in inspector.get_indexes('products')}
		if 'ix_products_slug' not in indexes:
			op.create_index('ix_products_slug', 'products', ['slug'])
	# Backfill simple slugs for existing rows where slug is NULL
	# (lowercase, spaces -> hyphen, basic ASCII pass-through)
	try:
		conn = op.get_bind()
		rows = conn.execute(sa.text("SELECT id, title FROM products WHERE slug IS NULL OR slug = ''"))
		seen = set()
		for rid, title in rows:
			base = (title or '').strip().lower().replace(' ', '-')[:180]
			if not base:
				base = f"product-{rid}"
			slug = base
			i = 2
			while slug in seen:
				slug = f"{base}-{i}"; i += 1
			seen.add(slug)
			conn.execute(sa.text("UPDATE products SET slug = :slug WHERE id = :id"), {"slug": slug, "id": rid})
	except Exception:
		# Non-fatal; manual backfill can be performed later.
		pass


def downgrade() -> None:
	try:
		op.drop_index('ix_products_slug', table_name='products')
	except Exception:
		pass
	try:
		op.drop_column('products', 'slug')
	except Exception:
		pass
