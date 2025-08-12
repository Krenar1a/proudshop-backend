"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2025-08-07

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('admins',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=190), nullable=False),
        sa.Column('name', sa.String(length=120)),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('SUPER_ADMIN','ADMIN','STAFF', name='adminrole'), nullable=False),
        sa.Column('permissions', sa.Text()),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )
    op.create_index('ix_admins_email','admins',['email'])

    op.create_table('admin_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key', sa.String(length=120), nullable=False),
        sa.Column('value', sa.Text()),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )
    op.create_index('ix_admin_settings_key','admin_settings',['key'])

    op.create_table('categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=160), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False)
    )
    op.create_index('ix_categories_slug','categories',['slug'])

    op.create_table('products',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('price_eur', sa.Numeric(10,2)),
        sa.Column('price_lek', sa.Numeric(10,2)),
        sa.Column('stock', sa.Integer(), default=0),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'))
    )

    op.create_table('customers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=190), nullable=False),
        sa.Column('name', sa.String(length=160)),
        sa.Column('phone', sa.String(length=50)),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )
    op.create_index('ix_customers_email','customers',['email'])

    op.create_table('orders',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('order_number', sa.String(length=80), nullable=False),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id')),
        sa.Column('status', sa.Enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELED', name='orderstatus'), nullable=False),
        sa.Column('total_eur', sa.Numeric(10,2), default=0),
        sa.Column('total_lek', sa.Numeric(10,2), default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

    op.create_table('order_items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('order_id', sa.Integer(), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price_eur', sa.Numeric(10,2), nullable=False),
        sa.Column('price_lek', sa.Numeric(10,2), nullable=False)
    )

    op.create_table('cart_items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id')),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )

    op.create_table('refresh_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('admin_id', sa.Integer(), sa.ForeignKey('admins.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(length=128), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False)
    )
    op.create_index('ix_refresh_tokens_token_hash','refresh_tokens',['token_hash'])


def downgrade() -> None:
    op.drop_table('refresh_tokens')
    op.drop_table('cart_items')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('customers')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('admin_settings')
    op.drop_table('admins')
