--
-- 12_currency_payment_department.sql
--
-- Natural-key-safe seed for the three reference tables that have ONLY a
-- primary key on `id` and NO natural-key UNIQUE constraint:
--   * common.currency      -> natural key (code, name)
--   * sc.payment_term       -> natural key (name)
--   * common.department     -> natural key (code)
--
-- Why this file exists (and why plain ON CONFLICT DO NOTHING is unsafe here):
--   ON CONFLICT (the form used in 10_reference_data.sql) can only fire on an
--   existing constraint. For these tables the ONLY constraint is the PK on `id`.
--   If a target database already holds this reference data under DIFFERENT ids
--   (e.g. a UAT/Prod env that generated its own UUIDs), an id-based ON CONFLICT
--   would NOT match and the seed would INSERT DUPLICATE rows.
--
-- The guard below stages the rows in a session-local TEMP table (created with
-- LIKE, so it copies COLUMNS ONLY -- no constraints) and then inserts only the
-- rows whose NATURAL KEY does not already exist in the live table. This makes
-- the seed a provable no-op on any database that already contains the data,
-- regardless of the ids it stored it under, while still populating a fresh DB.
--
-- Row values are kept VERBATIM from the original pg_dump INSERTs. Each staged
-- INSERT uses an EXPLICIT column list (in pg_dump value order) so it is immune
-- to physical column-order differences between the pg_dump source schema and
-- the EF Core migration schema (notably common.department, whose audit / FK
-- columns sit in a different order). Audit emails are already scrubbed to
-- 'system@spacelinx.local'.
--
-- This file wraps its body in an explicit BEGIN/COMMIT so it is correct under ANY psql
-- invocation: the ON COMMIT DROP temp tables require a single surrounding transaction, and
-- psql runs statements in autocommit unless told otherwise. Wrapping here (rather than relying
-- on a `psql -1` caller) also makes the seed atomic — partial failure rolls back cleanly.
--

BEGIN;
-- DATA NOTE (common.currency): the source data is NOT perfectly unique on
-- (code, name) -- ('USD','US Dollar') and ('EUR','Euro') each appear twice
-- (different id/country/symbol). The guard handles this correctly: a fresh DB
-- still loads all 159 source rows (the NOT EXISTS check runs against the live
-- table before the bulk INSERT), and any re-run is a no-op because the first
-- copy already satisfies the natural key. Idempotency is therefore preserved;
-- but a true UNIQUE(code,name) constraint could NOT be added without first
-- de-duplicating these two pairs.
--

-- ---------------------------------------------------------------------------
-- common.currency : natural-key-safe on (code, name)
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE _seed_currency (LIKE common.currency) ON COMMIT DROP;
INSERT INTO _seed_currency
    (id, code, name, symbol, country, minor_unit, is_active,
     created_at, created_by, updated_at, updated_by, deleted_at, deleted_by)
VALUES
('0195b36f-8462-4e08-8205-6f0d5388a536', 'HUF', 'Forint', 'Ft', 'Hungary', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('02a8aa5d-8cb1-4408-9fb3-c348e3123898', 'ISK', 'Iceland Krona', 'Íkr', 'Iceland', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('0734332e-5002-4d32-89d1-4e25e4cc577e', 'PKR', 'Pakistani Rupee', 'PKR', 'Pakistan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('08757090-089b-444f-abff-52bb9574115f', 'BTN', 'Ngultrum', 'Nu', 'Bhutan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('0afd1cdf-b1e6-4f8d-af90-60ff24a3ce04', 'USD', 'US Dollar', '$ ', 'Turks and Caicos Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('0bd1e069-cb75-457a-9323-db1c859725ac', 'UYU', 'Peso Uruguayo', '$U', 'Uruguay', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('0be106b8-1e9a-4526-ac3a-8b4f7d4994cb', 'KWD', 'Kuwaiti Dinar', 'KD', 'Kuwait', 3, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('0e361d27-cedc-47cd-86f7-204e2c327351', 'PHP', 'Philippine Peso', '₱', 'Philippines', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('108f1c05-23f9-4a3b-9e3b-ae484149b5b9', 'BMD', 'Bermudian Dollar', '$', 'Bermuda', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('1214f829-b321-4370-8482-3b76e35b76ae', 'NPR', 'Nepalese Rupee', 'NPR', 'Nepal', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('157a1bcf-1eb5-45ac-ab9e-7d7f0c168e7c', 'AFN', 'Afghani', '؋', 'Afghanistan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('16cc9614-79d2-4d0b-941e-11f4d0181087', 'HNL', 'Lempira', 'L', 'Honduras', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('181df7eb-da7d-4866-8808-dae3d4e9d73f', 'ETB', 'Ethiopian Birr', 'Br', 'Ethiopia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('189d836b-def2-4b1c-a1f8-1a5c364cb2cb', 'SAR', 'Saudi Riyal', '﷼', 'Saudi Arabia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('18fc5d0c-ce60-4e51-bba5-16a70a63ea37', 'GEL', 'Lari', '₾', 'Georgia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('1b3587a2-d13c-4ce3-ab24-cc643471fe9b', 'KPW', 'North Korean Won', '₩', 'North Korea', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('1ddf08db-ad6c-4a84-aa2d-22e21592e617', 'BOB', 'Boliviano', 'BOB', 'Bolivia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('1fe0557e-8952-417b-9007-b1d3dfa5b117', 'ERN', 'Nakfa', 'NFK', 'Eritrea', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('20c8ee1d-462d-4e06-93bf-28a5d033defa', 'RON', 'Romanian Leu', 'RON', 'Romania', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('22d13d17-0449-4ce0-865b-e21b5a824e9e', 'LYD', 'Libyan Dinar', 'ل.د', 'Libya', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('245f7a6f-5e95-4de0-b55d-e7ea5f39c27d', 'NAD', 'Namibian Dollar', 'N$', 'Namibia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('24a08fb1-1532-4fd3-9ad5-25e358063402', 'MDL', 'Moldovan Leu', 'Leu', 'Moldova', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('24c4f75b-d55d-4fb6-8ed5-8b7011b71314', 'AUD', 'Australian Dollar', 'AU$', 'Australia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('25c6bef9-911c-4561-b090-4969ac87aa51', 'AED', 'UAE Dirham', 'AED', 'United Arab Emirates', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('26475323-06ad-4d42-9e01-8254d4efa74c', 'BIF', 'Burundi Franc', 'FBu‎‎', 'Burundi', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('2997cc50-ea2d-44de-ae86-b062a145a3a6', 'GBP', 'Pound Sterling', '£', 'United Kingdom', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('2b8e0ceb-517e-4f93-9c83-8015f0efc6c7', 'XAF', 'CFA Franc BEAC', 'FCFA', 'Chad', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('304cc966-c41c-4f40-a8a6-66c2d9658444', 'UZS', 'Uzbekistan Sum', 'лв', 'Uzbekistan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('3142fbe6-dd01-4530-bf0e-f6bead5b3b01', 'HRK', 'Kuna', 'kn', 'Croatia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('34492f84-f2d7-4263-af80-f9cb1b4c07e5', 'KRW', 'Won', '₩', 'South Korea', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('35bc0097-1b7b-4ad0-8a65-210fd225555d', 'AOA', 'Kwanza', 'Kz', 'Angola', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('36920883-26e6-4757-9a7b-7999016e5307', 'EUR', 'Euro', '€', 'Ireland', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('37082bfe-6aba-4b4b-a111-d45e3e34e632', 'IDR', 'Rupiah', 'Rp', 'Indonesia', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('3775a2c4-9366-47a1-bafd-516cd08ba965', 'XOF', 'West African CFA Franc', 'MAF', 'Senegal', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('37aa6f8a-566e-4184-ae60-adfc360a3837', 'CLP', 'Chilean Peso', 'CLP$', 'Chile', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('3aeaa500-edec-4a45-8374-98ff924e7f65', 'SBD', 'Solomon Islands Dollar', 'SI$', 'Solomon Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('3c40f9ba-8295-4b64-a63c-893618a8c928', 'GYD', 'Guyana Dollar', 'GY$', 'Guyana', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('3df70277-4d37-4d8d-aa40-036cb8ea51b0', 'BGN', 'Bulgarian Lev', 'лв', 'Bulgaria', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('409b170c-d1e7-4db4-8db8-8bca6d21ac56', 'MAD', 'Moroccan Dirham', 'DH', 'Morocco', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('41a56807-726f-400e-b53e-ec49a132a116', 'SGD', 'Singapore Dollar', 'S$', 'Singapore', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('427db9e6-a491-40d7-b0d2-7e8934ceab66', 'JPY', 'Yen', '¥', 'Japan', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('45ccdf3a-9cc8-48c0-80a0-28823abb3eca', 'OMR', 'Omani Rial', 'OMR', 'Oman', 3, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('4607da85-25c0-4cb1-b5f9-059a86faa2cf', 'DOP', 'Dominican Peso', 'RD$', 'Dominican Republic', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('48919180-37ac-487b-a481-c942469e3d86', 'TOP', 'Paanga', 'T$', 'Tonga', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('4abd7def-9792-4b27-b132-7a4b952b38aa', 'SHP', 'Saint Helena Pound', '£', 'Saint Helena', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('54b02925-4dfa-4acd-b14e-28d35bd91593', 'TMT', 'Manat', 'TMT', 'Turkmenistan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('55542697-af40-45db-8e93-82676299ac41', 'TTD', 'Trinidad and Tobago Dollar', 'TT$', 'Trinidad and Tobago', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('58c69ba3-c1f3-426e-958e-1e2fdef678a9', 'BRL', 'Brazilian Real', 'R$', 'Brazil', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('59e27ff9-9986-4d1c-8cf3-a2129db20f8a', 'MZN', 'Mozambican Metical', 'MT', 'Mozambique', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('5d366765-2634-4b38-b4b3-86093749b413', 'VND', 'Dong', '₫', 'Vietnam', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('600ced11-9219-4ead-9556-d3a18c0206a3', 'CZK', 'Czech Koruna', 'CZK', 'Czech Republic', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6018cff2-c518-489f-bcbc-38c3749efaf3', 'NZD', 'New Zealand Dollar', 'NZ$', 'Cook Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('602bf9f3-4dae-403b-8c00-a6700159a487', 'GHS', 'Ghana Cedi', 'GH₵', 'Ghana', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('60452b78-398e-47df-8df8-eebaae07b993', 'CNY', 'Yuan Renminbi', '¥', 'China', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('605610be-8413-4c7e-8f63-c1177e222c20', 'ZAR', 'South African Rand', 'R', 'South Africa', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('643c79a7-b25f-4895-accb-d340281ad66b', 'SYP', 'Syrian Pound', '£', 'Syria', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('67061721-3714-4a39-a276-d05b50541780', 'MYR', 'Malaysian Ringgit', 'RM', 'Malaysia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6783d27a-1def-4f35-a667-9002fdfc3662', 'CUP', 'Cuban Peso', 'CUP', 'Cuba', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6985ccdc-18d6-4972-80dd-671b3b7ef705', 'SRD', 'Surinamese Dollar', 'SR$', 'Suriname', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('69a60f78-dfd9-4c74-899e-71f9e1b56fea', 'JEP', 'Pound Sterling', '£', 'Jersey', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('69c2fdfd-49de-4bf9-8e15-a37e56fc8d42', 'DKK', 'Danish Krone', 'kr.', 'Faroe Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('69f6939b-3183-4805-b716-24bbd3965125', 'MMK', 'Kyat', 'K', 'Myanmar', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6a3f2ca0-6057-4df4-b0bb-d091dccebefc', 'TWD', 'New Taiwan Dollar', 'NT$', 'Taiwan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6b76e52d-094f-470b-bffa-64bea945f6f8', 'UAH', 'Hryvnia', 'UAH', 'Ukraine', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6eb8a8fa-6a8b-4734-8b98-f8d9f7fd60b9', 'DJF', 'Djibouti Franc', 'Fdj', 'Djibouti', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6f4ad2bf-e39d-4f1d-8cf8-4664bac22997', 'SSP', 'South Sudanese Pound', '£', 'South Sudan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('70c9add9-6812-49da-892c-5ce31c5d2eeb', 'PLN', 'Polish Zloty', 'zł', 'Poland', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7170549d-27c2-4ad1-95d0-b3de8219f125', 'JMD', 'Jamaican Dollar', 'J$', 'Jamaica', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('71fce971-813c-4ba0-9960-c189d5a16382', 'LRD', 'Liberian Dollar', 'L$', 'Liberia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('72bb187a-a30d-413b-8069-ada1a384bb30', 'MOP', 'Macanese Pataca', 'MOP$', 'Macau', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('755ffd99-ba15-49e6-abef-075ce8812de6', 'AWG', 'Aruban Florin', 'ƒ', 'Aruba', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('765ed249-4cd5-44e0-a7f8-72e6ad429787', 'XCD', 'East Caribbean Dollar', 'EC$', 'Anguilla', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('76f4348d-a9d7-442c-b0e1-963d7e8b0f77', 'COP', 'Colombian Peso', 'Col$', 'Colombia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('770a85bf-9fa2-4c41-bf6c-abde0d7d259c', 'GMD', 'Dalasi', 'GMD', 'Gambia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('783c1403-e873-4998-9e2c-16860b46deb9', 'XPF', 'CFP Franc', 'F', 'Wallis and Futuna Islands', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('787fa079-f9e9-4345-b995-2c907d1d33d8', 'LBP', 'Lebanese Pound', 'L£', 'Lebanon', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7896e76a-2901-4dfc-9b07-72d2385e5b0f', 'UGX', 'Uganda Shilling', 'Ush', 'Uganda', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('79baef60-28e2-411c-91c3-d4ec5c48d7cc', 'CVE', 'Cape Verde Escudo', '$', 'Cape Verde', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7b01c9a4-64f3-446c-ae64-2ba8f83d671b', 'IMP', 'Pound Sterling', '£', 'Isle of Man', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7b69aa3f-43b2-4737-9d37-6d4fb0e99f76', 'ZMW', 'Zambian Kwacha', 'ZK', 'Zambia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7cbca2cd-e470-4e2e-aab0-398bcd79f4cd', 'CHF', 'Swiss Franc', 'CHF', 'Switzerland', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7d90735b-d695-41ac-b256-f70a048d2cf1', 'HKD', 'Hong Kong Dollar', 'HK$', 'Hong Kong', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7dc13b60-79a2-4dec-bc06-304d27374c86', 'LKR', 'Sri Lankan Rupee', 'LKR', 'Sri Lanka', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('7f8a113b-78b4-4a47-9f37-2c3742598e47', 'MXN', 'Mexican Peso', 'Mex$', 'Mexico', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('81ce42bd-b650-4e33-92bf-6300e5979aae', 'GNF', 'Guinea Franc', 'GNF', 'Guinea', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('832a8489-269c-44c9-9355-07227a5eb7e3', 'VUV', 'Vatu', 'Vt', 'Vanuatu', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('8526c26c-3795-4a4a-9d39-e7f65e7cec6b', 'MWK', 'Malawian Kwacha', 'MWK', 'Malawi', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('85d7c4ae-4960-4ac8-86b2-fab22ecb7459', 'RWF', 'Rwandan Franc', 'RWF', 'Rwanda', 0, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('85fbcd55-9602-4ba0-8130-92d36227e68b', 'PEN', 'Peruvian Sol', 'S/.', 'Peru', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('88f2e4f4-5a0d-4d60-9459-4b1d46e5d1b9', 'ARS', 'Argentine Peso', '$', 'Argentina', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('8990fbb5-520e-4f0c-a856-3684283b5e21', 'DZD', 'Algerian Dinar', 'دج', 'Algeria', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('8a083404-aef5-4c03-89b9-7b18555bf164', 'PAB', 'Balboa', '฿', 'Panama', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('8abde2e4-76a0-44b6-8e34-a106e6ccbc57', 'RUB', 'Russian Ruble', '₽', 'Russia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('90c8af6f-fe6a-4d44-94a8-9a2e55ee7660', 'LAK', 'Kip', '₭N', 'Laos', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('90f3440c-c777-4bbe-b448-e707dc590170', 'MRU', 'Ouguiya', 'UM', 'Mauritania', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('913faf78-438a-404f-a97c-6a1d1b7dda38', 'NIO', 'Nicaraguan Córdoba', 'c$', 'Nicaragua', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('93d8b806-59ce-4e0f-90b7-b06f43d8d90b', 'STN', 'Dobra', 'STD', 'Sao Tome and Principe', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('94e04660-52c2-4633-845b-2f8532562294', 'MKD', 'Macedonian Denar', 'MKD', 'North Macedonia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('95976d73-1546-4573-bb6a-3997edc75379', 'BDT', 'Taka', 'Tk', 'Bangladesh', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('961c4e4b-1874-4b55-a2c5-0d204b5633fd', 'IQD', 'Iraqi Dinar', 'ع.د', 'Iraq', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('972b2206-71ca-423c-bae4-524b51c1f82b', 'BSD', 'Bahamian Dollar', 'B$', 'Bahamas', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('9733dcef-9cba-45f5-8f7e-8c190e14420d', 'QAR', 'Qatari Rial', 'QR', 'Qatar', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('99ead707-5f29-4c95-a0c7-9cab4ced507d', 'HTG', 'Gourde', 'HTG', 'Haiti', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('9c9c88f0-5de8-44db-9100-ec9515cc3c69', 'NOK', 'Norwegian Krone', 'Kr', 'Bouvet Island', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a0f439b6-e069-4d55-816e-edaa71b7d9c0', 'MNT', 'Tugrik', 'MNT', 'Mongolia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a156a1f7-c9d8-47e8-80ac-1a545242e08b', 'KYD', 'Cayman Islands Dollar', '$', 'Cayman Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a2cd3586-cb34-4d49-bb5f-a47575c23edc', 'IRR', 'Iranian Rial', '﷼', 'Iran', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a4fb35e3-1130-4508-95e1-8571162aacc5', 'PGK', 'Papua New Guinean Kina', 'K', 'Papua New Guinea', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a961a6e5-20a5-411a-998a-cd54562eff4b', 'BYN', 'Belarussian Ruble', 'Br', 'Belarus', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a970412d-4f3f-4668-aabe-26d28a576dcc', 'BHD', 'Bahraini Dinar', '. د. ب‎', 'Bahrain', 3, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a9fce89d-4d33-4f05-8889-8c6db409e24b', 'KHR', 'Riel', '៛', 'Cambodia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('acd8a88f-6471-48c9-aae5-fd805d223cdc', 'SDG', 'Sudanese Pound', 'SDG', 'Sudan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b02d0935-1a3f-4a08-b055-c7f52ecd3846', 'FJD', 'Fiji Dollar', 'FJ$', 'Fiji', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b06fa889-ade1-4b44-b0db-079abef78060', 'SEK', 'Swedish Krona', 'kr', 'Sweden', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b0b51529-99d7-48c0-9d7e-61e14c15fa49', 'ANG', 'Netherlands Antillean Guilder', 'NAF', 'Curaçao', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b1d10fe4-6465-421b-9e9a-c668b78c098a', 'ZWL', 'Zimbabwe Dollar', 'Z$', 'Zimbabwe', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b27163af-94a6-4700-a70c-8ab1d40ee461', 'WST', 'Tala', 'ST$', 'Samoa', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b282de52-7352-49b0-88f0-4fe891205684', 'LSL', 'Loti', 'L', 'Lesotho', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b4db2ebe-7d01-42ff-9f59-31ada0074471', 'TRY', 'Turkish Lira', ' ₺', 'Turkey', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b6451827-35ab-4151-b876-3abaaf54b880', 'TZS', 'Tanzanian Shilling', 'TSh', 'Tanzania', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b6658563-bba4-4418-b17b-f857c6db9689', 'JOD', 'Jordanian Dinar', 'JD', 'Jordan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b685b66e-9a72-421f-a23c-5812d38efced', 'KGS', 'Som', 'лв', 'Kyrgyzstan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('b8145709-c5c3-4558-9e1e-a52fa296dfcd', 'BAM', 'Convertible Mark', 'KM', 'Bosnia and Herzegovina', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ba16002d-8d60-4149-958d-5099c6ac9223', 'MGA', 'Malagasy Ariary', 'Ar', 'Madagascar', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('bccfa0ae-82af-49bf-9882-d9fb6faef950', 'KZT', 'Tenge', '₸', 'Kazakhstan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('beb371fd-0fd8-4c66-a588-62fea69b1548', 'INR', 'Indian Rupee', '₹', 'India', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('c5be47b6-91a0-4a73-ad31-d1d4eaf109e6', 'BWP', 'Pula', 'P', 'Botswana', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('c6df2ee0-3fc7-4ac5-b7cf-8890b7d646f3', 'EGP', 'Egyptian Pound', 'E£', 'Egypt', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('c76c0e0b-ef66-4c40-9bf9-331c200f470d', 'AMD', 'Armenian Dram', '֏', 'Armenia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ca58436d-62cd-4baa-a320-b2569b97c8b6', 'RSD', 'Serbian Dinar', 'RSD', 'Serbia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('cb9791d4-573f-44bb-aa98-63a8865caf8f', 'THB', 'Thai Baht', '฿', 'Thailand', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('d1776e35-aeb4-4d0d-b7df-ae3c1a1fc103', 'BND', 'Brunei Dollar', 'B$', 'Brunei Darussalam', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('d239501a-2caa-451e-95f6-02d6ae8e4d05', 'CDF', 'Congolese Franc', 'FC', 'Democratic Republic of the Congo', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('d846970c-e03b-46aa-834a-11ea939824ff', 'SLL', 'Leone', 'Le', 'Sierra Leone', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('d84efaca-b7e2-4aea-b827-f350cc182f40', 'SOS', 'Somali Shilling', 'S', 'Somalia', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('db424c4f-07d3-44b6-8999-5bcd42cb6c32', 'KES', 'Kenyan Shilling', 'KSh', 'Kenya', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('db6d75b4-e2ad-4a8c-8805-c20cc72beb8b', 'GTQ', 'Quetzal', 'Q', 'Guatemala', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('db893af3-aa29-4de2-8c2f-fa5a801b1c26', 'FKP', 'Falkland Islands Pound', '£', 'Falkland Islands', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('de00e78a-117e-400a-8c12-b9f0fe8d8bbe', 'AZN', 'Manat', 'TMT', 'Azerbaijan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('dfb13580-40ed-483f-ab3c-d452e36cbb31', 'PYG', 'Paraguayan Guarani', '₲', 'Paraguay', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('e22c61a4-7565-458c-9a1a-7d0325d06770', 'CRC', 'Costa Rican Colon', '₡', 'Costa Rica', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('e2bb3b83-4045-4ec5-a95a-b2baf5635403', 'YER', 'Yemeni Rial', '﷼', 'Yemen', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('e579a81a-71dc-4ce0-b2b6-7c9d4a595394', 'ILS', 'New Israeli Shekel', '₪', 'Israel', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('e80f78d6-94f0-41d2-baa0-5d34d8a54231', 'BBD', 'Barbados Dollar', '$', 'Barbados', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ebb60dff-701b-42ad-ad2e-26ff15ac8cac', 'BZD', 'Belize Dollar', 'BZ$', 'Belize', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ed0feade-cdfb-4a9e-8e67-e7b42ba14c04', 'MUR', 'Mauritian Rupee', 'Rs', 'Mauritius', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ed513a20-71e5-4e55-8d04-675a9d1c9621', 'KMF', 'Comoro Franc', 'KMF', 'Comoros', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('eece6615-c8e3-47cf-9ff8-6608fa2e8933', 'NGN', 'Nigerian Naira', '₦', 'Nigeria', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('ef318b60-249b-4440-81ec-29d419b09499', 'GGP', 'Pound Sterling', '£', 'Guernsey', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('efaebabb-8f79-4251-a9e9-16f4156363e3', 'CAD', 'Canadian Dollar', 'c$', 'Canada', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('f0a0d02a-9b1a-4665-9a3d-d609dee9df2a', 'TJS', 'Tajik Somoni', 'SM', 'Tajikistan', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('f66cdd62-d81a-4b0a-8912-6e44c3aac32a', 'SCR', 'Seychellois Rupee', 'SR', 'Seychelles', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('f7049f30-1569-4151-a2d7-389c7defbaf8', 'GIP', 'Gibraltar Pound', '£', 'Gibraltar', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('f8bffabe-8223-4677-9b37-6f4f66f4d1e6', 'TND', 'Tunisian Dinar', 'د.', 'Tunisia', 3, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('fa81e15a-94c6-4fd3-ba2e-ad98c8c0fb14', 'VES', 'Bolivar', 'Bs', 'Venezuela', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('fb2765a6-73c9-4b96-9c57-940e6067e653', 'MVR', 'Rufiyaa', 'MRF', 'Maldives', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('fbf70c2c-9583-499b-8092-cd919c6c5767', 'ALL', 'Lek', 'lek', 'Albania', 2, true, '2025-05-26 06:07:14.025566+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6f789e04-637d-4ac5-b11b-18cab70648fb', 'USD', 'US Dollar', '$', 'United States of America', 2, true, '2026-05-04 11:03:58.740217+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('537cf582-5673-49b7-a666-ea17fdf6b734', 'EUR', 'Euro', '€', 'Germany', 2, true, '2026-05-04 12:20:10.435993+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL)
;
INSERT INTO common.currency
SELECT s.* FROM _seed_currency s
WHERE NOT EXISTS (
    SELECT 1 FROM common.currency c
    WHERE c.code = s.code AND c.name = s.name
);

-- ---------------------------------------------------------------------------
-- sc.payment_term : natural-key-safe on (name)
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE _seed_payment_term (LIKE sc.payment_term) ON COMMIT DROP;
INSERT INTO _seed_payment_term
    (id, name, description, due_days, discount_days, discount_percent,
     payment_terms, payment_term_type, is_active,
     created_at, created_by, updated_at, updated_by, deleted_at, deleted_by)
VALUES
('0aecebd8-000b-4d41-8542-59dcbd21be8e', 'Net 15', 'Make the Payment before 15 days of PO Raised.', 15, 0, 0.00, 'Make the Payment before 15 days of PO Raised.', '', true, '2025-07-14 05:26:04.988327+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('2b70ef25-f5b1-4c7a-b812-472d2ddc7797', '100% advance against Proforma Invoice.', '100% advance against Proforma Invoice.', 0, 0, 0.00, '100% advance against Proforma Invoice.', '', true, '2025-07-14 05:26:44.78974+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('420f7559-8554-45ac-ad5e-ef0f93f6101b', '100% Against delivery.', '', 0, 0, 0.00, '100% Against delivery.', '', true, '2025-07-14 05:28:55.185996+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('4c0a30d4-8714-4df8-bd95-66c6a3972003', '50% Advance against PI & Balance 50% before delive', '', 0, 0, 0.00, '50% Advance against PI & Balance 50% before delivery.', '', true, '2025-07-14 05:29:09.247678+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('6337513c-9612-442e-93f2-24bba1937710', '50% Advance against PI & balance 50% after receipt', '', 0, 0, 0.00, '50% Advance against PI & balance 50% after receipt of Material.', '', true, '2025-07-14 05:27:02.658325+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL),
('a03ef88d-c1d8-48c6-a526-7fe49cbe911b', 'Net 30', 'Full payment due in 30 days', 30, 0, 0.00, '1. Payment terms : 100% Payment In Advance
2. Delivery : 2-3 Weeks ARO
3. Inco Terms : EXW- Taipei
4. Taxes : Not applicable
5. TDS : Not applicable
6. Please send invoices and any finance-related inquiries to system@spacelinx.local', 'Payment to be made within 30 calendar days', true, '2025-05-19 10:11:47.643832+00', 'system@spacelinx.local', '2025-07-15 11:53:49.988739+00', 'system@spacelinx.local', NULL, NULL),
('a6cf67fd-2b44-4804-a02c-5fa3a94f923f', 'Net 60', 'Make 15% payment before 60 days from PO raised Date.', 60, 0, 0.00, 'Make 15% payment before 60 days from PO raised Date.', '', true, '2025-07-14 05:26:24.722406+00', 'system@spacelinx.local', NULL, NULL, NULL, NULL)
;
INSERT INTO sc.payment_term
SELECT s.* FROM _seed_payment_term s
WHERE NOT EXISTS (
    SELECT 1 FROM sc.payment_term p
    WHERE p.name = s.name
);

-- ---------------------------------------------------------------------------
-- common.department : natural-key-safe on (code)
-- NOTE: explicit column list maps the pg_dump value order
--   (id, code, name, description, is_active, created_by, created_at, <6x NULL>)
-- onto the EF schema, whose physical column order differs.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE _seed_department (LIKE common.department) ON COMMIT DROP;
INSERT INTO _seed_department
    (id, code, name, description, is_active, created_by, created_at,
     updated_at, updated_by, deleted_at, deleted_by,
     parent_department_id, head_of_department_user_id)
VALUES
('46601072-ba50-4fe9-8eef-85fb7b7a551a', 'GA', 'G&A', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('0784b9d3-f523-4237-b9b1-3347e64a4e52', 'SC', 'Supply Chain', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('3ee6bacb-98fa-42bb-b0d4-ce0a70653037', 'AV', 'Avionics', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('6b24e3e2-2f70-445e-a1c0-c958e44a57e9', 'CS', 'Communication Systems', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('c453ce6c-add8-4346-bc80-0759f181af5e', 'EPS', 'EPS', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('f5bb8c0d-a799-470b-8ab9-918873e83d7a', 'MECH', 'Mechanical', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('5c12b473-3935-4328-aa0b-2f1decb18444', 'ADCS', 'ADCS', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('575cd28e-4583-4fb1-bc73-15c07b40f3e4', 'OPT', 'Optics', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('b55d2545-2b4d-4336-bfdc-d6b205850474', 'MFG', 'Manufacturing', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('e6fd82c3-d3b1-475d-a553-edc8c4de4f69', 'PMO', 'PMO', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL),
('fc366837-f9b1-452f-b0dc-912809b36546', 'SPX', 'Spacelinx', NULL, true, 'system@spacelinx.local', '2026-05-28 07:32:39.889343', NULL, NULL, NULL, NULL, NULL, NULL)
;
INSERT INTO common.department
SELECT s.* FROM _seed_department s
WHERE NOT EXISTS (
    SELECT 1 FROM common.department d
    WHERE d.code = s.code
);

COMMIT;
