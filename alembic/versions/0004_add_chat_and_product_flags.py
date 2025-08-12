from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_add_chat_and_product_flags'
down_revision = '0003_add_shipping_fields_to_orders'
branch_labels = None
depends_on = None


def upgrade():
    """Add product merchandising flags and chat tables.

    Uses simple op.add_column instead of batch_alter_table to avoid
    the SQLite temp table (_alembic_tmp_products) conflict that was
    causing OperationalError when the migration re-ran after a partial
    failure. SQLite can add nullable columns without a table rebuild,
    so batch mode is unnecessary here.
    """
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    existing_product_cols = {c['name'] for c in inspector.get_columns('products')}
    # Product merchandising fields (safe direct adds for SQLite); guard for re-runs
    if 'is_featured' not in existing_product_cols:
        op.add_column('products', sa.Column('is_featured', sa.Boolean(), nullable=False, server_default=sa.text('0')))
    if 'is_offer' not in existing_product_cols:
        op.add_column('products', sa.Column('is_offer', sa.Boolean(), nullable=False, server_default=sa.text('0')))
    if 'discount_price_eur' not in existing_product_cols:
        op.add_column('products', sa.Column('discount_price_eur', sa.Numeric(10, 2), nullable=True))
    if 'discount_price_lek' not in existing_product_cols:
        op.add_column('products', sa.Column('discount_price_lek', sa.Numeric(10, 2), nullable=True))

    # Chat tables (only create if missing)
    if 'chat_sessions' not in inspector.get_table_names():
        op.create_table(
            'chat_sessions',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('session_id', sa.String(length=64), nullable=False, unique=True, index=True),
            sa.Column('customer_email', sa.String(length=190), nullable=True),
            sa.Column('customer_name', sa.String(length=160), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column('last_activity_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    if 'chat_messages' not in inspector.get_table_names():
        op.create_table(
            'chat_messages',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('session_id', sa.Integer(), sa.ForeignKey('chat_sessions.id', ondelete='CASCADE'), nullable=False, index=True),
            sa.Column('role', sa.String(length=20), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )


def downgrade():
    # Drop chat tables first (FK dependency) if they exist
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if 'chat_messages' in tables:
        op.drop_table('chat_messages')
    if 'chat_sessions' in tables:
        op.drop_table('chat_sessions')

    # Drop product columns (SQLite supports DROP COLUMN >= 3.35; if older, manual rebuild would be needed)
    try:
        op.drop_column('products', 'discount_price_lek')
        op.drop_column('products', 'discount_price_eur')
        op.drop_column('products', 'is_offer')
        op.drop_column('products', 'is_featured')
    except Exception:
        # Best-effort; in dev environments with older SQLite this may need manual table rebuild.
        pass
