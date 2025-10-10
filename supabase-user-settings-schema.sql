-- User Settings Table for Referral Codes
create table user_settings (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  gmgn_ref text,
  axiom_ref text,
  photon_ref text,
  bullx_ref text,
  trojan_ref text,
  onboarded boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for faster wallet lookups
create index idx_user_settings_wallet on user_settings(wallet_address);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_user_settings_updated_at
  before update on user_settings
  for each row
  execute function update_updated_at_column();
