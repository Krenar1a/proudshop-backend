from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_source_url'
down_revision = '0004_chat_flags'
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c['name'] for c in inspector.get_columns('products')}
    if 'source_url' not in cols:
        op.add_column('products', sa.Column('source_url', sa.Text(), nullable=True))


def downgrade():
    try:
        op.drop_column('products', 'source_url')
    except Exception:
        pass
