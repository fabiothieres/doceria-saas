alter table products enable row level security;
alter table orders enable row level security;
alter table options enable row level security;

drop policy if exists "products_select_public" on products;
drop policy if exists "products_insert_public" on products;
drop policy if exists "products_update_public" on products;
drop policy if exists "products_delete_public" on products;

drop policy if exists "orders_select_public" on orders;
drop policy if exists "orders_insert_public" on orders;
drop policy if exists "orders_update_public" on orders;
drop policy if exists "orders_delete_public" on orders;

drop policy if exists "options_select_public" on options;
drop policy if exists "options_insert_public" on options;
drop policy if exists "options_update_public" on options;
drop policy if exists "options_delete_public" on options;

drop policy if exists "products_select_authenticated" on products;
drop policy if exists "products_insert_authenticated" on products;
drop policy if exists "products_update_authenticated" on products;
drop policy if exists "products_delete_authenticated" on products;

drop policy if exists "orders_select_authenticated" on orders;
drop policy if exists "orders_insert_authenticated" on orders;
drop policy if exists "orders_update_authenticated" on orders;
drop policy if exists "orders_delete_authenticated" on orders;

drop policy if exists "options_select_authenticated" on options;
drop policy if exists "options_insert_authenticated" on options;
drop policy if exists "options_update_authenticated" on options;
drop policy if exists "options_delete_authenticated" on options;

create policy "products_select_authenticated"
on products for select
to authenticated
using (true);

create policy "products_insert_authenticated"
on products for insert
to authenticated
with check (true);

create policy "products_update_authenticated"
on products for update
to authenticated
using (true)
with check (true);

create policy "products_delete_authenticated"
on products for delete
to authenticated
using (true);

create policy "orders_select_authenticated"
on orders for select
to authenticated
using (true);

create policy "orders_insert_authenticated"
on orders for insert
to authenticated
with check (true);

create policy "orders_update_authenticated"
on orders for update
to authenticated
using (true)
with check (true);

create policy "orders_delete_authenticated"
on orders for delete
to authenticated
using (true);

create policy "options_select_authenticated"
on options for select
to authenticated
using (true);

create policy "options_insert_authenticated"
on options for insert
to authenticated
with check (true);

create policy "options_update_authenticated"
on options for update
to authenticated
using (true)
with check (true);

create policy "options_delete_authenticated"
on options for delete
to authenticated
using (true);