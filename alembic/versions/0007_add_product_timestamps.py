"""add product timestamps

Revision ID: 0007_add_product_timestamps
Revises: 0006_add_product_is_draft
Create Date: 2025-08-09

"""
from alembic import op
import sqlalchemy as sa

revision = '0007_timestamps'
down_revision = '0006_is_draft'
branch_labels = None
depends_on = None


def upgrade() -> None:
	bind = op.get_bind()
	inspector = sa.inspect(bind)
	cols = {c['name'] for c in inspector.get_columns('products')}
	if 'created_at' not in cols:
		op.add_column('products', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()))
	if 'updated_at' not in cols:
		op.add_column('products', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()))
	# Attempt to drop server defaults to let application manage timestamps
	try:
		with op.batch_alter_table('products') as batch_op:
			batch_op.alter_column('created_at', server_default=None)
			batch_op.alter_column('updated_at', server_default=None)
	except Exception:
		pass


def downgrade() -> None:
	try:
		op.drop_column('products', 'updated_at')
		op.drop_column('products', 'created_at')
	except Exception:
		pass
