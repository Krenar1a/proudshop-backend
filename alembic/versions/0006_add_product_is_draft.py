"""add product is_draft

Revision ID: 0006_add_product_is_draft
Revises: 0005_add_product_source_url
Create Date: 2025-08-09

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0006_is_draft'
down_revision = '0005_source_url'
branch_labels = None
depends_on = None


def upgrade() -> None:
	bind = op.get_bind()
	inspector = sa.inspect(bind)
	cols = {c['name'] for c in inspector.get_columns('products')}
	if 'is_draft' not in cols:
		op.add_column('products', sa.Column('is_draft', sa.Boolean(), nullable=False, server_default=sa.text('false')))
		# Remove server default afterwards for cleanliness (only for new rows)
		try:
			with op.batch_alter_table('products') as batch_op:
				batch_op.alter_column('is_draft', server_default=None)
		except Exception:
			pass


def downgrade() -> None:
	try:
		op.drop_column('products', 'is_draft')
	except Exception:
		pass
