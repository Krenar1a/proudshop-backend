from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_shipping'
down_revision = '0002_images'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('orders') as batch_op:
        batch_op.add_column(sa.Column('shipping_name', sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column('shipping_email', sa.String(length=190), nullable=True))
        batch_op.add_column(sa.Column('shipping_phone', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('shipping_address', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('shipping_city', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('shipping_zip', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('shipping_country', sa.String(length=80), nullable=True))

def downgrade():
    with op.batch_alter_table('orders') as batch_op:
        batch_op.drop_column('shipping_country')
        batch_op.drop_column('shipping_zip')
        batch_op.drop_column('shipping_city')
        batch_op.drop_column('shipping_address')
        batch_op.drop_column('shipping_phone')
        batch_op.drop_column('shipping_email')
        batch_op.drop_column('shipping_name')
