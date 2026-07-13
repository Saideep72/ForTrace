Inserting users:

-- ============================================================
-- FortTrace Seed Data
-- File: 01_users.sql
-- Table: users
-- Total Records: 18
-- ============================================================
insert into
  users (
    user_id,
    email,
    full_name,
    role,
    plant_access,
    area_access,
    is_active,
    last_login
  )
values
  -- ============================================================
  -- ADMINISTRATION
  -- ============================================================
  (
    'ADM001',
    'admin@forttrace.com',
    'System Administrator',
    'Admin',
    array['REF', 'PET', 'STEEL'],
    array['ALL'],
    true,
    '2026-07-01 08:15:00+05:30'
  ),
  (
    'PM001',
    'vikram.sharma@forttrace.com',
    'Vikram Sharma',
    'Plant_Manager',
    array['REF'],
    array['HTX', 'UTIL', 'STG'],
    true,
    '2026-06-30 18:10:00+05:30'
  ),
  (
    'PM002',
    'meera.nair@forttrace.com',
    'Meera Nair',
    'Plant_Manager',
    array['PET'],
    array['DIST', 'POLY'],
    true,
    '2026-06-29 09:20:00+05:30'
  ),
  (
    'PM003',
    'arvind.reddy@forttrace.com',
    'Arvind Reddy',
    'Plant_Manager',
    array['STEEL'],
    array['RM', 'BF'],
    true,
    '2026-06-28 14:40:00+05:30'
  ),
  -- ============================================================
  -- MAINTENANCE ENGINEERS
  -- ============================================================
  (
    'ME001',
    'rajesh.kumar@forttrace.com',
    'Rajesh Kumar',
    'Maintenance_Engineer',
    array['REF'],
    array['HTX'],
    true,
    '2026-06-30 20:15:00+05:30'
  ),
  (
    'ME002',
    'priya.iyer@forttrace.com',
    'Priya Iyer',
    'Maintenance_Engineer',
    array['REF'],
    array['UTIL'],
    true,
    '2026-06-29 16:12:00+05:30'
  ),
  (
    'ME003',
    'rahul.singh@forttrace.com',
    'Rahul Singh',
    'Maintenance_Engineer',
    array['PET'],
    array['DIST'],
    true,
    '2026-06-30 13:48:00+05:30'
  ),
  (
    'ME004',
    'sneha.joshi@forttrace.com',
    'Sneha Joshi',
    'Maintenance_Engineer',
    array['PET'],
    array['POLY'],
    true,
    '2026-06-28 17:02:00+05:30'
  ),
  (
    'ME005',
    'manoj.patil@forttrace.com',
    'Manoj Patil',
    'Maintenance_Engineer',
    array['STEEL'],
    array['RM'],
    true,
    '2026-06-30 06:35:00+05:30'
  ),
  (
    'ME006',
    'karthik.raman@forttrace.com',
    'Karthik Raman',
    'Maintenance_Engineer',
    array['STEEL'],
    array['BF'],
    true,
    '2026-06-27 21:10:00+05:30'
  ),
  -- ============================================================
  -- SAFETY
  -- ============================================================
  (
    'SO001',
    'anita.deshmukh@forttrace.com',
    'Anita Deshmukh',
    'Safety_Officer',
    array['REF', 'PET'],
    array['HTX', 'DIST'],
    true,
    '2026-06-30 08:10:00+05:30'
  ),
  (
    'SO002',
    'mohammed.khan@forttrace.com',
    'Mohammed Khan',
    'Safety_Officer',
    array['STEEL'],
    array['RM', 'BF'],
    true,
    '2026-06-29 11:00:00+05:30'
  ),
  -- ============================================================
  -- QUALITY
  -- ============================================================
  (
    'QE001',
    'neha.verma@forttrace.com',
    'Neha Verma',
    'Quality_Engineer',
    array['REF'],
    array['HTX'],
    true,
    '2026-06-30 15:44:00+05:30'
  ),
  (
    'QE002',
    'sachin.gupta@forttrace.com',
    'Sachin Gupta',
    'Quality_Engineer',
    array['PET', 'STEEL'],
    array['DIST', 'RM'],
    true,
    '2026-06-29 10:18:00+05:30'
  ),
  -- ============================================================
  -- FIELD TECHNICIANS
  -- ============================================================
  (
    'FT001',
    'ramesh.pawar@forttrace.com',
    'Ramesh Pawar',
    'Field_Technician',
    array['REF'],
    array['HTX'],
    true,
    '2026-06-30 07:05:00+05:30'
  ),
  (
    'FT002',
    'deepak.yadav@forttrace.com',
    'Deepak Yadav',
    'Field_Technician',
    array['PET'],
    array['DIST'],
    true,
    '2026-06-30 07:22:00+05:30'
  ),
  (
    'FT003',
    'vikas.more@forttrace.com',
    'Vikas More',
    'Field_Technician',
    array['STEEL'],
    array['RM'],
    true,
    '2026-06-30 06:58:00+05:30'
  ),
  -- ============================================================
  -- AUDITOR
  -- ============================================================
  (
    'AUD001',
    'auditor@bureauveritas.com',
    'Sunil Chatterjee',
    'Auditor',
    array['REF', 'PET', 'STEEL'],
    array['ALL'],
    true,
    '2026-06-25 12:00:00+05:30'
  );


Inserting Assets

-- ============================================================
-- FortTrace Seed Data
-- File: 02_assets.sql
-- Part 1 : REF Plant
-- ============================================================

INSERT INTO assets (
    uat,
    plant_code,
    area_code,
    system_code,
    equipment_tag,
    equipment_type,
    manufacturer,
    model_number,
    install_date,
    criticality_rating,
    status,
    location_description,
    gps_lat,
    gps_long
)
VALUES

(
'REF-HTX-R101-001',
'REF',
'HTX',
'R101',
'R-101',
'reactor',
'Larsen & Toubro',
'LTR-5000',
'2019-03-15',
5,
'active',
'Heat Exchanger Area, Row 3, Bay 2',
19.07600000,
72.87770000
),

(
'REF-HTX-E201-001',
'REF',
'HTX',
'E201',
'E-201',
'heat_exchanger',
'Alfa Laval',
'AL-HX-2200',
'2019-03-18',
5,
'active',
'Cooling Loop A, North Pipe Rack',
19.07625000,
72.87752000
),

(
'REF-HTX-P201-001',
'REF',
'HTX',
'P201',
'P-201',
'centrifugal_pump',
'Flowserve',
'FS-CWP-400',
'2019-03-19',
5,
'active',
'Cooling Water Pump House',
19.07612000,
72.87730000
),

(
'REF-HTX-V301-001',
'REF',
'HTX',
'V301',
'V-301',
'pressure_vessel',
'ISGEC',
'PV-3000',
'2019-04-02',
4,
'active',
'Reactor Feed Surge Vessel',
19.07595000,
72.87794000
),

(
'REF-HTX-T401-001',
'REF',
'HTX',
'T401',
'T-401',
'storage_tank',
'Kirloskar',
'TK-100KL',
'2019-04-15',
4,
'active',
'Feed Chemical Storage Tank',
19.07651000,
72.87805000
),

(
'REF-UTIL-C101-001',
'REF',
'UTIL',
'C101',
'C-101',
'air_compressor',
'Atlas Copco',
'GA75',
'2020-01-12',
4,
'active',
'Utility Building Compressor Room',
19.07682000,
72.87712000
),

(
'REF-UTIL-B101-001',
'REF',
'UTIL',
'B101',
'B-101',
'boiler',
'Thermax',
'TB-12TPH',
'2018-08-20',
5,
'maintenance',
'Steam Generation Block',
19.07698000,
72.87781000
),

(
'REF-UTIL-CW101-001',
'REF',
'UTIL',
'CW101',
'CT-101',
'cooling_tower',
'SPX Cooling',
'Marley NC8400',
'2018-09-05',
4,
'active',
'Cooling Tower Yard',
19.07722000,
72.87795000
);

-- ============================================================
-- FortTrace Seed Data
-- File: 02_assets.sql
-- Part 2 : PET Plant & STEEL Plant
-- ============================================================

INSERT INTO assets (
    uat,
    plant_code,
    area_code,
    system_code,
    equipment_tag,
    equipment_type,
    manufacturer,
    model_number,
    install_date,
    criticality_rating,
    status,
    location_description,
    gps_lat,
    gps_long
)
VALUES

-- ============================================================
-- PET PLANT
-- ============================================================

(
'PET-DIST-C301-001',
'PET',
'DIST',
'C301',
'C-301',
'distillation_column',
'Larsen & Toubro',
'DC-45M',
'2020-02-12',
5,
'active',
'Distillation Unit A',
19.115210,
72.905620
),

(
'PET-DIST-P302-001',
'PET',
'DIST',
'P302',
'P-302',
'centrifugal_pump',
'Flowserve',
'FP-350',
'2020-02-15',
4,
'active',
'Column Bottoms Transfer Pump',
19.115330,
72.905840
),

(
'PET-DIST-E303-001',
'PET',
'DIST',
'E303',
'E-303',
'heat_exchanger',
'Alfa Laval',
'Compabloc CB30',
'2020-02-20',
5,
'active',
'Feed Preheater',
19.115480,
72.905960
),

(
'PET-DIST-V304-001',
'PET',
'DIST',
'V304',
'V-304',
'separator_vessel',
'ISGEC',
'SEP-1500',
'2020-03-01',
4,
'active',
'Gas Liquid Separator',
19.115690,
72.906110
),

(
'PET-POLY-T305-001',
'PET',
'POLY',
'T305',
'T-305',
'polymerization_reactor',
'Thyssenkrupp',
'PR-8000',
'2021-01-18',
5,
'active',
'Polymer Reactor Section',
19.115910,
72.906420
),

(
'PET-POLY-HX306-001',
'PET',
'POLY',
'HX306',
'HX-306',
'heat_exchanger',
'Kelvion',
'KX-1800',
'2021-02-05',
4,
'active',
'Polymer Cooling Circuit',
19.116080,
72.906630
),

(
'PET-POLY-TK307-001',
'PET',
'POLY',
'TK307',
'TK-307',
'storage_tank',
'Kirloskar',
'TK-75KL',
'2021-03-12',
3,
'active',
'Finished Product Storage',
19.116290,
72.906820
),

-- ============================================================
-- STEEL PLANT
-- ============================================================

(
'STL-RM-RM101-001',
'STL',
'RM',
'RM101',
'RM-101',
'rolling_mill',
'Danieli',
'RM-450',
'2018-05-14',
5,
'active',
'Hot Rolling Mill Line 1',
19.164320,
72.948150
),

(
'STL-BF-BF201-001',
'STL',
'BF',
'BF201',
'BF-201',
'blast_furnace',
'Paul Wurth',
'BF-2000',
'2017-11-02',
5,
'active',
'Blast Furnace Area',
19.164540,
72.948480
),

(
'STL-CCM-CCM301-001',
'STL',
'CCM',
'CCM301',
'CCM-301',
'continuous_caster',
'SMS Group',
'CCM-6S',
'2019-04-21',
5,
'active',
'Continuous Casting Machine',
19.164810,
72.948730
),

(
'STL-HYD-P401-001',
'STL',
'HYD',
'P401',
'P-401',
'hydraulic_pump',
'Bosch Rexroth',
'A10VSO140',
'2020-08-16',
4,
'active',
'Hydraulic Power Unit',
19.165050,
72.948960
),

(
'STL-UTIL-CT501-001',
'STL',
'UTIL',
'CT501',
'CT-501',
'cooling_tower',
'SPX Cooling',
'Marley NC8400',
'2019-09-30',
4,
'active',
'Steel Plant Cooling Tower',
19.165280,
72.949180
);

Inserting Asset_Dependencies

-- ============================================================
-- FortTrace Seed Data
-- File: 03_asset_dependencies.sql
-- ============================================================

INSERT INTO asset_dependencies
(
    source_uat,
    target_uat,
    relationship_type,
    dependency_type,
    criticality,
    flow_type,
    capacity_m3hr
)
VALUES

-- ============================================================
-- REFINERY (HTX AREA)
-- ============================================================

(
'REF-HTX-R101-001',
'REF-HTX-E201-001',
'DEPENDS_ON',
'heat_removal',
'critical',
NULL,
NULL
),

(
'REF-HTX-E201-001',
'REF-HTX-P201-001',
'DEPENDS_ON',
'cooling_water_supply',
'critical',
NULL,
NULL
),

(
'REF-HTX-P201-001',
'REF-UTIL-CW101-001',
'DEPENDS_ON',
'cooling_network',
'high',
NULL,
NULL
),

(
'REF-UTIL-CW101-001',
'REF-HTX-E201-001',
'FEEDS_INTO',
NULL,
NULL,
'cooling_water',
1800.00
),

(
'REF-HTX-V301-001',
'REF-HTX-R101-001',
'FEEDS_INTO',
NULL,
NULL,
'feedstock',
95.00
),

(
'REF-HTX-T401-001',
'REF-HTX-V301-001',
'FEEDS_INTO',
NULL,
NULL,
'naphtha_feed',
140.00
),

(
'REF-UTIL-B101-001',
'REF-HTX-R101-001',
'FEEDS_INTO',
NULL,
NULL,
'steam',
25.00
),

(
'REF-UTIL-C101-001',
'REF-HTX-R101-001',
'FEEDS_INTO',
NULL,
NULL,
'instrument_air',
320.00
),

-- ============================================================
-- PET PLANT
-- ============================================================

(
'PET-DIST-C301-001',
'PET-DIST-E303-001',
'DEPENDS_ON',
'feed_preheating',
'critical',
NULL,
NULL
),

(
'PET-DIST-E303-001',
'PET-DIST-P302-001',
'DEPENDS_ON',
'circulation',
'high',
NULL,
NULL
),

(
'PET-DIST-P302-001',
'PET-POLY-T305-001',
'FEEDS_INTO',
NULL,
NULL,
'polymer_feed',
110.00
),

(
'PET-POLY-T305-001',
'PET-POLY-HX306-001',
'DEPENDS_ON',
'product_cooling',
'high',
NULL,
NULL
),

(
'PET-POLY-HX306-001',
'PET-POLY-TK307-001',
'FEEDS_INTO',
NULL,
NULL,
'finished_polymer',
85.00
),

(
'PET-DIST-C301-001',
'PET-DIST-V304-001',
'FEEDS_INTO',
NULL,
NULL,
'overhead_vapor',
45.00
),

(
'PET-DIST-V304-001',
'PET-POLY-T305-001',
'FEEDS_INTO',
NULL,
NULL,
'process_feed',
40.00
),

-- ============================================================
-- STEEL PLANT
-- ============================================================

(
'STL-BF-BF201-001',
'STL-CCM-CCM301-001',
'FEEDS_INTO',
NULL,
NULL,
'molten_steel',
160.00
),

(
'STL-CCM-CCM301-001',
'STL-RM-RM101-001',
'FEEDS_INTO',
NULL,
NULL,
'steel_slabs',
150.00
),

(
'STL-RM-RM101-001',
'STL-HYD-P401-001',
'DEPENDS_ON',
'hydraulic_power',
'critical',
NULL,
NULL
),

(
'STL-HYD-P401-001',
'STL-UTIL-CT501-001',
'DEPENDS_ON',
'hydraulic_cooling',
'medium',
NULL,
NULL
),

(
'STL-UTIL-CT501-001',
'STL-HYD-P401-001',
'FEEDS_INTO',
NULL,
NULL,
'cooling_water',
220.00
),

-- ============================================================
-- CROSS-AREA UTILITY LINKS
-- ============================================================

(
'REF-UTIL-B101-001',
'REF-UTIL-C101-001',
'DEPENDS_ON',
'utilities',
'medium',
NULL,
NULL
),

(
'PET-POLY-HX306-001',
'PET-DIST-E303-001',
'DEPENDS_ON',
'heat_recovery',
'medium',
NULL,
NULL
),

(
'STL-BF-BF201-001',
'STL-UTIL-CT501-001',
'DEPENDS_ON',
'cooling_water',
'high',
NULL,
NULL
),

(
'REF-HTX-P201-001',
'REF-UTIL-C101-001',
'DEPENDS_ON',
'instrument_air',
'medium',
NULL,
NULL
),

(
'PET-DIST-P302-001',
'PET-DIST-V304-001',
'DEPENDS_ON',
'separator_discharge',
'medium',
NULL,
NULL
),

(
'STL-RM-RM101-001',
'STL-BF-BF201-001',
'DEPENDS_ON',
'upstream_production',
'critical',
NULL,
NULL
);

Inserting Asset Expertise

-- ============================================================
-- FortTrace Seed Data
-- File: 04_asset_expertise.sql
-- ============================================================

INSERT INTO asset_expertise
(
    user_id,
    uat,
    level,
    years
)
VALUES

-- ============================================================
-- REFINERY (REF)
-- ============================================================

('ME001','REF-HTX-R101-001','expert',12),
('ME001','REF-HTX-E201-001','expert',10),
('ME001','REF-HTX-V301-001','advanced',9),

('ME002','REF-HTX-P201-001','expert',11),
('ME002','REF-UTIL-C101-001','advanced',8),
('ME002','REF-UTIL-B101-001','expert',13),
('ME002','REF-UTIL-CW101-001','advanced',9),

('QE001','REF-HTX-R101-001','advanced',8),
('QE001','REF-HTX-E201-001','intermediate',6),

('SO001','REF-HTX-R101-001','advanced',9),
('SO001','REF-UTIL-B101-001','advanced',10),

('FT001','REF-HTX-P201-001','advanced',7),
('FT001','REF-HTX-E201-001','intermediate',5),

-- ============================================================
-- PETROCHEMICAL PLANT (PET)
-- ============================================================

('ME003','PET-DIST-C301-001','expert',11),
('ME003','PET-DIST-E303-001','expert',10),
('ME003','PET-DIST-P302-001','advanced',8),

('ME004','PET-POLY-T305-001','expert',9),
('ME004','PET-POLY-HX306-001','advanced',8),
('ME004','PET-POLY-TK307-001','advanced',7),

('QE002','PET-DIST-C301-001','advanced',7),
('QE002','PET-POLY-T305-001','intermediate',5),

('SO001','PET-DIST-C301-001','advanced',8),
('SO001','PET-POLY-T305-001','advanced',7),

('FT002','PET-DIST-P302-001','advanced',6),
('FT002','PET-DIST-E303-001','intermediate',5),

-- ============================================================
-- STEEL PLANT
-- ============================================================

('ME005','STL-RM-RM101-001','expert',14),
('ME005','STL-CCM-CCM301-001','advanced',11),

('ME006','STL-BF-BF201-001','expert',15),
('ME006','STL-HYD-P401-001','advanced',9),
('ME006','STL-UTIL-CT501-001','advanced',8),

('QE002','STL-RM-RM101-001','advanced',6),
('QE002','STL-BF-BF201-001','intermediate',5),

('SO002','STL-BF-BF201-001','expert',11),
('SO002','STL-RM-RM101-001','advanced',9),

('FT003','STL-HYD-P401-001','advanced',7),
('FT003','STL-CCM-CCM301-001','intermediate',5),

-- ============================================================
-- PLANT MANAGERS
-- ============================================================

('PM001','REF-HTX-R101-001','expert',18),
('PM001','REF-UTIL-B101-001','advanced',20),

('PM002','PET-DIST-C301-001','expert',17),
('PM002','PET-POLY-T305-001','advanced',16),

('PM003','STL-BF-BF201-001','expert',19),
('PM003','STL-RM-RM101-001','advanced',18),

-- ============================================================
-- SYSTEM ADMINISTRATOR
-- ============================================================

('ADM001','REF-HTX-R101-001','intermediate',6),
('ADM001','PET-DIST-C301-001','intermediate',6),
('ADM001','STL-BF-BF201-001','intermediate',6);

Inserting Work Orders

-- ============================================================
-- FortTrace Seed Data
-- File: 06_work_orders_part1.sql
-- REF Plant Work Orders (15)
-- ============================================================

INSERT INTO work_orders
(
    wo_id,
    uat,
    wo_type,
    priority,
    description,
    root_cause_id,
    start_date,
    end_date,
    actual_hours,
    estimated_hours,
    technician_id,
    technician_name,
    supervisor_id,
    findings,
    corrective_action,
    parts_replaced,
    tools_used,
    safety_permits,
    status,
    quality_check_passed,
    verified_by,
    verified_at
)
VALUES

(
'WO-2024-0001',
'REF-HTX-R101-001',
'preventive',
'medium',
'Annual reactor internal inspection',
NULL,
'2024-02-12 08:00:00+05:30',
'2024-02-13 17:00:00+05:30',
16.00,
16.00,
'FT001',
'Ajay Patel',
'ME001',
'Minor coke deposits observed near inlet distributor.',
'Internal cleaning completed. Temperature sensors recalibrated.',
'[{"part_no":"TC-101","description":"Temperature Sensor","qty":2,"cost":18500}]',
'["Borescope","Torque Wrench","Calibration Kit"]',
'["confined_space","loto"]',
'verified',
TRUE,
'QE001',
'2024-02-14 09:30:00+05:30'
),

(
'WO-2024-0002',
'REF-HTX-E201-001',
'preventive',
'medium',
'Heat exchanger tube bundle inspection',
NULL,
'2024-03-18 08:30:00+05:30',
'2024-03-19 18:00:00+05:30',
18.50,
18.00,
'FT001',
'Ajay Patel',
'ME001',
'Minor fouling detected on shell side.',
'Chemical cleaning recommended during next shutdown.',
'[]',
'["Borescope","UT Gauge"]',
'["loto"]',
'completed',
TRUE,
'QE001',
'2024-03-20 10:00:00+05:30'
),

(
'WO-2024-0003',
'REF-HTX-P201-001',
'corrective',
'high',
'Mechanical seal replacement',
NULL,
'2024-05-11 09:00:00+05:30',
'2024-05-11 17:30:00+05:30',
8.50,
8.00,
'FT001',
'Ajay Patel',
'ME002',
'Seal leakage around pump shaft.',
'Replaced mechanical seal and aligned coupling.',
'[{"part_no":"MS-P201","description":"Mechanical Seal","qty":1,"cost":42000}]',
'["Laser Alignment Kit","Bearing Puller"]',
'["loto"]',
'verified',
TRUE,
'QE001',
'2024-05-12 08:00:00+05:30'
),

(
'WO-2024-0004',
'REF-HTX-V301-001',
'inspection',
'low',
'Pressure vessel external inspection',
NULL,
'2024-06-15 09:00:00+05:30',
'2024-06-15 14:00:00+05:30',
5.00,
5.00,
'FT001',
'Ajay Patel',
'ME001',
'Paint deterioration on lower shell.',
'Surface preparation scheduled.',
'[]',
'["Ultrasonic Thickness Gauge"]',
'[]',
'completed',
TRUE,
'QE001',
'2024-06-16 09:00:00+05:30'
),

(
'WO-2024-0005',
'REF-HTX-T401-001',
'preventive',
'medium',
'Tank level transmitter calibration',
NULL,
'2024-08-08 08:00:00+05:30',
'2024-08-08 13:00:00+05:30',
5.00,
4.50,
'FT001',
'Ajay Patel',
'ME001',
'Calibration drift within acceptable limits.',
'Recalibrated transmitter.',
'[]',
'["HART Communicator"]',
'["loto"]',
'completed',
TRUE,
'QE001',
'2024-08-09 08:30:00+05:30'
),

(
'WO-2025-0006',
'REF-UTIL-B101-001',
'preventive',
'high',
'Annual boiler inspection',
NULL,
'2025-01-16 07:30:00+05:30',
'2025-01-18 18:00:00+05:30',
27.00,
28.00,
'FT001',
'Ajay Patel',
'ME002',
'Scale deposits found in water tubes.',
'Tube cleaning completed.',
'[]',
'["Tube Cleaner","Inspection Camera"]',
'["hot_work","loto"]',
'verified',
TRUE,
'QE001',
'2025-01-19 11:00:00+05:30'
),

(
'WO-2025-0007',
'REF-UTIL-C101-001',
'corrective',
'medium',
'Instrument air compressor vibration',
NULL,
'2025-02-22 09:00:00+05:30',
'2025-02-22 17:00:00+05:30',
8.00,
7.00,
'FT001',
'Ajay Patel',
'ME002',
'Loose motor mounting bolts.',
'Retightened mounting and balanced coupling.',
'[]',
'["Vibration Analyzer"]',
'["loto"]',
'verified',
TRUE,
'QE001',
'2025-02-23 09:00:00+05:30'
),

(
'WO-2025-0008',
'REF-UTIL-CW101-001',
'preventive',
'medium',
'Cooling tower fan gearbox lubrication',
NULL,
'2025-04-05 08:00:00+05:30',
'2025-04-05 15:00:00+05:30',
7.00,
6.50,
'FT001',
'Ajay Patel',
'ME002',
'Gearbox oil degraded.',
'Oil replaced.',
'[{"part_no":"LUBE-220","description":"Gear Oil ISO VG220","qty":12,"cost":9600}]',
'["Grease Gun"]',
'["working_at_height"]',
'completed',
TRUE,
'QE001',
'2025-04-06 08:00:00+05:30'
),

(
'WO-2025-0009',
'REF-HTX-E201-001',
'corrective',
'high',
'Chemical descaling of exchanger',
NULL,
'2025-05-20 08:00:00+05:30',
'2025-05-21 18:00:00+05:30',
20.00,
18.00,
'FT001',
'Ajay Patel',
'ME001',
'Heavy fouling reduced heat transfer.',
'Performed chemical descaling.',
'[{"part_no":"CHEM-101","description":"Descaling Chemical","qty":8,"cost":38000}]',
'["Circulation Pump"]',
'["chemical_handling","loto"]',
'verified',
TRUE,
'QE001',
'2025-05-22 09:30:00+05:30'
),

(
'WO-2025-0010',
'REF-HTX-P201-001',
'preventive',
'medium',
'Quarterly bearing lubrication',
NULL,
'2025-07-11 08:00:00+05:30',
'2025-07-11 12:00:00+05:30',
4.00,
4.00,
'FT001',
'Ajay Patel',
'ME002',
'Bearing temperatures normal.',
'Fresh grease applied.',
'[]',
'["Grease Pump"]',
'[]',
'completed',
TRUE,
'QE001',
'2025-07-12 09:00:00+05:30'
),

(
'WO-2026-0011',
'REF-HTX-P201-001',
'emergency',
'critical',
'Bearing failure repair after high vibration alarm',
NULL,
'2026-03-18 01:20:00+05:30',
'2026-03-18 12:00:00+05:30',
10.50,
8.00,
'FT001',
'Ajay Patel',
'ME002',
'Drive-end bearing seized due to lubrication failure.',
'Replaced bearings and shaft sleeve.',
'[{"part_no":"BR-6312","description":"SKF Bearing 6312","qty":2,"cost":28500}]',
'["Bearing Puller","Laser Alignment Kit"]',
'["loto"]',
'verified',
TRUE,
'QE001',
'2026-03-19 08:00:00+05:30'
),

(
'WO-2026-0012',
'REF-HTX-E201-001',
'corrective',
'high',
'Heat exchanger cleaning after reduced duty',
NULL,
'2026-05-08 08:00:00+05:30',
'2026-05-09 19:00:00+05:30',
22.00,
20.00,
'FT001',
'Ajay Patel',
'ME001',
'Tube-side fouling reduced cooling efficiency.',
'Tube bundle hydro-jetted and inspected.',
'[]',
'["Hydro Jet","Tube Brush"]',
'["confined_space","loto"]',
'verified',
TRUE,
'QE001',
'2026-05-10 09:00:00+05:30'
),

(
'WO-2026-0013',
'REF-HTX-R101-001',
'emergency',
'critical',
'Investigate reactor high temperature trip',
NULL,
'2026-06-30 02:25:00+05:30',
'2026-06-30 16:30:00+05:30',
14.00,
12.00,
'FT001',
'Ajay Patel',
'ME001',
'Cooling water flow below design value due to exchanger fouling.',
'Reactor safely restarted after exchanger cleaning.',
'[]',
'["Thermal Camera","Flow Meter"]',
'["hot_work","confined_space","loto"]',
'completed',
TRUE,
'QE001',
'2026-07-01 08:00:00+05:30'
),

(
'WO-2026-0014',
'REF-UTIL-B101-001',
'modification',
'medium',
'Install digital steam flow transmitter',
NULL,
'2026-07-05 09:00:00+05:30',
NULL,
NULL,
16.00,
'FT001',
'Ajay Patel',
'ME002',
NULL,
NULL,
'[]',
'["HART Communicator"]',
'["hot_work"]',
'in_progress',
NULL,
NULL,
NULL
),

(
'WO-2026-0015',
'REF-HTX-T401-001',
'preventive',
'low',
'Routine tank level switch functional test',
NULL,
'2026-07-08 09:00:00+05:30',
NULL,
NULL,
4.00,
'FT001',
'Ajay Patel',
'ME001',
NULL,
NULL,
'[]',
'["Loop Calibrator"]',
'[]',
'open',
NULL,
NULL,
NULL
);

-- ============================================================
-- FortTrace Seed Data
-- File: 06_work_orders_part2A.sql
-- PET Plant Work Orders (1-5)
-- ============================================================

INSERT INTO work_orders
(
    wo_id,
    uat,
    wo_type,
    priority,
    description,
    root_cause_id,
    start_date,
    end_date,
    actual_hours,
    estimated_hours,
    technician_id,
    technician_name,
    supervisor_id,
    findings,
    corrective_action,
    parts_replaced,
    tools_used,
    safety_permits,
    status,
    quality_check_passed,
    verified_by,
    verified_at
)
VALUES

-- ============================================================
-- WO-2024-0016
-- DISTILLATION COLUMN C-301
-- ============================================================

(
'WO-2024-0016',
'PET-DIST-C301-001',
'preventive',
'medium',
'Annual distillation column tray inspection and internal cleaning.',
NULL,
'2024-02-21 08:00:00+05:30',
'2024-02-22 18:00:00+05:30',
19.50,
20.00,
'FT002',
'Vikram Singh',
'ME003',
'Minor fouling observed on trays 18-22 with slight scaling near feed inlet.',
'Cleaned trays, replaced damaged tray clamps and restored normal vapor distribution.',
'[{"part_no":"TC-301","description":"Tray Clamp Kit","qty":6,"cost":15600}]',
'["Gas Detector","Confined Space Kit","Torque Wrench"]',
'["confined_space","gas_testing","loto"]',
'verified',
TRUE,
'QE002',
'2024-02-23 09:30:00+05:30'
),

-- ============================================================
-- WO-2024-0017
-- FEED PUMP P-302
-- ============================================================

(
'WO-2024-0017',
'PET-DIST-P302-001',
'corrective',
'high',
'Mechanical seal leakage observed during routine patrol.',
NULL,
'2024-04-09 09:00:00+05:30',
'2024-04-09 17:30:00+05:30',
8.50,
8.00,
'FT002',
'Vikram Singh',
'ME003',
'Seal flushing pressure below recommended operating value resulting in leakage.',
'Replaced mechanical seal cartridge and cleaned seal flush line.',
'[{"part_no":"MS-P302","description":"Mechanical Seal Cartridge","qty":1,"cost":48750}]',
'["Seal Puller","Laser Alignment Kit"]',
'["loto"]',
'verified',
TRUE,
'QE002',
'2024-04-10 10:15:00+05:30'
),

-- ============================================================
-- WO-2025-0018
-- REBOILER E-303
-- ============================================================

(
'WO-2025-0018',
'PET-DIST-E303-001',
'preventive',
'medium',
'Reboiler tube bundle inspection before scheduled turnaround.',
NULL,
'2025-01-27 08:00:00+05:30',
'2025-01-28 18:00:00+05:30',
21.00,
20.00,
'FT002',
'Vikram Singh',
'ME003',
'Moderate hydrocarbon fouling reducing heat transfer efficiency by approximately 12%.',
'Performed hydro-jet cleaning and replaced damaged tube gaskets.',
'[{"part_no":"TG-E303","description":"Tube Bundle Gasket Set","qty":1,"cost":22300}]',
'["Hydro Jet","Tube Brush","Borescope"]',
'["confined_space","loto"]',
'verified',
TRUE,
'QE002',
'2025-01-29 09:45:00+05:30'
),

-- ============================================================
-- WO-2025-0019
-- POLYMERIZATION REACTOR T-305
-- ============================================================

(
'WO-2025-0019',
'PET-POLY-T305-001',
'modification',
'medium',
'Upgrade reactor temperature transmitters to smart HART devices.',
NULL,
'2025-08-11 08:30:00+05:30',
'2025-08-12 16:30:00+05:30',
15.50,
16.00,
'FT002',
'Vikram Singh',
'ME004',
'Legacy analog transmitters approaching end-of-life with intermittent drift.',
'Installed smart temperature transmitters and updated PLC configuration.',
'[{"part_no":"TT-HART","description":"Smart Temperature Transmitter","qty":2,"cost":96500}]',
'["HART Communicator","Loop Calibrator","Laptop"]',
'["electrical_isolation","loto"]',
'verified',
TRUE,
'QE002',
'2025-08-13 09:00:00+05:30'
),

-- ============================================================
-- WO-2026-0020
-- DISTILLATION COLUMN C-301
-- ============================================================

(
'WO-2026-0020',
'PET-DIST-C301-001',
'emergency',
'critical',
'Emergency shutdown due to hydrocarbon seal leakage near bottom section.',
NULL,
'2026-05-16 01:40:00+05:30',
'2026-05-16 15:20:00+05:30',
13.70,
12.00,
'FT002',
'Vikram Singh',
'ME003',
'Primary mechanical seal failure caused hydrocarbon leakage. Elevated vibration observed before shutdown.',
'Replaced seal assembly, inspected shaft sleeve, verified vibration and leak-free startup.',
'[{"part_no":"SEAL-C301","description":"Primary Mechanical Seal","qty":1,"cost":78500},{"part_no":"SLV-C301","description":"Shaft Sleeve","qty":1,"cost":26400}]',
'["Laser Alignment Kit","Dial Indicator","Vibration Analyzer"]',
'["hot_work","gas_testing","loto"]',
'completed',
TRUE,
'QE002',
'2026-05-17 08:30:00+05:30'
);

-- ============================================================
-- FortTrace Seed Data
-- File: 06_work_orders_part2B.sql
-- PET Plant Work Orders (6-9)
-- ============================================================

INSERT INTO work_orders
(
    wo_id,
    uat,
    wo_type,
    priority,
    description,
    root_cause_id,
    start_date,
    end_date,
    actual_hours,
    estimated_hours,
    technician_id,
    technician_name,
    supervisor_id,
    findings,
    corrective_action,
    parts_replaced,
    tools_used,
    safety_permits,
    status,
    quality_check_passed,
    verified_by,
    verified_at
)
VALUES

-- ============================================================
-- WO-2025-0021
-- POLYMER HEAT EXCHANGER HX-306
-- ============================================================

(
'WO-2025-0021',
'PET-POLY-HX306-001',
'preventive',
'medium',
'Annual polymer heat exchanger inspection and cleaning.',
NULL,
'2025-03-12 08:00:00+05:30',
'2025-03-13 17:00:00+05:30',
17.50,
18.00,
'FT002',
'Vikram Singh',
'ME004',
'Polymer deposits observed on tube side causing approximately 8% reduction in heat transfer efficiency.',
'Tube bundle chemically cleaned and gasket replaced before recommissioning.',
'[{"part_no":"HX306-GSK","description":"Tube Bundle Gasket Set","qty":1,"cost":18400}]',
'["Hydro Jet","Tube Brush","Infrared Thermometer"]',
'["confined_space","loto"]',
'verified',
TRUE,
'QE002',
'2025-03-14 09:20:00+05:30'
),

-- ============================================================
-- WO-2025-0022
-- STORAGE TANK TK-307
-- ============================================================

(
'WO-2025-0022',
'PET-POLY-TK307-001',
'modification',
'low',
'Installation of radar level transmitter replacing legacy float gauge.',
NULL,
'2025-10-07 09:00:00+05:30',
'2025-10-07 18:00:00+05:30',
8.20,
8.00,
'FT002',
'Vikram Singh',
'ME004',
'Existing float gauge exhibited inaccurate readings during high-viscosity product storage.',
'Installed radar level transmitter and integrated with SCADA historian.',
'[{"part_no":"LT-RADAR-307","description":"80GHz Radar Level Transmitter","qty":1,"cost":112500}]',
'["Loop Calibrator","HART Communicator","Laptop"]',
'["electrical_isolation","working_at_height"]',
'verified',
TRUE,
'QE002',
'2025-10-08 10:00:00+05:30'
),

-- ============================================================
-- WO-2026-0023
-- FEED PUMP P-302
-- ============================================================

(
'WO-2026-0023',
'PET-DIST-P302-001',
'corrective',
'high',
'Repair excessive vibration and coupling misalignment on feed pump.',
NULL,
'2026-02-14 07:30:00+05:30',
'2026-02-14 16:30:00+05:30',
9.00,
8.50,
'FT002',
'Vikram Singh',
'ME003',
'Pump coupling alignment exceeded allowable tolerance. Drive-end bearing wear observed.',
'Bearing replaced, coupling laser aligned and vibration levels restored to OEM limits.',
'[{"part_no":"BR-6309","description":"SKF Bearing 6309","qty":2,"cost":24800},{"part_no":"CP-P302","description":"Flexible Coupling Insert","qty":1,"cost":7200}]',
'["Laser Alignment Kit","Bearing Puller","Vibration Analyzer"]',
'["loto"]',
'verified',
TRUE,
'QE002',
'2026-02-15 08:30:00+05:30'
),

-- ============================================================
-- WO-2026-0024
-- HX-306 PERFORMANCE INSPECTION
-- ============================================================

(
'WO-2026-0024',
'PET-POLY-HX306-001',
'inspection',
'medium',
'Performance verification following scheduled polymer production campaign.',
NULL,
'2026-06-08 08:30:00+05:30',
NULL,
NULL,
6.00,
'FT002',
'Vikram Singh',
'ME004',
NULL,
NULL,
'[]',
'["Thermal Camera","Ultrasonic Thickness Gauge","Flow Meter"]',
'["loto"]',
'in_progress',
NULL,
NULL,
NULL
);

-- ============================================================
-- FortTrace Seed Data
-- File: 06_work_orders_part3.sql
-- STEEL Plant Work Orders (6)
-- ============================================================

INSERT INTO work_orders
(
    wo_id,
    uat,
    wo_type,
    priority,
    description,
    root_cause_id,
    start_date,
    end_date,
    actual_hours,
    estimated_hours,
    technician_id,
    technician_name,
    supervisor_id,
    findings,
    corrective_action,
    parts_replaced,
    tools_used,
    safety_permits,
    status,
    quality_check_passed,
    verified_by,
    verified_at
)
VALUES

-- ============================================================
-- WO-2024-0025
-- ROLLING MILL RM-101
-- ============================================================

(
'WO-2024-0025',
'STL-RM-RM101-001',
'preventive',
'medium',
'Quarterly inspection and lubrication of rolling mill drive system.',
NULL,
'2024-03-18 08:00:00+05:30',
'2024-03-18 17:30:00+05:30',
8.80,
9.00,
'FT003',
'Rakesh Sharma',
'ME005',
'Gearbox oil contamination detected with minor wear particles in filter.',
'Gearbox oil replaced and lubrication circuit flushed.',
'[{"part_no":"LUBE-460","description":"Industrial Gear Oil ISO VG460","qty":80,"cost":38400}]',
'["Oil Transfer Pump","Infrared Thermometer","Torque Wrench"]',
'["loto"]',
'verified',
TRUE,
'QE002',
'2024-03-19 09:15:00+05:30'
),

-- ============================================================
-- WO-2025-0026
-- BLAST FURNACE BF-201
-- ============================================================

(
'WO-2025-0026',
'STL-BF-BF201-001',
'corrective',
'high',
'Repair tuyere cooling water leakage identified during routine inspection.',
NULL,
'2025-01-21 07:00:00+05:30',
'2025-01-21 19:00:00+05:30',
11.80,
12.00,
'FT003',
'Rakesh Sharma',
'ME006',
'Cooling water flange gasket failure caused localized leakage near Tuyere No. 8.',
'Replaced gasket, pressure tested cooling circuit and restored normal operation.',
'[{"part_no":"GSK-BF201","description":"High Temperature Flange Gasket","qty":2,"cost":12800}]',
'["Hydraulic Torque Wrench","Pressure Test Kit"]',
'["hot_work","loto"]',
'verified',
TRUE,
'QE002',
'2025-01-22 08:45:00+05:30'
),

-- ============================================================
-- WO-2025-0027
-- CONTINUOUS CASTING MACHINE CCM-301
-- ============================================================

(
'WO-2025-0027',
'STL-CCM-CCM301-001',
'preventive',
'medium',
'Caster roller alignment inspection and mold cooling system verification.',
NULL,
'2025-06-10 08:00:00+05:30',
'2025-06-11 16:30:00+05:30',
16.50,
16.00,
'FT003',
'Rakesh Sharma',
'ME005',
'Minor roller alignment deviation observed on secondary cooling section.',
'Adjusted roller alignment and verified mold cooling flow.',
'[]',
'["Laser Alignment Kit","Dial Indicator","Flow Meter"]',
'["loto"]',
'verified',
TRUE,
'QE002',
'2025-06-12 09:00:00+05:30'
),

-- ============================================================
-- WO-2026-0028
-- HYDRAULIC PUMP P-401
-- ============================================================

(
'WO-2026-0028',
'STL-HYD-P401-001',
'emergency',
'critical',
'Hydraulic pressure loss causing rolling mill shutdown.',
NULL,
'2026-02-18 03:20:00+05:30',
'2026-02-18 14:00:00+05:30',
10.70,
9.00,
'FT003',
'Rakesh Sharma',
'ME006',
'Hydraulic pump shaft seal failure caused rapid pressure loss and oil leakage.',
'Replaced shaft seal, hydraulic filters and recommissioned hydraulic system.',
'[{"part_no":"SEAL-P401","description":"Hydraulic Shaft Seal","qty":1,"cost":11200},{"part_no":"FLT-H401","description":"Hydraulic Oil Filter","qty":2,"cost":8600}]',
'["Hydraulic Pressure Test Kit","Seal Puller","Oil Transfer Pump"]',
'["loto","oil_handling"]',
'completed',
TRUE,
'QE002',
'2026-02-19 08:20:00+05:30'
),

-- ============================================================
-- WO-2026-0029
-- COOLING TOWER CT-501
-- ============================================================

(
'WO-2026-0029',
'STL-UTIL-CT501-001',
'modification',
'medium',
'Upgrade cooling tower fan motor to IE4 high-efficiency motor.',
NULL,
'2026-05-22 08:00:00+05:30',
'2026-05-23 17:00:00+05:30',
17.20,
18.00,
'FT003',
'Rakesh Sharma',
'ME006',
'Existing motor operating below target efficiency with elevated power consumption.',
'Installed IE4 motor and updated motor protection relay settings.',
'[{"part_no":"MTR-IE4-75","description":"75kW IE4 Electric Motor","qty":1,"cost":485000}]',
'["Crane","Laser Alignment Kit","Insulation Tester"]',
'["electrical_isolation","lifting_operation"]',
'verified',
TRUE,
'QE002',
'2026-05-24 09:10:00+05:30'
),

-- ============================================================
-- WO-2026-0030
-- ROLLING MILL RM-101
-- ============================================================

(
'WO-2026-0030',
'STL-RM-RM101-001',
'inspection',
'medium',
'Comprehensive condition assessment before annual production shutdown.',
NULL,
'2026-07-04 08:30:00+05:30',
NULL,
NULL,
8.00,
'FT003',
'Rakesh Sharma',
'ME005',
NULL,
NULL,
'[]',
'["Vibration Analyzer","Thermal Camera","Ultrasonic Thickness Gauge"]',
'["loto"]',
'in_progress',
NULL,
NULL,
NULL
);

Inserting Failure Records

-- ============================================================
-- FortTrace Seed Data
-- File: 07_failure_events_part1.sql
-- REF Plant Failure Events (1-5)
-- ============================================================

INSERT INTO failure_events
(
    failure_id,
    uat,
    failure_mode,
    failure_category,
    severity,
    occurrence_date,
    detection_date,
    resolution_date,
    downtime_hours,
    production_loss_mt,
    financial_loss_inr,
    root_cause,
    root_cause_category,
    corrective_action,
    preventive_action,
    related_wo_id,
    related_inspection_id,
    operator_on_duty,
    weather_conditions
)
VALUES

-- ============================================================
-- FAILURE 1
-- R-101 HIGH TEMPERATURE TRIP
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000001',
'REF-HTX-R101-001',
'high_temperature_trip',
'process',
'critical',
'2026-06-30 02:14:00+05:30',
'2026-06-30 02:15:35+05:30',
'2026-06-30 10:42:00+05:30',
8.47,
126.50,
6845000.00,
'Progressive fouling inside Heat Exchanger E-201 reduced reactor cooling efficiency by approximately 34%, causing reactor outlet temperature to exceed trip limits. The reactor protection system initiated an automatic shutdown.',
'maintenance_gap',
'Heat exchanger tube bundle chemically cleaned, cooling water flow restored, reactor restarted after performance verification.',
'Introduce quarterly thermal performance monitoring and predictive fouling analytics using historical process data.',
'WO-2026-0013',
NULL,
'OP124',
'{"temperature":33.8,"humidity":82,"rainfall_mm":12.4,"weather":"light_rain"}'
),

-- ============================================================
-- FAILURE 2
-- P-201 BEARING FAILURE
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000002',
'REF-HTX-P201-001',
'bearing_failure',
'mechanical',
'major',
'2025-09-14 11:26:00+05:30',
'2025-09-14 11:28:10+05:30',
'2025-09-14 16:55:00+05:30',
5.48,
39.60,
1820000.00,
'Drive-end bearing lubrication degraded due to extended grease replacement interval. Increased vibration resulted in bearing overheating and seizure.',
'maintenance_gap',
'Both bearings replaced, shaft inspected, coupling aligned and lubrication schedule revised.',
'Implement vibration-based predictive maintenance and automatic lubrication monitoring.',
'WO-2025-0010',
NULL,
'OP118',
'{"temperature":36.2,"humidity":61,"rainfall_mm":0,"weather":"clear"}'
),

-- ============================================================
-- FAILURE 3
-- E-201 HEAT EXCHANGER FOULING
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000003',
'REF-HTX-E201-001',
'heat_exchanger_fouling',
'process',
'major',
'2025-04-10 08:45:00+05:30',
'2025-04-10 09:05:00+05:30',
'2025-04-12 18:10:00+05:30',
14.20,
54.80,
2950000.00,
'Heavy hydrocarbon fouling accumulated inside the tube bundle, reducing overall heat-transfer coefficient and increasing reactor inlet temperature.',
'process_degradation',
'Complete tube bundle hydro-jet cleaning performed along with gasket replacement.',
'Schedule online thermal efficiency calculations and cleaning based on fouling factor instead of fixed intervals.',
'WO-2025-0009',
NULL,
'OP121',
'{"temperature":34.5,"humidity":72,"rainfall_mm":2.1,"weather":"cloudy"}'
),

-- ============================================================
-- FAILURE 4
-- V-301 PRESSURE SAFETY VALVE LEAKAGE
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000004',
'REF-HTX-V301-001',
'pressure_safety_valve_leak',
'mechanical',
'minor',
'2024-08-22 14:40:00+05:30',
'2024-08-22 14:46:00+05:30',
'2024-08-22 18:15:00+05:30',
3.58,
8.20,
485000.00,
'Valve seat erosion caused intermittent lifting below design set pressure leading to hydrocarbon vapor losses.',
'component_wear',
'Pressure safety valve removed, seat replaced, spring recalibrated and certified.',
'Increase PSV bench testing frequency and monitor leakage trends.',
'WO-2024-0004',
NULL,
'OP102',
'{"temperature":31.4,"humidity":76,"rainfall_mm":5.3,"weather":"overcast"}'
),

-- ============================================================
-- FAILURE 5
-- T-401 AGITATOR HIGH VIBRATION
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000005',
'REF-HTX-T401-001',
'agitator_high_vibration',
'mechanical',
'major',
'2026-03-17 18:05:00+05:30',
'2026-03-17 18:08:00+05:30',
'2026-03-18 04:10:00+05:30',
10.08,
42.30,
2135000.00,
'Agitator shaft imbalance developed after prolonged operation causing vibration levels to exceed ISO 10816 alarm limits.',
'mechanical_fatigue',
'Shaft dynamically balanced, bearings replaced and coupling alignment verified.',
'Perform quarterly vibration signature analysis and balancing during planned shutdowns.',
'WO-2026-0015',
NULL,
'OP127',
'{"temperature":29.7,"humidity":69,"rainfall_mm":0,"weather":"clear"}'
);

-- ============================================================
-- FortTrace Seed Data
-- File: 07_failure_events_part2.sql
-- PET Plant Failure Events (6-8)
-- ============================================================

INSERT INTO failure_events
(
    failure_id,
    uat,
    failure_mode,
    failure_category,
    severity,
    occurrence_date,
    detection_date,
    resolution_date,
    downtime_hours,
    production_loss_mt,
    financial_loss_inr,
    root_cause,
    root_cause_category,
    corrective_action,
    preventive_action,
    related_wo_id,
    related_inspection_id,
    operator_on_duty,
    weather_conditions
)
VALUES

-- ============================================================
-- FAILURE 6
-- C-301 MECHANICAL SEAL LEAK
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000006',
'PET-DIST-C301-001',
'mechanical_seal_leak',
'mechanical',
'critical',
'2026-05-16 01:18:00+05:30',
'2026-05-16 01:20:15+05:30',
'2026-05-16 15:32:00+05:30',
14.23,
92.40,
5215000.00,
'Progressive wear of the primary mechanical seal caused hydrocarbon leakage. Elevated shaft vibration and seal flush pressure fluctuations accelerated seal degradation before automatic shutdown.',
'component_wear',
'Mechanical seal assembly replaced, shaft sleeve inspected, seal flush line cleaned and pump recommissioned after leak testing.',
'Monitor seal flush pressure continuously and introduce quarterly vibration trending with predictive seal health monitoring.',
'WO-2026-0020',
NULL,
'OP214',
'{"temperature":35.1,"humidity":74,"rainfall_mm":0,"weather":"clear"}'
),

-- ============================================================
-- FAILURE 7
-- P-302 COUPLING MISALIGNMENT
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000007',
'PET-DIST-P302-001',
'coupling_misalignment',
'mechanical',
'major',
'2026-02-14 06:55:00+05:30',
'2026-02-14 07:02:00+05:30',
'2026-02-14 16:45:00+05:30',
9.83,
41.80,
1765000.00,
'Thermal growth after repeated start-stop cycles caused excessive shaft misalignment. Continued operation resulted in elevated bearing temperatures and abnormal vibration.',
'alignment_error',
'Pump bearings replaced, coupling laser aligned and vibration levels verified within ISO limits before returning to service.',
'Perform laser alignment after every major shutdown and install permanent vibration monitoring sensors.',
'WO-2026-0023',
NULL,
'OP219',
'{"temperature":31.8,"humidity":68,"rainfall_mm":0,"weather":"clear"}'
),

-- ============================================================
-- FAILURE 8
-- HX-306 POLYMER FOULING
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000008',
'PET-POLY-HX306-001',
'heat_exchanger_fouling',
'process',
'major',
'2025-03-12 07:45:00+05:30',
'2025-03-12 08:05:00+05:30',
'2025-03-13 18:10:00+05:30',
16.42,
37.60,
2140000.00,
'Polymer deposition inside the exchanger tubes reduced heat transfer efficiency by approximately 18%, increasing reactor outlet temperature and steam consumption.',
'process_degradation',
'Chemical cleaning completed, tube bundle inspected, damaged gaskets replaced and thermal performance restored.',
'Adopt fouling-factor based cleaning schedules supported by process historian analytics rather than fixed maintenance intervals.',
'WO-2025-0021',
NULL,
'OP223',
'{"temperature":34.2,"humidity":59,"rainfall_mm":0,"weather":"partly_cloudy"}'
);

-- ============================================================
-- FortTrace Seed Data
-- File: 07_failure_events_part3.sql
-- STEEL Plant Failure Events (9-11)
-- ============================================================

INSERT INTO failure_events
(
    failure_id,
    uat,
    failure_mode,
    failure_category,
    severity,
    occurrence_date,
    detection_date,
    resolution_date,
    downtime_hours,
    production_loss_mt,
    financial_loss_inr,
    root_cause,
    root_cause_category,
    corrective_action,
    preventive_action,
    related_wo_id,
    related_inspection_id,
    operator_on_duty,
    weather_conditions
)
VALUES

-- ============================================================
-- FAILURE 9
-- BLAST FURNACE BF-201 COOLING WATER LEAK
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000009',
'STL-BF-BF201-001',
'cooling_water_leak',
'mechanical',
'critical',
'2025-01-21 06:42:00+05:30',
'2025-01-21 06:46:00+05:30',
'2025-01-21 18:15:00+05:30',
11.55,
168.40,
8420000.00,
'Failure of the tuyere cooling water flange gasket resulted in continuous leakage, reducing cooling efficiency and increasing shell temperature beyond safe operating limits.',
'component_wear',
'Cooling circuit isolated, flange gasket replaced, pressure testing completed and furnace returned to service after thermal verification.',
'Introduce annual gasket replacement program and continuous cooling water pressure monitoring.',
'WO-2025-0026',
NULL,
'OP318',
'{"temperature":19.6,"humidity":48,"rainfall_mm":0,"weather":"clear"}'
),

-- ============================================================
-- FAILURE 10
-- HYDRAULIC PUMP P-401 PRESSURE LOSS
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000010',
'STL-HYD-P401-001',
'hydraulic_pressure_loss',
'mechanical',
'critical',
'2026-02-18 03:08:00+05:30',
'2026-02-18 03:10:00+05:30',
'2026-02-18 14:18:00+05:30',
11.17,
73.20,
3945000.00,
'Hydraulic shaft seal failure caused rapid oil leakage and a sudden drop in hydraulic pressure, forcing an emergency shutdown of the rolling mill hydraulic system.',
'seal_failure',
'Installed new shaft seal, replaced hydraulic filters, replenished hydraulic oil and pressure-tested the complete hydraulic circuit.',
'Implement online hydraulic pressure trending and periodic seal condition inspections using vibration and oil analysis.',
'WO-2026-0028',
NULL,
'OP321',
'{"temperature":22.4,"humidity":42,"rainfall_mm":0,"weather":"clear"}'
),

-- ============================================================
-- FAILURE 11
-- ROLLING MILL RM-101 GEARBOX WEAR
-- ============================================================

(
'4f5d0df5-c65d-4d35-8b9a-001000000011',
'STL-RM-RM101-001',
'gearbox_lubrication_failure',
'mechanical',
'major',
'2024-03-18 07:30:00+05:30',
'2024-03-18 07:42:00+05:30',
'2024-03-18 17:45:00+05:30',
10.25,
58.90,
2480000.00,
'Contaminated gearbox lubricant containing metallic wear particles reduced lubrication effectiveness, resulting in increased gearbox vibration and abnormal operating temperatures.',
'lubrication_failure',
'Gearbox flushed, lubricant replaced, magnetic filters cleaned and vibration levels verified after restart.',
'Adopt oil condition monitoring with quarterly spectrographic analysis and predictive maintenance scheduling.',
'WO-2024-0025',
NULL,
'OP305',
'{"temperature":24.1,"humidity":37,"rainfall_mm":0,"weather":"clear"}'
);

Inserting Alarm_records

-- ============================================================
-- FortTrace Seed Data
-- File: 08_alarm_history_part1A.sql
-- REF Plant Alarm History (R-101 + P-201)
-- Total Alarms : 10
-- ============================================================

INSERT INTO alarm_history
(
    uat,
    tag_name,
    tag_description,
    alarm_type,
    alarm_value,
    setpoint_high,
    setpoint_low,
    unit,
    alarm_priority,
    triggered_at,
    acknowledged_by,
    acknowledged_at,
    reset_at,
    reset_by,
    resolution_notes,
    related_failure_id,
    is_root_cause
)
VALUES

-- ============================================================
-- FAILURE : R-101 HIGH TEMPERATURE TRIP
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000001
-- ============================================================

(
'REF-HTX-R101-001',
'TIC-101',
'Reactor Outlet Temperature',
'high_temperature',
476.2,
480.0,
NULL,
'degC',
3,
'2026-06-30 02:05:11+05:30',
'OP124',
'2026-06-30 02:05:50+05:30',
'2026-06-30 02:11:20+05:30',
'OP124',
'Temperature approaching operating limit.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
FALSE
),

(
'REF-HTX-R101-001',
'FIC-204',
'Cooling Water Flow',
'low_flow',
112.6,
NULL,
120.0,
'm3/hr',
2,
'2026-06-30 02:08:18+05:30',
'OP124',
'2026-06-30 02:08:40+05:30',
'2026-06-30 10:28:00+05:30',
'OP124',
'Cooling water flow below operating target.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
TRUE
),

(
'REF-HTX-R101-001',
'TIC-101',
'Reactor Outlet Temperature',
'high_high_temperature',
482.8,
480.0,
NULL,
'degC',
1,
'2026-06-30 02:13:42+05:30',
'OP124',
'2026-06-30 02:13:50+05:30',
'2026-06-30 10:41:20+05:30',
'OP124',
'High-high temperature alarm initiated reactor shutdown sequence.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
FALSE
),

(
'REF-HTX-R101-001',
'PIC-101',
'Reactor Pressure',
'high_pressure',
17.9,
17.5,
NULL,
'bar',
2,
'2026-06-30 02:13:58+05:30',
'OP124',
'2026-06-30 02:14:12+05:30',
'2026-06-30 10:39:00+05:30',
'OP124',
'Pressure increased due to reduced heat removal.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
FALSE
),

(
'REF-HTX-R101-001',
'TT-201',
'Heat Exchanger Outlet Temperature',
'high_temperature',
151.4,
145.0,
NULL,
'degC',
2,
'2026-06-30 02:12:06+05:30',
'OP124',
'2026-06-30 02:12:30+05:30',
'2026-06-30 10:37:40+05:30',
'OP124',
'Heat exchanger outlet temperature exceeded normal operating range.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
FALSE
),

(
'REF-HTX-R101-001',
'ESD-101',
'Emergency Shutdown System',
'trip',
1,
1,
0,
'state',
1,
'2026-06-30 02:14:00+05:30',
'OP124',
'2026-06-30 02:14:05+05:30',
'2026-06-30 10:42:10+05:30',
'OP124',
'Automatic emergency shutdown executed successfully.',
'4f5d0df5-c65d-4d35-8b9a-001000000001',
FALSE
),

-- ============================================================
-- FAILURE : P-201 BEARING FAILURE
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000002
-- ============================================================

(
'REF-HTX-P201-001',
'VIB-201',
'Pump Bearing Vibration',
'high_vibration',
7.8,
7.1,
NULL,
'mm/s',
3,
'2025-09-14 11:10:18+05:30',
'OP118',
'2025-09-14 11:11:02+05:30',
'2025-09-14 16:40:00+05:30',
'OP118',
'Bearing vibration increasing steadily.',
'4f5d0df5-c65d-4d35-8b9a-001000000002',
FALSE
),

(
'REF-HTX-P201-001',
'BT-201',
'Bearing Temperature',
'high_temperature',
92.6,
90.0,
NULL,
'degC',
2,
'2025-09-14 11:18:05+05:30',
'OP118',
'2025-09-14 11:18:25+05:30',
'2025-09-14 16:46:00+05:30',
'OP118',
'Bearing temperature exceeded allowable operating limit.',
'4f5d0df5-c65d-4d35-8b9a-001000000002',
FALSE
),

(
'REF-HTX-P201-001',
'LT-201',
'Lubrication Reservoir Level',
'low_level',
18,
NULL,
20,
'%',
2,
'2025-09-14 11:21:54+05:30',
'OP118',
'2025-09-14 11:22:20+05:30',
'2025-09-14 16:48:00+05:30',
'OP118',
'Low lubrication level identified as contributing factor.',
'4f5d0df5-c65d-4d35-8b9a-001000000002',
TRUE
),

(
'REF-HTX-P201-001',
'MTR-201',
'Pump Motor Protection',
'motor_trip',
1,
1,
0,
'state',
1,
'2025-09-14 11:26:03+05:30',
'OP118',
'2025-09-14 11:26:10+05:30',
'2025-09-14 16:55:00+05:30',
'OP118',
'Motor protection relay tripped after bearing seizure.',
'4f5d0df5-c65d-4d35-8b9a-001000000002',
FALSE
);

-- ============================================================
-- FortTrace Seed Data
-- File: 08_alarm_history_part1B.sql
-- REF Plant Alarm History
-- E-201 Fouling + V-301 PSV Leak + T-401 Agitator Vibration
-- Total Alarms : 9
-- ============================================================

INSERT INTO alarm_history
(
    uat,
    tag_name,
    tag_description,
    alarm_type,
    alarm_value,
    setpoint_high,
    setpoint_low,
    unit,
    alarm_priority,
    triggered_at,
    acknowledged_by,
    acknowledged_at,
    reset_at,
    reset_by,
    resolution_notes,
    related_failure_id,
    is_root_cause
)
VALUES

-- ============================================================
-- FAILURE : E-201 HEAT EXCHANGER FOULING
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000003
-- ============================================================

(
'REF-HTX-E201-001',
'FIT-201',
'Cooling Water Flow',
'low_flow',
121.5,
NULL,
130.0,
'm3/hr',
3,
'2025-04-09 08:42:11+05:30',
'OP126',
'2025-04-09 08:42:35+05:30',
'2025-04-10 14:22:00+05:30',
'OP126',
'Cooling water flow reduced below design value.',
'4f5d0df5-c65d-4d35-8b9a-001000000003',
FALSE
),

(
'REF-HTX-E201-001',
'PDT-201',
'Differential Pressure Across Tube Bundle',
'high_differential_pressure',
1.92,
1.70,
NULL,
'bar',
2,
'2025-04-09 09:01:15+05:30',
'OP126',
'2025-04-09 09:01:46+05:30',
'2025-04-10 14:35:00+05:30',
'OP126',
'Tube bundle differential pressure increased indicating fouling.',
'4f5d0df5-c65d-4d35-8b9a-001000000003',
TRUE
),

(
'REF-HTX-E201-001',
'TT-201',
'Outlet Temperature',
'high_temperature',
148.8,
145.0,
NULL,
'degC',
2,
'2025-04-09 09:14:28+05:30',
'OP126',
'2025-04-09 09:15:04+05:30',
'2025-04-10 14:38:00+05:30',
'OP126',
'Reduced heat transfer efficiency observed.',
'4f5d0df5-c65d-4d35-8b9a-001000000003',
FALSE
),

(
'REF-HTX-E201-001',
'FIC-201',
'Process Flow Controller',
'low_flow',
247.3,
NULL,
255.0,
'm3/hr',
3,
'2025-04-09 09:20:32+05:30',
'OP126',
'2025-04-09 09:21:00+05:30',
'2025-04-10 14:41:00+05:30',
'OP126',
'Process flow reduced because of exchanger restriction.',
'4f5d0df5-c65d-4d35-8b9a-001000000003',
FALSE
),

-- ============================================================
-- FAILURE : V-301 PSV LEAK
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000004
-- ============================================================

(
'REF-HTX-V301-001',
'PIC-301',
'Separator Pressure',
'high_pressure',
12.6,
12.0,
NULL,
'bar',
2,
'2024-11-18 03:41:20+05:30',
'OP112',
'2024-11-18 03:41:48+05:30',
'2024-11-18 08:55:00+05:30',
'OP112',
'Pressure increased before PSV lifted.',
'4f5d0df5-c65d-4d35-8b9a-001000000004',
FALSE
),

(
'REF-HTX-V301-001',
'PSV-301',
'Pressure Safety Valve Position',
'valve_leak',
8.5,
NULL,
0,
'%',
1,
'2024-11-18 03:43:02+05:30',
'OP112',
'2024-11-18 03:43:20+05:30',
'2024-11-18 09:02:00+05:30',
'OP112',
'Pressure safety valve failed to reseat after lifting.',
'4f5d0df5-c65d-4d35-8b9a-001000000004',
TRUE
),

-- ============================================================
-- FAILURE : T-401 AGITATOR VIBRATION
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000005
-- ============================================================

(
'REF-HTX-T401-001',
'VIB-401',
'Agitator Shaft Vibration',
'high_vibration',
6.8,
6.5,
NULL,
'mm/s',
3,
'2026-01-11 15:14:42+05:30',
'OP131',
'2026-01-11 15:15:06+05:30',
'2026-01-11 20:55:00+05:30',
'OP131',
'Gradual increase in shaft vibration detected.',
'4f5d0df5-c65d-4d35-8b9a-001000000005',
FALSE
),

(
'REF-HTX-T401-001',
'VIB-402',
'Gearbox Vibration',
'high_vibration',
8.4,
7.0,
NULL,
'mm/s',
2,
'2026-01-11 15:18:31+05:30',
'OP131',
'2026-01-11 15:18:58+05:30',
'2026-01-11 21:00:00+05:30',
'OP131',
'Gearbox vibration exceeded maintenance threshold.',
'4f5d0df5-c65d-4d35-8b9a-001000000005',
TRUE
),

(
'REF-HTX-T401-001',
'MT-401',
'Agitator Motor Current',
'high_current',
112.5,
105.0,
NULL,
'A',
2,
'2026-01-11 15:22:10+05:30',
'OP131',
'2026-01-11 15:22:40+05:30',
'2026-01-11 21:04:00+05:30',
'OP131',
'Motor current increased due to excessive mechanical load.',
'4f5d0df5-c65d-4d35-8b9a-001000000005',
FALSE
);

-- ============================================================
-- FortTrace Seed Data
-- File: 08_alarm_history_part2.sql
-- PET Plant Alarm History
-- Total Alarms : 8
-- ============================================================

INSERT INTO alarm_history
(
    uat,
    tag_name,
    tag_description,
    alarm_type,
    alarm_value,
    setpoint_high,
    setpoint_low,
    unit,
    alarm_priority,
    triggered_at,
    acknowledged_by,
    acknowledged_at,
    reset_at,
    reset_by,
    resolution_notes,
    related_failure_id,
    is_root_cause
)
VALUES

-- ============================================================
-- FAILURE : C-301 MECHANICAL SEAL LEAK
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000006
-- ============================================================

(
'PET-DIST-C301-001',
'PIC-301',
'Compressor Discharge Pressure',
'low_pressure',
18.4,
NULL,
19.5,
'bar',
3,
'2026-03-17 10:41:22+05:30',
'OP221',
'2026-03-17 10:41:50+05:30',
'2026-03-17 16:20:00+05:30',
'OP221',
'Gradual pressure loss observed across compressor discharge.',
'4f5d0df5-c65d-4d35-8b9a-001000000006',
FALSE
),

(
'PET-DIST-C301-001',
'LT-301',
'Seal Oil Reservoir Level',
'low_level',
22.4,
NULL,
25.0,
'%',
2,
'2026-03-17 10:44:18+05:30',
'OP221',
'2026-03-17 10:44:45+05:30',
'2026-03-17 16:25:00+05:30',
'OP221',
'Seal oil level continuously decreasing.',
'4f5d0df5-c65d-4d35-8b9a-001000000006',
TRUE
),

(
'PET-DIST-C301-001',
'VIB-301',
'Compressor Radial Vibration',
'high_vibration',
7.6,
7.0,
NULL,
'mm/s',
2,
'2026-03-17 10:46:30+05:30',
'OP221',
'2026-03-17 10:47:00+05:30',
'2026-03-17 16:28:00+05:30',
'OP221',
'Rotor vibration increased due to seal degradation.',
'4f5d0df5-c65d-4d35-8b9a-001000000006',
FALSE
),

(
'PET-DIST-C301-001',
'GD-301',
'Hydrocarbon Gas Detector',
'gas_detection',
38.5,
25.0,
NULL,
'%LEL',
1,
'2026-03-17 10:48:54+05:30',
'OP221',
'2026-03-17 10:49:02+05:30',
'2026-03-17 16:31:00+05:30',
'OP221',
'Hydrocarbon leak detected near compressor seal housing.',
'4f5d0df5-c65d-4d35-8b9a-001000000006',
FALSE
),

-- ============================================================
-- FAILURE : P-302 PUMP MISALIGNMENT
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000007
-- ============================================================

(
'PET-DIST-P302-001',
'VIB-302',
'Pump Coupling Vibration',
'high_vibration',
8.2,
7.5,
NULL,
'mm/s',
2,
'2026-05-09 14:16:44+05:30',
'OP228',
'2026-05-09 14:17:15+05:30',
'2026-05-09 18:52:00+05:30',
'OP228',
'Coupling vibration exceeded ISO 10816 acceptable limits.',
'4f5d0df5-c65d-4d35-8b9a-001000000007',
TRUE
),

(
'PET-DIST-P302-001',
'MT-302',
'Pump Motor Current',
'high_current',
97.8,
92.0,
NULL,
'A',
3,
'2026-05-09 14:18:55+05:30',
'OP228',
'2026-05-09 14:19:18+05:30',
'2026-05-09 18:55:00+05:30',
'OP228',
'Motor current increased due to shaft misalignment.',
'4f5d0df5-c65d-4d35-8b9a-001000000007',
FALSE
),

-- ============================================================
-- FAILURE : HX-306 HEAT EXCHANGER FOULING
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000008
-- ============================================================

(
'PET-POLY-HX306-001',
'PDT-306',
'Heat Exchanger Differential Pressure',
'high_differential_pressure',
2.24,
2.0,
NULL,
'bar',
2,
'2025-08-24 09:12:35+05:30',
'OP234',
'2025-08-24 09:12:58+05:30',
'2025-08-25 13:44:00+05:30',
'OP234',
'Pressure drop across exchanger indicates progressive fouling.',
'4f5d0df5-c65d-4d35-8b9a-001000000008',
TRUE
),

(
'PET-POLY-HX306-001',
'TT-306',
'Product Outlet Temperature',
'high_temperature',
176.5,
170.0,
NULL,
'degC',
2,
'2025-08-24 09:18:46+05:30',
'OP234',
'2025-08-24 09:19:10+05:30',
'2025-08-25 13:48:00+05:30',
'OP234',
'Reduced heat transfer efficiency increased outlet temperature.',
'4f5d0df5-c65d-4d35-8b9a-001000000008',
FALSE
);

-- ============================================================
-- FortTrace Seed Data
-- File: 08_alarm_history_part3.sql
-- STEEL Plant Alarm History
-- Total Alarms : 3
-- ============================================================

INSERT INTO alarm_history
(
    uat,
    tag_name,
    tag_description,
    alarm_type,
    alarm_value,
    setpoint_high,
    setpoint_low,
    unit,
    alarm_priority,
    triggered_at,
    acknowledged_by,
    acknowledged_at,
    reset_at,
    reset_by,
    resolution_notes,
    related_failure_id,
    is_root_cause
)
VALUES

-- ============================================================
-- FAILURE : BF-201 COOLING WATER LEAK
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000009
-- ============================================================

(
'STL-BF-BF201-001',
'FIT-201',
'Blast Furnace Cooling Water Flow',
'low_flow',
785.20,
NULL,
820.00,
'm3/hr',
1,
'2025-01-21 06:40:18+05:30',
'OP318',
'2025-01-21 06:40:40+05:30',
'2025-01-21 18:18:00+05:30',
'OP318',
'Cooling water flow dropped rapidly because of flange gasket failure. Furnace load reduced until cooling circuit was restored.',
'4f5d0df5-c65d-4d35-8b9a-001000000009',
TRUE
),

-- ============================================================
-- FAILURE : P-401 HYDRAULIC PRESSURE LOSS
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000010
-- ============================================================

(
'STL-HYD-P401-001',
'PIC-401',
'Hydraulic System Pressure',
'low_pressure',
124.50,
NULL,
140.00,
'bar',
1,
'2026-02-18 03:07:42+05:30',
'OP321',
'2026-02-18 03:08:01+05:30',
'2026-02-18 14:22:00+05:30',
'OP321',
'Hydraulic pressure collapsed following shaft seal failure and rapid oil loss. Emergency shutdown initiated.',
'4f5d0df5-c65d-4d35-8b9a-001000000010',
TRUE
),

-- ============================================================
-- FAILURE : RM-101 GEARBOX LUBRICATION FAILURE
-- Failure ID : 4f5d0df5-c65d-4d35-8b9a-001000000011
-- ============================================================

(
'STL-RM-RM101-001',
'VIB-101',
'Rolling Mill Gearbox Vibration',
'high_vibration',
10.60,
9.50,
NULL,
'mm/s',
2,
'2024-03-18 07:28:14+05:30',
'OP305',
'2024-03-18 07:28:35+05:30',
'2024-03-18 17:52:00+05:30',
'OP305',
'Gearbox vibration increased due to contaminated lubricant containing metallic wear particles. Oil replaced and gearbox flushed.',
'4f5d0df5-c65d-4d35-8b9a-001000000011',
TRUE
);

Inserting Expert Feedback

-- ============================================================
-- FortTrace Seed Data
-- File: 10_expert_feedback.sql
-- Expert Feedback Dataset (10 Records)
-- ============================================================

INSERT INTO expert_feedback
(
    session_id,
    query_text,
    query_type,
    ai_response,
    engineer_correction,
    engineer_id,
    engineer_name,
    years_of_service,
    domain,
    uat,
    is_anonymized,
    anonymized_query,
    anonymized_response,
    used_for_training,
    training_batch_id
)
VALUES

(
'SES-20260630-001',
'Why did Reactor R-101 trip due to high temperature?',
'RCA',
'The reactor temperature increased because of poor operator response.',
'Alarm history shows cooling water flow dropped first due to fouling in Heat Exchanger E-201. The operator response was timely. Root cause is exchanger fouling reducing heat transfer.',
'USR002',
'Rajesh Kumar',
28,
'Process',
'REF-HTX-R101-001',
TRUE,
'Why did the reactor trip?',
'Cooling failure caused reactor shutdown.',
TRUE,
'BATCH-001'
),

(
'SES-20250914-002',
'Predict the cause of vibration in Pump P-201.',
'PREDICTIVE',
'Likely electrical imbalance in motor windings.',
'Bearing wear and inadequate lubrication are supported by vibration trend and bearing temperature alarms. Electrical system is healthy.',
'USR003',
'Anil Sharma',
24,
'Mechanical',
'REF-HTX-P201-001',
TRUE,
'Cause of pump vibration?',
'Bearing degradation.',
TRUE,
'BATCH-001'
),

(
'SES-20250409-003',
'Why has Heat Exchanger E-201 efficiency reduced?',
'RCA',
'Cooling water pump failure is the primary reason.',
'Differential pressure across the exchanger increased gradually indicating tube bundle fouling. Pump performance remained within limits.',
'USR006',
'Vikas Nair',
21,
'Mechanical',
'REF-HTX-E201-001',
TRUE,
'Why is exchanger performance low?',
'Tube fouling reduced heat transfer.',
TRUE,
'BATCH-001'
),

(
'SES-20260317-004',
'What caused Compressor C-301 shutdown?',
'RCA',
'Motor overload caused the shutdown.',
'Seal oil level dropped continuously before gas detection alarms. Mechanical seal failure is the root cause.',
'USR004',
'Priya Menon',
19,
'Mechanical',
'PET-DIST-C301-001',
TRUE,
'Reason for compressor trip?',
'Seal failure caused shutdown.',
TRUE,
'BATCH-001'
),

(
'SES-20260509-005',
'Why is Pump P-302 vibration increasing?',
'PREDICTIVE',
'Possible cavitation due to low suction pressure.',
'Coupling alignment measurements indicate shaft misalignment. Suction pressure remained normal.',
'USR007',
'Rohit Gupta',
16,
'Mechanical',
'PET-DIST-P302-001',
TRUE,
'Pump vibration issue.',
'Alignment problem detected.',
TRUE,
'BATCH-002'
),

(
'SES-20250824-006',
'Suggest maintenance for HX-306.',
'PREDICTIVE',
'Replace the entire heat exchanger.',
'Cleaning of tube bundle is sufficient. Differential pressure indicates fouling, not structural failure.',
'USR006',
'Vikas Nair',
21,
'Mechanical',
'PET-POLY-HX306-001',
TRUE,
'Maintenance for heat exchanger.',
'Tube cleaning required.',
TRUE,
'BATCH-002'
),

(
'SES-20250121-007',
'Why did BF-201 furnace load reduce?',
'RCA',
'Fuel gas pressure dropped unexpectedly.',
'Cooling water flow reduced because of flange gasket leakage. Furnace load reduction was a protective response.',
'USR009',
'Suresh Iyer',
31,
'Mechanical',
'STL-BF-BF201-001',
TRUE,
'Blast furnace load reduction.',
'Cooling leak identified.',
TRUE,
'BATCH-002'
),

(
'SES-20260218-008',
'Hydraulic pressure dropped suddenly on P-401.',
'RCA',
'Hydraulic pump motor failed.',
'Hydraulic shaft seal failed causing oil loss and pressure collapse. Motor remained operational.',
'USR010',
'Arvind Rao',
26,
'Hydraulic',
'STL-HYD-P401-001',
TRUE,
'Hydraulic pressure loss.',
'Seal failure caused pressure loss.',
TRUE,
'BATCH-002'
),

(
'SES-20240318-009',
'Why is gearbox vibration high on RM-101?',
'PREDICTIVE',
'Gear teeth are broken.',
'Oil analysis showed metallic contamination due to lubricant degradation. Gear teeth remained within tolerance.',
'USR011',
'Mahesh Kulkarni',
34,
'Reliability',
'STL-RM-RM101-001',
TRUE,
'Gearbox vibration.',
'Lubrication degradation.',
TRUE,
'BATCH-003'
),

(
'SES-20260411-010',
'How should temperature transmitter TT-201 be calibrated?',
'GENERAL',
'Adjust the transmitter until the display matches the control room value.',
'Calibration must follow OEM procedure using a certified dry-block calibrator with 5-point verification and documentation.',
'USR005',
'Neha Singh',
17,
'Instrumentation',
'REF-HTX-E201-001',
TRUE,
'Calibrate temperature transmitter.',
'Follow OEM calibration procedure.',
TRUE,
'BATCH-003'
);

Inserting Audit logs

-- ============================================================
-- FortTrace Seed Data
-- File: 11_query_audit_log.sql
-- 15 Sample User Queries
-- ============================================================

INSERT INTO query_audit_log
(
    session_id,
    user_id,
    user_role,
    query_text,
    query_language,
    query_type,
    intent_confidence,
    agent_used,
    response_json,
    sources_cited,
    model_used,
    model_version,
    tokens_input,
    tokens_output,
    latency_ms,
    cache_hit,
    ip_address,
    user_agent,
    timestamp
)
VALUES

(
'SES-20260630-001',
'USR002',
'Maintenance_Engineer',
'Why did Reactor R-101 trip?',
'en',
'RCA',
0.98,
'RCAAgent',
'{"summary":"Cooling loop degradation detected"}',
'["failure_events","alarm_history","work_orders"]',
'FortTrace-Llama3',
'v1.2',
486,
215,
1630,
FALSE,
'192.168.10.21',
'Chrome 138 Windows',
'2026-06-30 09:15:21+05:30'
),

(
'SES-20260630-002',
'USR002',
'Maintenance_Engineer',
'Show all alarms before reactor shutdown.',
'en',
'RCA',
0.97,
'AlarmAgent',
'{"alarms_found":6}',
'["alarm_history"]',
'FortTrace-Llama3',
'v1.2',
412,
184,
1218,
TRUE,
'192.168.10.21',
'Chrome 138 Windows',
'2026-06-30 09:18:05+05:30'
),

(
'SES-20260509-003',
'USR004',
'Maintenance_Engineer',
'Predict failure probability for Pump P-302.',
'en',
'PREDICTIVE',
0.95,
'PredictiveAgent',
'{"risk":"High","confidence":0.91}',
'["sensor_data","work_orders"]',
'FortTrace-Llama3',
'v1.2',
523,
248,
1710,
FALSE,
'192.168.20.15',
'Edge Windows',
'2026-05-09 15:24:11+05:30'
),

(
'SES-20260317-004',
'USR003',
'Safety_Officer',
'Any gas leaks reported on Compressor C-301?',
'en',
'GENERAL',
0.94,
'QueryAgent',
'{"gas_alarm":true}',
'["alarm_history","failure_events"]',
'FortTrace-Llama3',
'v1.2',
388,
154,
1098,
FALSE,
'192.168.20.11',
'Firefox',
'2026-03-17 11:08:22+05:30'
),

(
'SES-20260218-005',
'USR009',
'Plant_Manager',
'Why was hydraulic system shut down?',
'en',
'RCA',
0.99,
'RCAAgent',
'{"cause":"Seal failure"}',
'["failure_events","alarm_history"]',
'FortTrace-Llama3',
'v1.2',
471,
196,
1388,
FALSE,
'192.168.30.17',
'Chrome Linux',
'2026-02-18 08:14:53+05:30'
),

(
'SES-20260111-006',
'USR006',
'Maintenance_Engineer',
'Show vibration trend for Tank T-401.',
'en',
'PREDICTIVE',
0.96,
'PredictiveAgent',
'{"trend":"Increasing"}',
'["sensor_data"]',
'FortTrace-Llama3',
'v1.2',
364,
142,
992,
TRUE,
'192.168.10.32',
'Chrome',
'2026-01-11 16:42:13+05:30'
),

(
'SES-20251108-007',
'USR005',
'Quality_Engineer',
'Is Heat Exchanger E-201 due for inspection?',
'en',
'COMPLIANCE',
0.93,
'ComplianceAgent',
'{"inspection_due":true}',
'["inspections"]',
'FortTrace-Llama3',
'v1.2',
319,
125,
914,
FALSE,
'192.168.10.19',
'Chrome',
'2025-11-08 10:44:02+05:30'
),

(
'SES-20250914-008',
'USR003',
'Maintenance_Engineer',
'Explain bearing failure in P-201.',
'en',
'RCA',
0.98,
'RCAAgent',
'{"root_cause":"Lubrication failure"}',
'["failure_events","alarm_history"]',
'FortTrace-Llama3',
'v1.2',
505,
206,
1408,
FALSE,
'192.168.10.18',
'Chrome',
'2025-09-14 12:02:08+05:30'
),

(
'SES-20250824-009',
'USR008',
'Plant_Manager',
'Why is HX-306 efficiency dropping?',
'en',
'PREDICTIVE',
0.96,
'PredictiveAgent',
'{"reason":"Tube fouling"}',
'["failure_events"]',
'FortTrace-Llama3',
'v1.2',
401,
163,
1186,
TRUE,
'192.168.20.25',
'Chrome',
'2025-08-24 10:02:45+05:30'
),

(
'SES-20250409-010',
'USR002',
'Maintenance_Engineer',
'Recommend maintenance for E-201.',
'en',
'GENERAL',
0.91,
'MaintenanceAgent',
'{"recommendation":"Chemical cleaning"}',
'["work_orders"]',
'FortTrace-Llama3',
'v1.2',
382,
151,
1005,
FALSE,
'192.168.10.20',
'Chrome',
'2025-04-09 09:42:51+05:30'
),

(
'SES-20250121-011',
'USR009',
'Plant_Manager',
'Blast furnace cooling alarm history.',
'en',
'GENERAL',
0.95,
'AlarmAgent',
'{"alarms":1}',
'["alarm_history"]',
'FortTrace-Llama3',
'v1.2',
275,
108,
812,
TRUE,
'192.168.30.17',
'Chrome',
'2025-01-21 07:15:26+05:30'
),

(
'SES-20241118-012',
'USR007',
'Safety_Officer',
'Why did PSV-301 open?',
'en',
'RCA',
0.97,
'RCAAgent',
'{"cause":"Pressure spike"}',
'["failure_events","alarm_history"]',
'FortTrace-Llama3',
'v1.2',
361,
147,
932,
FALSE,
'192.168.10.44',
'Firefox',
'2024-11-18 04:02:30+05:30'
),

(
'SES-20240918-013',
'USR011',
'Auditor',
'Show all work orders for refinery heat exchangers.',
'en',
'GENERAL',
0.92,
'QueryAgent',
'{"count":5}',
'["work_orders"]',
'FortTrace-Llama3',
'v1.2',
418,
161,
1102,
FALSE,
'192.168.50.10',
'Chrome',
'2024-09-18 13:22:09+05:30'
),

(
'SES-20240611-014',
'USR001',
'Admin',
'System health report.',
'en',
'GENERAL',
0.90,
'SystemAgent',
'{"status":"Healthy"}',
'["system"]',
'FortTrace-Llama3',
'v1.2',
198,
82,
521,
TRUE,
'192.168.1.2',
'Edge',
'2024-06-11 08:30:00+05:30'
),

(
'SES-20240405-015',
'USR005',
'Quality_Engineer',
'List pending maintenance work orders.',
'en',
'GENERAL',
0.94,
'MaintenanceAgent',
'{"pending":7}',
'["work_orders"]',
'FortTrace-Llama3',
'v1.2',
344,
137,
884,
FALSE,
'192.168.10.17',
'Chrome',
'2024-04-05 14:44:21+05:30'
);

Inserting Engineering Query records

ALTER TABLE engineering_change_record
ALTER COLUMN parent_hash TYPE VARCHAR(128);
ALTER TABLE engineering_change_record
ALTER COLUMN commit_hash TYPE VARCHAR(128);

-- ============================================================
-- FortTrace Seed Data
-- File: 12_engineering_change_record.sql
-- Engineering Change Record (15 Commits)
-- ============================================================

INSERT INTO engineering_change_record
(
    commit_hash,
    parent_hash,
    uat,
    entity_type,
    entity_id,
    action,
    branch,
    previous_state,
    new_state,
    change_reason,
    engineer_id,
    engineer_name,
    approved_by,
    approved_at,
    timestamp
)
VALUES

(
'cmt000001a3f92b1d5e8a71f65d4ab91c1029384756abcdef1234567890abcd',
NULL,
'REF-HTX-R101-001',
'document',
'SOP-R101-REV1',
'CREATE',
'main',
NULL,
'{"revision":"Rev1","status":"draft"}',
'Initial reactor shutdown procedure created.',
'USR002',
'Rajesh Kumar',
'USR001',
'2024-01-15 10:30:00+05:30',
'2024-01-15 09:45:00+05:30'
),

(
'cmt000002f84bcb76deab34981245accc90871234567890abcdef1234567890',
'cmt000001a3f92b1d5e8a71f65d4ab91c1029384756abcdef1234567890abcd',
'REF-HTX-R101-001',
'document',
'SOP-R101-REV2',
'REVISE',
'main',
'{"revision":"Rev1"}',
'{"revision":"Rev2"}',
'Added emergency cooling procedure.',
'USR002',
'Rajesh Kumar',
'USR001',
'2024-08-02 16:20:00+05:30',
'2024-08-02 15:55:00+05:30'
),

(
'cmt0000034fd87d91bcf87d1299987654abcd1234567890abcdef1234567890',
'cmt000002f84bcb76deab34981245accc90871234567890abcdef1234567890',
'REF-HTX-R101-001',
'document',
'SOP-R101-REV3',
'APPROVE',
'main',
'{"status":"under_review"}',
'{"status":"approved"}',
'Final approval after HAZOP review.',
'USR001',
'Amit Verma',
'USR001',
'2025-01-10 11:05:00+05:30',
'2025-01-10 11:00:00+05:30'
),

(
'cmt000004deab91aabbcdd88990011223344556677889900abcdef1234567890',
NULL,
'REF-HTX-E201-001',
'work_order',
'WO-2025-0009',
'CREATE',
'main',
NULL,
'{"status":"open"}',
'Created corrective maintenance work order.',
'USR003',
'Anil Sharma',
'USR002',
'2025-04-12 09:15:00+05:30',
'2025-04-12 09:10:00+05:30'
),

(
'cmt00000511223344556677889900abcdefabcdef1234567890abcdef987654',
'cmt000004deab91aabbcdd88990011223344556677889900abcdef1234567890',
'REF-HTX-E201-001',
'work_order',
'WO-2025-0009',
'VERIFY',
'main',
'{"status":"completed"}',
'{"status":"verified"}',
'Maintenance verified after testing.',
'USR006',
'Vikas Nair',
'USR002',
'2025-04-14 18:30:00+05:30',
'2025-04-14 18:15:00+05:30'
),

(
'cmt000006998877665544332211abcdefabcdefabcdef1234567890abcdef12',
NULL,
'REF-HTX-P201-001',
'asset_config',
'P201-CONFIG',
'APPEND',
'main',
NULL,
'{"bearing":"SKF 6312","lubricant":"Mobil SHC 630"}',
'Updated asset configuration after overhaul.',
'USR003',
'Anil Sharma',
'USR001',
'2025-09-16 14:40:00+05:30',
'2025-09-16 14:25:00+05:30'
),

(
'cmt000007abcdefabcdef1234567890fedcba1122334455667788990011223344',
NULL,
'PET-DIST-C301-001',
'inspection',
'INSP-C301-001',
'CREATE',
'main',
NULL,
'{"inspection":"visual"}',
'Annual compressor inspection.',
'USR004',
'Priya Menon',
'USR001',
'2025-06-18 09:20:00+05:30',
'2025-06-18 09:00:00+05:30'
),

(
'cmt0000082233445566778899abcdefabcdef998877665544332211abcdef1234',
'cmt000007abcdefabcdef1234567890fedcba1122334455667788990011223344',
'PET-DIST-C301-001',
'inspection',
'INSP-C301-001',
'APPROVE',
'main',
'{"status":"under_review"}',
'{"status":"approved"}',
'Inspection approved after QA verification.',
'USR005',
'Neha Singh',
'USR001',
'2025-06-19 15:45:00+05:30',
'2025-06-19 15:20:00+05:30'
),

(
'cmt000009887766554433221100abcdefabcdefabcdef1234567890abcdef55',
NULL,
'PET-POLY-HX306-001',
'work_order',
'WO-2026-0024',
'CREATE',
'main',
NULL,
'{"status":"open"}',
'Created fouling removal work order.',
'USR006',
'Vikas Nair',
'USR002',
'2026-04-01 08:30:00+05:30',
'2026-04-01 08:15:00+05:30'
),

(
'cmt0000101122aabbccddeeff0099887766554433221100abcdefabcdef1234',
'cmt000009887766554433221100abcdefabcdefabcdef1234567890abcdef55',
'PET-POLY-HX306-001',
'work_order',
'WO-2026-0024',
'VERIFY',
'main',
'{"status":"completed"}',
'{"status":"verified"}',
'Performance restored after cleaning.',
'USR006',
'Vikas Nair',
'USR002',
'2026-04-03 16:15:00+05:30',
'2026-04-03 16:00:00+05:30'
),

(
'cmt00001144556677889900abcdefabcdefabcdef1234123412341234123412',
NULL,
'STL-BF-BF201-001',
'asset_config',
'BF201-CONFIG',
'APPEND',
'main',
NULL,
'{"cooling_headers":"replaced"}',
'Cooling headers upgraded.',
'USR009',
'Suresh Iyer',
'USR001',
'2025-02-05 10:10:00+05:30',
'2025-02-05 09:55:00+05:30'
),

(
'cmt0000129988aabbccddeeff7766554433221100abcdefabcdef1122334455',
NULL,
'STL-HYD-P401-001',
'work_order',
'WO-2026-0028',
'CREATE',
'main',
NULL,
'{"status":"open"}',
'Hydraulic seal replacement initiated.',
'USR010',
'Arvind Rao',
'USR002',
'2026-02-18 04:10:00+05:30',
'2026-02-18 04:00:00+05:30'
),

(
'cmt000013abcdefabcdefabcdef123456789011223344556677889900abcdef',
'cmt0000129988aabbccddeeff7766554433221100abcdefabcdef1122334455',
'STL-HYD-P401-001',
'work_order',
'WO-2026-0028',
'VERIFY',
'main',
'{"status":"completed"}',
'{"status":"verified"}',
'Hydraulic pressure restored successfully.',
'USR010',
'Arvind Rao',
'USR002',
'2026-02-18 18:40:00+05:30',
'2026-02-18 18:30:00+05:30'
),

(
'cmt000014a1b2c3d4e5f678901234567890abcdefabcdefabcdefabcdefabcd',
NULL,
'STL-RM-RM101-001',
'document',
'GEARBOX-MANUAL',
'CREATE',
'main',
NULL,
'{"revision":"Rev1"}',
'Added gearbox maintenance manual.',
'USR011',
'Mahesh Kulkarni',
'USR001',
'2024-03-20 13:30:00+05:30',
'2024-03-20 13:15:00+05:30'
),

(
'cmt000015ffeeddccbbaa99887766554433221100abcdefabcdef1234567890',
'cmt000014a1b2c3d4e5f678901234567890abcdefabcdefabcdefabcdefabcd',
'STL-RM-RM101-001',
'document',
'GEARBOX-MANUAL',
'SUPERSEDE',
'main',
'{"revision":"Rev1"}',
'{"revision":"Rev2"}',
'Updated lubrication schedule after OEM recommendation.',
'USR011',
'Mahesh Kulkarni',
'USR001',
'2025-03-28 12:10:00+05:30',
'2025-03-28 11:55:00+05:30'
);

Inserting Documents

-- ============================================================
-- documents_part_1A.sql
-- REF Plant Master Documents
-- Assets:
--   REF-HTX-R101-001
--   REF-HTX-E201-001
--
-- Documents:
--   SOP
--   OEM Manual
--   P&ID
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- R-101 SOP
-- ============================================================

(
'10000000-0000-0000-0000-000000000001',
'REF-HTX-R101-001',
'SOP',
'Reactor R-101 Standard Operating Procedure',
'sops/REF-HTX-R101-001/SOP_R101_Rev3.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1001',
3245821,
'application/pdf',
'Rev3',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','OISD_144','ISO_9001'],
'approved',
'USR001',
'2025-12-15 10:30:00+05:30',
'2026-01-01',
'2029-12-31',
NULL,
'c100000000000000000000000000000000000000000000000000000000000001',
'USR002'
),

-- OEM Manual

(
'10000000-0000-0000-0000-000000000002',
'REF-HTX-R101-001',
'OEM_MANUAL',
'Larsen & Toubro Reactor R-101 OEM Manual',
'manuals/REF-HTX-R101-001/OEM_R101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1002',
11842562,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-05-18 14:00:00+05:30',
'2025-06-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000002',
'USR010'
),

-- P&ID

(
'10000000-0000-0000-0000-000000000003',
'REF-HTX-R101-001',
'P&ID',
'Process & Instrumentation Diagram - Reactor R-101',
'pids/REF-HTX-R101-001/PID_R101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1003',
5487291,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-08-20 09:15:00+05:30',
'2025-09-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000003',
'USR001'
),

-- ============================================================
-- E-201 SOP
-- ============================================================

(
'10000000-0000-0000-0000-000000000004',
'REF-HTX-E201-001',
'SOP',
'Heat Exchanger E-201 Operating Procedure',
'sops/REF-HTX-E201-001/SOP_E201_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1004',
2983214,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-07-10 11:45:00+05:30',
'2025-08-01',
'2028-08-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000004',
'USR002'
),

-- OEM Manual

(
'10000000-0000-0000-0000-000000000005',
'REF-HTX-E201-001',
'OEM_MANUAL',
'Alfa Laval Heat Exchanger E-201 OEM Manual',
'manuals/REF-HTX-E201-001/OEM_E201_Rev1.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1005',
13784211,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-11-18 10:00:00+05:30',
'2024-12-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000005',
'USR010'
),

-- P&ID

(
'10000000-0000-0000-0000-000000000006',
'REF-HTX-E201-001',
'P&ID',
'Heat Exchanger E-201 Process & Instrumentation Diagram',
'pids/REF-HTX-E201-001/PID_E201_Rev3.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1006',
4875210,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2026-01-10 09:30:00+05:30',
'2026-01-15',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000006',
'USR001'
);

-- ============================================================
-- documents_part_1B.sql
-- REF Plant Master Documents
-- Assets:
--   REF-HTX-P201-001
--   REF-HTX-V301-001
--
-- Documents:
--   SOP
--   OEM Manual
--   P&ID
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- P-201 SOP
-- ============================================================

(
'10000000-0000-0000-0000-000000000007',
'REF-HTX-P201-001',
'SOP',
'Process Pump P-201 Standard Operating Procedure',
'sops/REF-HTX-P201-001/SOP_P201_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1007',
2845128,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-06-18 09:20:00+05:30',
'2025-07-01',
'2028-07-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000007',
'USR002'
),

(
'10000000-0000-0000-0000-000000000008',
'REF-HTX-P201-001',
'OEM_MANUAL',
'KSB Process Pump P-201 OEM Manual',
'manuals/REF-HTX-P201-001/OEM_P201_Rev3.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1008',
9524814,
'application/pdf',
'Rev3',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-04-08 14:00:00+05:30',
'2025-05-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000008',
'USR010'
),

(
'10000000-0000-0000-0000-000000000009',
'REF-HTX-P201-001',
'P&ID',
'Pump P-201 Process & Instrumentation Diagram',
'pids/REF-HTX-P201-001/PID_P201_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1009',
4638124,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144'],
'approved',
'USR001',
'2025-08-12 11:00:00+05:30',
'2025-08-20',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000009',
'USR001'
),

-- ============================================================
-- V-301 SOP
-- ============================================================

(
'10000000-0000-0000-0000-000000000010',
'REF-HTX-V301-001',
'SOP',
'Pressure Vessel V-301 Operating Procedure',
'sops/REF-HTX-V301-001/SOP_V301_Rev1.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1010',
2963258,
'application/pdf',
'Rev1',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','PESO'],
'approved',
'USR001',
'2025-02-14 08:45:00+05:30',
'2025-03-01',
'2028-03-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000010',
'USR003'
),

(
'10000000-0000-0000-0000-000000000011',
'REF-HTX-V301-001',
'OEM_MANUAL',
'Pressure Vessel V-301 OEM Manual',
'manuals/REF-HTX-V301-001/OEM_V301_Rev1.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1011',
8743654,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-10 10:10:00+05:30',
'2025-01-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000011',
'USR010'
),

(
'10000000-0000-0000-0000-000000000012',
'REF-HTX-V301-001',
'P&ID',
'Pressure Vessel V-301 Process & Instrumentation Diagram',
'pids/REF-HTX-V301-001/PID_V301_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1012',
4256812,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-09-02 15:10:00+05:30',
'2025-09-15',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000012',
'USR001'
);

-- ============================================================
-- documents_part_1C.sql
-- REF Plant Master Documents
-- Assets:
--   REF-HTX-T401-001
--   REF-UTIL-B101-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- T-401
-- ============================================================

(
'10000000-0000-0000-0000-000000000013',
'REF-HTX-T401-001',
'SOP',
'Agitator Tank T-401 Standard Operating Procedure',
'sops/REF-HTX-T401-001/SOP_T401_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1013',
3154821,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-05-12 09:10:00+05:30',
'2025-06-01',
'2028-06-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000013',
'USR002'
),

(
'10000000-0000-0000-0000-000000000014',
'REF-HTX-T401-001',
'OEM_MANUAL',
'Agitator Tank T-401 OEM Manual',
'manuals/REF-HTX-T401-001/OEM_T401_Rev1.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1014',
9634820,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-11-28 14:20:00+05:30',
'2024-12-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000014',
'USR010'
),

(
'10000000-0000-0000-0000-000000000015',
'REF-HTX-T401-001',
'P&ID',
'Process & Instrumentation Diagram - Tank T-401',
'pids/REF-HTX-T401-001/PID_T401_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1015',
5012340,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-09-15 10:30:00+05:30',
'2025-10-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000015',
'USR001'
),

-- ============================================================
-- B-101
-- ============================================================

(
'10000000-0000-0000-0000-000000000016',
'REF-UTIL-B101-001',
'SOP',
'Boiler B-101 Operating Procedure',
'sops/REF-UTIL-B101-001/SOP_B101_Rev3.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1016',
3289015,
'application/pdf',
'Rev3',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','PESO','ISO_9001'],
'approved',
'USR001',
'2025-08-10 11:20:00+05:30',
'2025-09-01',
'2028-09-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000016',
'USR003'
),

(
'10000000-0000-0000-0000-000000000017',
'REF-UTIL-B101-001',
'OEM_MANUAL',
'Thermax Boiler B-101 OEM Manual',
'manuals/REF-UTIL-B101-001/OEM_B101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1017',
15482362,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-02-01 15:45:00+05:30',
'2025-03-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000017',
'USR010'
),

(
'10000000-0000-0000-0000-000000000018',
'REF-UTIL-B101-001',
'P&ID',
'Boiler B-101 Process & Instrumentation Diagram',
'pids/REF-UTIL-B101-001/PID_B101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1018',
5184563,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','PESO'],
'approved',
'USR001',
'2025-10-01 09:00:00+05:30',
'2025-10-15',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000018',
'USR001'
);
-- ============================================================
-- documents_part_1D.sql
-- REF Plant Master Documents
-- Assets:
--   REF-UTIL-C101-001
--   REF-UTIL-CW101-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- C-101 AIR COMPRESSOR
-- ============================================================

(
'10000000-0000-0000-0000-000000000019',
'REF-UTIL-C101-001',
'SOP',
'Air Compressor C-101 Standard Operating Procedure',
'sops/REF-UTIL-C101-001/SOP_C101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1019',
3021847,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-04-12 09:30:00+05:30',
'2025-05-01',
'2028-05-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000019',
'USR002'
),

(
'10000000-0000-0000-0000-000000000020',
'REF-UTIL-C101-001',
'OEM_MANUAL',
'Atlas Copco Air Compressor C-101 OEM Manual',
'manuals/REF-UTIL-C101-001/OEM_C101_Rev1.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1020',
12384521,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-11-18 11:45:00+05:30',
'2024-12-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000020',
'USR010'
),

(
'10000000-0000-0000-0000-000000000021',
'REF-UTIL-C101-001',
'P&ID',
'Compressed Air System P&ID - C-101',
'pids/REF-UTIL-C101-001/PID_C101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1021',
4876120,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','PESO'],
'approved',
'USR001',
'2025-09-15 14:20:00+05:30',
'2025-10-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000021',
'USR001'
),

-- ============================================================
-- CW-101 COOLING WATER PUMP
-- ============================================================

(
'10000000-0000-0000-0000-000000000022',
'REF-UTIL-CW101-001',
'SOP',
'Cooling Water Pump CW-101 Operating Procedure',
'sops/REF-UTIL-CW101-001/SOP_CW101_Rev3.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1022',
3116520,
'application/pdf',
'Rev3',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','OISD_144','ISO_9001'],
'approved',
'USR001',
'2025-10-20 08:30:00+05:30',
'2025-11-01',
'2028-11-01',
NULL,
'c100000000000000000000000000000000000000000000000000000000000022',
'USR003'
),

(
'10000000-0000-0000-0000-000000000023',
'REF-UTIL-CW101-001',
'OEM_MANUAL',
'Kirloskar Cooling Water Pump CW-101 OEM Manual',
'manuals/REF-UTIL-CW101-001/OEM_CW101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1023',
10248763,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-03-10 13:00:00+05:30',
'2025-04-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000023',
'USR010'
),

(
'10000000-0000-0000-0000-000000000024',
'REF-UTIL-CW101-001',
'P&ID',
'Cooling Water Distribution P&ID - CW-101',
'pids/REF-UTIL-CW101-001/PID_CW101_Rev2.pdf',
'7f1f3dd48bc4a725d6db57d8f676b3d568a22f81d4d1bcfd3d7cf1f4d4ab1024',
4923560,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-11-15 10:45:00+05:30',
'2025-12-01',
NULL,
NULL,
'c100000000000000000000000000000000000000000000000000000000000024',
'USR001'
);
-- ============================================================
-- documents_part_2A.sql
-- PET Plant Master Documents
-- Assets:
--   PET-DIST-C301-001
--   PET-DIST-P302-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- C-301 DISTILLATION COMPRESSOR
-- ============================================================

(
'10000000-0000-0000-0000-000000000025',
'PET-DIST-C301-001',
'SOP',
'Distillation Compressor C-301 Standard Operating Procedure',
'sops/PET-DIST-C301-001/SOP_C301_Rev3.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000025',
3185420,
'application/pdf',
'Rev3',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','OISD_144','ISO_9001'],
'approved',
'USR001',
'2025-08-15 09:15:00+05:30',
'2025-09-01',
'2028-09-01',
NULL,
'c200000000000000000000000000000000000000000000000000000000000025',
'USR002'
),

(
'10000000-0000-0000-0000-000000000026',
'PET-DIST-C301-001',
'OEM_MANUAL',
'Siemens Compressor C-301 OEM Manual',
'manuals/PET-DIST-C301-001/OEM_C301_Rev2.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000026',
13248764,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-03-21 14:20:00+05:30',
'2025-04-01',
NULL,
NULL,
'c200000000000000000000000000000000000000000000000000000000000026',
'USR010'
),

(
'10000000-0000-0000-0000-000000000027',
'PET-DIST-C301-001',
'P&ID',
'Distillation Compressor C-301 Process & Instrumentation Diagram',
'pids/PET-DIST-C301-001/PID_C301_Rev2.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000027',
5218452,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','PESO'],
'approved',
'USR001',
'2025-10-10 10:30:00+05:30',
'2025-10-15',
NULL,
NULL,
'c200000000000000000000000000000000000000000000000000000000000027',
'USR001'
),

-- ============================================================
-- P-302 FEED PUMP
-- ============================================================

(
'10000000-0000-0000-0000-000000000028',
'PET-DIST-P302-001',
'SOP',
'Feed Pump P-302 Standard Operating Procedure',
'sops/PET-DIST-P302-001/SOP_P302_Rev2.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000028',
2956214,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-06-05 08:45:00+05:30',
'2025-07-01',
'2028-07-01',
NULL,
'c200000000000000000000000000000000000000000000000000000000000028',
'USR002'
),

(
'10000000-0000-0000-0000-000000000029',
'PET-DIST-P302-001',
'OEM_MANUAL',
'KSB Feed Pump P-302 OEM Manual',
'manuals/PET-DIST-P302-001/OEM_P302_Rev1.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000029',
9548321,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-18 11:00:00+05:30',
'2025-01-01',
NULL,
NULL,
'c200000000000000000000000000000000000000000000000000000000000029',
'USR010'
),

(
'10000000-0000-0000-0000-000000000030',
'PET-DIST-P302-001',
'P&ID',
'Feed Pump P-302 Process & Instrumentation Diagram',
'pids/PET-DIST-P302-001/PID_P302_Rev3.pdf',
'8e2f3ac9d8e417e22b81bc2dd84296fd8e481be61ef8aaf9d4427f18ab000030',
4823654,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2026-01-05 09:45:00+05:30',
'2026-01-15',
NULL,
NULL,
'c200000000000000000000000000000000000000000000000000000000000030',
'USR001'
);
-- ============================================================
-- documents_part_2B.sql
-- PET Plant Master Documents
-- Assets:
--   PET-DIST-E303-001
--   PET-POLY-T305-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- E-303 DISTILLATION HEAT EXCHANGER
-- ============================================================

(
'10000000-0000-0000-0000-000000000031',
'PET-DIST-E303-001',
'SOP',
'Heat Exchanger E-303 Standard Operating Procedure',
'sops/PET-DIST-E303-001/SOP_E303_Rev2.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000031',
3098425,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-05-20 09:00:00+05:30',
'2025-06-01',
'2028-06-01',
NULL,
'c300000000000000000000000000000000000000000000000000000000000031',
'USR002'
),

(
'10000000-0000-0000-0000-000000000032',
'PET-DIST-E303-001',
'OEM_MANUAL',
'Alfa Laval Heat Exchanger E-303 OEM Manual',
'manuals/PET-DIST-E303-001/OEM_E303_Rev2.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000032',
11458763,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-01-18 10:30:00+05:30',
'2025-02-01',
NULL,
NULL,
'c300000000000000000000000000000000000000000000000000000000000032',
'USR010'
),

(
'10000000-0000-0000-0000-000000000033',
'PET-DIST-E303-001',
'P&ID',
'Heat Exchanger E-303 Process & Instrumentation Diagram',
'pids/PET-DIST-E303-001/PID_E303_Rev3.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000033',
4932168,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-11-05 15:00:00+05:30',
'2025-11-15',
NULL,
NULL,
'c300000000000000000000000000000000000000000000000000000000000033',
'USR001'
),

-- ============================================================
-- T-305 POLYMERIZATION REACTOR
-- ============================================================

(
'10000000-0000-0000-0000-000000000034',
'PET-POLY-T305-001',
'SOP',
'Polymerization Reactor T-305 Operating Procedure',
'sops/PET-POLY-T305-001/SOP_T305_Rev3.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000034',
3210456,
'application/pdf',
'Rev3',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','OISD_144','ISO_9001'],
'approved',
'USR001',
'2025-09-15 09:45:00+05:30',
'2025-10-01',
'2028-10-01',
NULL,
'c300000000000000000000000000000000000000000000000000000000000034',
'USR002'
),

(
'10000000-0000-0000-0000-000000000035',
'PET-POLY-T305-001',
'OEM_MANUAL',
'Larsen & Toubro Reactor T-305 OEM Manual',
'manuals/PET-POLY-T305-001/OEM_T305_Rev1.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000035',
12896324,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-15 14:15:00+05:30',
'2025-01-01',
NULL,
NULL,
'c300000000000000000000000000000000000000000000000000000000000035',
'USR010'
),

(
'10000000-0000-0000-0000-000000000036',
'PET-POLY-T305-001',
'P&ID',
'Polymerization Reactor T-305 Process & Instrumentation Diagram',
'pids/PET-POLY-T305-001/PID_T305_Rev2.pdf',
'9c3b4de9bfc812a781c8a432c9ef7f2ab91e7cb713d7d1848a102a8be1000036',
5142879,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','PESO'],
'approved',
'USR001',
'2025-10-10 10:20:00+05:30',
'2025-10-20',
NULL,
NULL,
'c300000000000000000000000000000000000000000000000000000000000036',
'USR001'
);
-- ============================================================
-- documents_part_2C.sql
-- PET Plant Master Documents
-- Assets:
--   PET-POLY-HX306-001
--   PET-POLY-TK307-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- HX-306 POLYMER COOLER
-- ============================================================

(
'10000000-0000-0000-0000-000000000037',
'PET-POLY-HX306-001',
'SOP',
'Polymer Cooler HX-306 Standard Operating Procedure',
'sops/PET-POLY-HX306-001/SOP_HX306_Rev2.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000037',
3062487,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-07-18 09:20:00+05:30',
'2025-08-01',
'2028-08-01',
NULL,
'c400000000000000000000000000000000000000000000000000000000000037',
'USR002'
),

(
'10000000-0000-0000-0000-000000000038',
'PET-POLY-HX306-001',
'OEM_MANUAL',
'Alfa Laval Polymer Cooler HX-306 OEM Manual',
'manuals/PET-POLY-HX306-001/OEM_HX306_Rev1.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000038',
11752841,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-01-25 11:10:00+05:30',
'2025-02-01',
NULL,
NULL,
'c400000000000000000000000000000000000000000000000000000000000038',
'USR010'
),

(
'10000000-0000-0000-0000-000000000039',
'PET-POLY-HX306-001',
'P&ID',
'Polymer Cooler HX-306 Process & Instrumentation Diagram',
'pids/PET-POLY-HX306-001/PID_HX306_Rev3.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000039',
4982631,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','PESO'],
'approved',
'USR001',
'2025-12-05 10:45:00+05:30',
'2025-12-15',
NULL,
NULL,
'c400000000000000000000000000000000000000000000000000000000000039',
'USR001'
),

-- ============================================================
-- TK-307 PRODUCT STORAGE TANK
-- ============================================================

(
'10000000-0000-0000-0000-000000000040',
'PET-POLY-TK307-001',
'SOP',
'Product Storage Tank TK-307 Operating Procedure',
'sops/PET-POLY-TK307-001/SOP_TK307_Rev2.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000040',
2986542,
'application/pdf',
'Rev2',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','PESO','ISO_9001'],
'approved',
'USR001',
'2025-06-12 09:40:00+05:30',
'2025-07-01',
'2028-07-01',
NULL,
'c400000000000000000000000000000000000000000000000000000000000040',
'USR003'
),

(
'10000000-0000-0000-0000-000000000041',
'PET-POLY-TK307-001',
'OEM_MANUAL',
'Storage Tank TK-307 OEM Inspection & Maintenance Manual',
'manuals/PET-POLY-TK307-001/OEM_TK307_Rev1.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000041',
8649123,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-05 13:15:00+05:30',
'2025-01-01',
NULL,
NULL,
'c400000000000000000000000000000000000000000000000000000000000041',
'USR010'
),

(
'10000000-0000-0000-0000-000000000042',
'PET-POLY-TK307-001',
'P&ID',
'Product Storage System TK-307 P&ID',
'pids/PET-POLY-TK307-001/PID_TK307_Rev2.pdf',
'bf6aa16d9d12bb8f80d08a4abf6930e8c63bd0d8634cb868ffab45ce10000042',
4863754,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','PESO','OISD_144'],
'approved',
'USR001',
'2025-11-18 14:30:00+05:30',
'2025-12-01',
NULL,
NULL,
'c400000000000000000000000000000000000000000000000000000000000042',
'USR001'
);
-- ============================================================
-- documents_part_2D.sql
-- PET Plant Master Documents
-- Asset:
--   PET-POLY-P308-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- P-308 POLYMER TRANSFER PUMP
-- ============================================================

(
'10000000-0000-0000-0000-000000000043',
'PET-DIST-V304-001',
'SOP',
'Polymer Transfer Pump P-308 Standard Operating Procedure',
'sops/PET-POLY-P308-001/SOP_P308_Rev2.pdf',
'ce87dfe92aaeb8c6515f7f06b9a04c54269f4a3d44f4d7383d85b97c00000043',
3012584,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-07-10 09:15:00+05:30',
'2025-08-01',
'2028-08-01',
NULL,
'c500000000000000000000000000000000000000000000000000000000000043',
'USR002'
),

(
'10000000-0000-0000-0000-000000000044',
'PET-DIST-V304-001',
'OEM_MANUAL',
'KSB Polymer Transfer Pump P-308 OEM Manual',
'manuals/PET-POLY-P308-001/OEM_P308_Rev1.pdf',
'ce87dfe92aaeb8c6515f7f06b9a04c54269f4a3d44f4d7383d85b97c00000044',
9784215,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-08 11:00:00+05:30',
'2025-01-01',
NULL,
NULL,
'c500000000000000000000000000000000000000000000000000000000000044',
'USR010'
),

(
'10000000-0000-0000-0000-000000000045',
'PET-DIST-V304-001',
'P&ID',
'Polymer Transfer Pump P-308 Process & Instrumentation Diagram',
'pids/PET-POLY-P308-001/PID_P308_Rev3.pdf',
'ce87dfe92aaeb8c6515f7f06b9a04c54269f4a3d44f4d7383d85b97c00000045',
4952163,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_144','PESO'],
'approved',
'USR001',
'2025-12-05 15:10:00+05:30',
'2025-12-15',
NULL,
NULL,
'c500000000000000000000000000000000000000000000000000000000000045',
'USR001'
);
-- ============================================================
-- documents_part_3A.sql
-- STEEL Plant Master Documents
-- Assets:
--   STL-RM-RM101-001
--   STL-BF-BF201-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- RM-101 RAW MATERIAL CRUSHER
-- ============================================================

(
'10000000-0000-0000-0000-000000000046',
'STL-RM-RM101-001',
'SOP',
'Raw Material Crusher RM-101 Standard Operating Procedure',
'sops/STL-RM-RM101-001/SOP_RM101_Rev2.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000046',
3145826,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-05-15 09:20:00+05:30',
'2025-06-01',
'2028-06-01',
NULL,
'c600000000000000000000000000000000000000000000000000000000000046',
'USR002'
),

(
'10000000-0000-0000-0000-000000000047',
'STL-RM-RM101-001',
'OEM_MANUAL',
'FLSmidth RM-101 Crusher OEM Manual',
'manuals/STL-RM-RM101-001/OEM_RM101_Rev1.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000047',
11635842,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2024-12-18 11:30:00+05:30',
'2025-01-01',
NULL,
NULL,
'c600000000000000000000000000000000000000000000000000000000000047',
'USR010'
),

(
'10000000-0000-0000-0000-000000000048',
'STL-RM-RM101-001',
'P&ID',
'Raw Material Handling RM-101 Process & Instrumentation Diagram',
'pids/STL-RM-RM101-001/PID_RM101_Rev2.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000048',
5026318,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','OISD_117','ISO_9001'],
'approved',
'USR001',
'2025-10-12 10:15:00+05:30',
'2025-11-01',
NULL,
NULL,
'c600000000000000000000000000000000000000000000000000000000000048',
'USR001'
),

-- ============================================================
-- BF-201 BLAST FURNACE
-- ============================================================

(
'10000000-0000-0000-0000-000000000049',
'STL-BF-BF201-001',
'SOP',
'Blast Furnace BF-201 Standard Operating Procedure',
'sops/STL-BF-BF201-001/SOP_BF201_Rev3.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000049',
3326158,
'application/pdf',
'Rev3',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','ISO_9001','OISD_144'],
'approved',
'USR001',
'2025-08-20 08:40:00+05:30',
'2025-09-01',
'2028-09-01',
NULL,
'c600000000000000000000000000000000000000000000000000000000000049',
'USR003'
),

(
'10000000-0000-0000-0000-000000000050',
'STL-BF-BF201-001',
'OEM_MANUAL',
'Danieli Blast Furnace BF-201 OEM Manual',
'manuals/STL-BF-BF201-001/OEM_BF201_Rev2.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000050',
14523691,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-02-18 14:25:00+05:30',
'2025-03-01',
NULL,
NULL,
'c600000000000000000000000000000000000000000000000000000000000050',
'USR010'
),

(
'10000000-0000-0000-0000-000000000051',
'STL-BF-BF201-001',
'P&ID',
'Blast Furnace BF-201 Process & Instrumentation Diagram',
'pids/STL-BF-BF201-001/PID_BF201_Rev3.pdf',
'dd8138a145b28a873cd9a781d128bd5bc74fe95b637f84bc4f18baf100000051',
5214572,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','PESO','ISO_9001'],
'approved',
'USR001',
'2025-11-15 09:50:00+05:30',
'2025-12-01',
NULL,
NULL,
'c600000000000000000000000000000000000000000000000000000000000051',
'USR001'
);
-- ============================================================
-- documents_part_3B.sql
-- STEEL Plant Master Documents
-- Assets:
--   STL-CCM-CCM301-001
--   STL-HYD-P401-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- CCM-301 CONTINUOUS CASTING MACHINE
-- ============================================================

(
'10000000-0000-0000-0000-000000000052',
'STL-CCM-CCM301-001',
'SOP',
'Continuous Casting Machine CCM-301 Operating Procedure',
'sops/STL-CCM-CCM301-001/SOP_CCM301_Rev3.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000052',
3261547,
'application/pdf',
'Rev3',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001','OISD_144'],
'approved',
'USR001',
'2025-08-18 09:30:00+05:30',
'2025-09-01',
'2028-09-01',
NULL,
'c700000000000000000000000000000000000000000000000000000000000052',
'USR002'
),

(
'10000000-0000-0000-0000-000000000053',
'STL-CCM-CCM301-001',
'OEM_MANUAL',
'Danieli CCM-301 OEM Operation and Maintenance Manual',
'manuals/STL-CCM-CCM301-001/OEM_CCM301_Rev2.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000053',
15423876,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-02-18 13:45:00+05:30',
'2025-03-01',
NULL,
NULL,
'c700000000000000000000000000000000000000000000000000000000000053',
'USR010'
),

(
'10000000-0000-0000-0000-000000000054',
'STL-CCM-CCM301-001',
'P&ID',
'Continuous Casting Machine CCM-301 P&ID',
'pids/STL-CCM-CCM301-001/PID_CCM301_Rev2.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000054',
5348125,
'application/pdf',
'Rev2',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','ISO_9001','PESO'],
'approved',
'USR001',
'2025-10-22 10:20:00+05:30',
'2025-11-01',
NULL,
NULL,
'c700000000000000000000000000000000000000000000000000000000000054',
'USR001'
),

-- ============================================================
-- P-401 HYDRAULIC POWER UNIT
-- ============================================================

(
'10000000-0000-0000-0000-000000000055',
'STL-HYD-P401-001',
'SOP',
'Hydraulic Power Unit P-401 Standard Operating Procedure',
'sops/STL-HYD-P401-001/SOP_P401_Rev2.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000055',
3024861,
'application/pdf',
'Rev2',
'USR002',
'Maintenance_Engineer',
ARRAY['Factory_Act_1948','ISO_9001'],
'approved',
'USR001',
'2025-05-14 08:45:00+05:30',
'2025-06-01',
'2028-06-01',
NULL,
'c700000000000000000000000000000000000000000000000000000000000055',
'USR002'
),

(
'10000000-0000-0000-0000-000000000056',
'STL-HYD-P401-001',
'OEM_MANUAL',
'Bosch Rexroth Hydraulic Power Unit P-401 OEM Manual',
'manuals/STL-HYD-P401-001/OEM_P401_Rev1.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000056',
10823647,
'application/pdf',
'Rev1',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-01-12 11:15:00+05:30',
'2025-02-01',
NULL,
NULL,
'c700000000000000000000000000000000000000000000000000000000000056',
'USR010'
),

(
'10000000-0000-0000-0000-000000000057',
'STL-HYD-P401-001',
'P&ID',
'Hydraulic Power Unit P-401 P&ID',
'pids/STL-HYD-P401-001/PID_P401_Rev3.pdf',
'ef37b80b7e11df2c3f40e38a40dd4d5b8874be98d46bda1cf4d9e76f00000057',
4876539,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','ISO_9001','PESO'],
'approved',
'USR001',
'2025-11-08 09:10:00+05:30',
'2025-12-01',
NULL,
NULL,
'c700000000000000000000000000000000000000000000000000000000000057',
'USR001'
);
-- ============================================================
-- documents_part_3C.sql
-- STEEL Plant Master Documents
-- Asset:
--   STL-UTIL-CT501-001
-- ============================================================

INSERT INTO documents
(
    doc_id,
    uat,
    doc_type,
    title,
    file_path,
    file_hash,
    file_size_bytes,
    mime_type,
    revision,
    author_id,
    author_role,
    compliance_scope,
    review_status,
    approved_by,
    approved_at,
    effective_date,
    expiry_date,
    parent_doc_id,
    commit_hash,
    uploaded_by
)
VALUES

-- ============================================================
-- CT-501 COOLING TOWER
-- ============================================================

(
'10000000-0000-0000-0000-000000000058',
'STL-UTIL-CT501-001',
'SOP',
'Cooling Tower CT-501 Standard Operating Procedure',
'sops/STL-UTIL-CT501-001/SOP_CT501_Rev3.pdf',
'f184de75cb0b61c04fd5148b32c4eac75b5f08937ec1d19cb6c489d100000058',
3158421,
'application/pdf',
'Rev3',
'USR003',
'Safety_Officer',
ARRAY['Factory_Act_1948','ISO_9001','OISD_144'],
'approved',
'USR001',
'2025-08-25 09:10:00+05:30',
'2025-09-01',
'2028-09-01',
NULL,
'c800000000000000000000000000000000000000000000000000000000000058',
'USR003'
),

(
'10000000-0000-0000-0000-000000000059',
'STL-UTIL-CT501-001',
'OEM_MANUAL',
'SPX Cooling Tower CT-501 OEM Operation & Maintenance Manual',
'manuals/STL-UTIL-CT501-001/OEM_CT501_Rev2.pdf',
'f184de75cb0b61c04fd5148b32c4eac75b5f08937ec1d19cb6c489d100000059',
11984653,
'application/pdf',
'Rev2',
'USR010',
'OEM_Rep',
ARRAY['ISO_9001'],
'approved',
'USR001',
'2025-02-08 14:30:00+05:30',
'2025-03-01',
NULL,
NULL,
'c800000000000000000000000000000000000000000000000000000000000059',
'USR010'
),

(
'10000000-0000-0000-0000-000000000060',
'STL-UTIL-CT501-001',
'P&ID',
'Cooling Water System CT-501 Process & Instrumentation Diagram',
'pids/STL-UTIL-CT501-001/PID_CT501_Rev3.pdf',
'f184de75cb0b61c04fd5148b32c4eac75b5f08937ec1d19cb6c489d100000060',
5067318,
'application/pdf',
'Rev3',
'USR001',
'Plant_Manager',
ARRAY['Factory_Act_1948','ISO_9001','PESO'],
'approved',
'USR001',
'2025-11-20 10:15:00+05:30',
'2025-12-01',
NULL,
NULL,
'c800000000000000000000000000000000000000000000000000000000000060',
'USR001'
);

Inserting Compliance records

-- ============================================================
-- compliance_records.sql
-- PART 1 : REFINERY PLANT (REF)
-- ============================================================

INSERT INTO compliance_records
(
    record_id,
    uat,
    regulation,
    requirement_clause,
    requirement_description,
    current_status,
    evidence_doc_id,
    last_audit_date,
    next_audit_due,
    auditor_id,
    auditor_org,
    findings,
    corrective_action_required,
    capa_status,
    risk_rating
)
VALUES

-- Reactor R-101
(
'20000000-0000-0000-0000-000000000001',
'REF-HTX-R101-001',
'Factory_Act_1948',
'Section_21',
'Pressure vessel safety inspection and operating procedure compliance.',
'compliant',
'10000000-0000-0000-0000-000000000001',
'2025-11-15',
'2026-11-15',
'AUD001',
'DNV India',
'All statutory safety requirements satisfied.',
'None',
'Closed',
'low'
),

(
'20000000-0000-0000-0000-000000000002',
'REF-HTX-R101-001',
'OISD_144',
'Clause_5.2',
'Annual reactor maintenance documentation.',
'partially_compliant',
'10000000-0000-0000-0000-000000000003',
'2026-02-10',
'2027-02-10',
'AUD002',
'Indian Oil Internal Audit',
'Maintenance interval exceeded by 5 days.',
'Revise PM schedule.',
'Open',
'medium'
),

-- Heat Exchanger
(
'20000000-0000-0000-0000-000000000003',
'REF-HTX-E201-001',
'ISO_9001',
'Clause_8.5',
'Equipment maintenance documentation.',
'compliant',
'10000000-0000-0000-0000-000000000004',
'2025-09-18',
'2026-09-18',
'AUD003',
'Bureau Veritas',
'Documentation complete.',
'None',
'Closed',
'low'
),

-- Pump
(
'20000000-0000-0000-0000-000000000004',
'REF-HTX-P201-001',
'OISD_117',
'Clause_6.3',
'Rotating equipment inspection.',
'non_compliant',
'10000000-0000-0000-0000-000000000007',
'2026-01-08',
'2027-01-08',
'AUD004',
'HPCL Audit',
'Bearing vibration exceeded allowable limits.',
'Bearing replacement required.',
'In Progress',
'high'
),

-- Pressure Vessel
(
'20000000-0000-0000-0000-000000000005',
'REF-HTX-V301-001',
'PESO',
'PV-Inspection',
'Pressure vessel certification.',
'compliant',
'10000000-0000-0000-0000-000000000010',
'2025-08-21',
'2026-08-21',
'AUD005',
'PESO',
'Certification valid.',
'None',
'Closed',
'low'
),

-- Tank
(
'20000000-0000-0000-0000-000000000006',
'REF-HTX-T401-001',
'ISO_14001',
'Clause_7.4',
'Chemical containment verification.',
'compliant',
'10000000-0000-0000-0000-000000000013',
'2026-03-12',
'2027-03-12',
'AUD006',
'SGS India',
'Secondary containment verified.',
'None',
'Closed',
'low'
),

-- Boiler
(
'20000000-0000-0000-0000-000000000007',
'REF-UTIL-B101-001',
'Factory_Act_1948',
'Boiler Rules',
'Boiler statutory inspection.',
'compliant',
'10000000-0000-0000-0000-000000000016',
'2025-10-01',
'2026-10-01',
'AUD007',
'State Boiler Inspector',
'Boiler passed inspection.',
'None',
'Closed',
'low'
),

-- Air Compressor
(
'20000000-0000-0000-0000-000000000008',
'REF-UTIL-C101-001',
'ISO_9001',
'Clause_8.7',
'Compressed air quality management.',
'partially_compliant',
'10000000-0000-0000-0000-000000000019',
'2026-04-08',
'2027-04-08',
'AUD008',
'TUV India',
'Filter replacement overdue.',
'Replace air filter cartridge.',
'Open',
'medium'
),

-- Cooling Water Pump
(
'20000000-0000-0000-0000-000000000009',
'REF-UTIL-CW101-001',
'ISO_14001',
'Clause_9.1',
'Cooling water discharge monitoring.',
'compliant',
'10000000-0000-0000-0000-000000000022',
'2025-12-18',
'2026-12-18',
'AUD009',
'Environmental Audit Services',
'Water quality within permissible limits.',
'None',
'Closed',
'low'
);

-- ============================================================
-- compliance_records.sql
-- PART 2 : PETROCHEMICAL PLANT (PET)
-- ============================================================

INSERT INTO compliance_records
(
    record_id,
    uat,
    regulation,
    requirement_clause,
    requirement_description,
    current_status,
    evidence_doc_id,
    last_audit_date,
    next_audit_due,
    auditor_id,
    auditor_org,
    findings,
    corrective_action_required,
    capa_status,
    risk_rating
)
VALUES

-- Compressor C-301
(
'20000000-0000-0000-0000-000000000010',
'PET-DIST-C301-001',
'OISD_117',
'Clause_5.1',
'Centrifugal compressor mechanical integrity inspection.',
'compliant',
'10000000-0000-0000-0000-000000000025',
'2025-09-14',
'2026-09-14',
'AUD010',
'Reliance Internal Audit',
'Seal system and vibration levels within acceptable limits.',
'None',
'Closed',
'low'
),

-- Feed Pump P-302
(
'20000000-0000-0000-0000-000000000011',
'PET-DIST-P302-001',
'ISO_9001',
'Clause_8.5',
'Preventive maintenance documentation for feed pumps.',
'partially_compliant',
'10000000-0000-0000-0000-000000000028',
'2026-02-18',
'2027-02-18',
'AUD011',
'Bureau Veritas',
'PM checklist missing lubrication records.',
'Update maintenance documentation.',
'Open',
'medium'
),

-- Heat Exchanger E-303
(
'20000000-0000-0000-0000-000000000012',
'PET-DIST-E303-001',
'Factory_Act_1948',
'Section_21',
'Heat exchanger inspection and safe operation.',
'compliant',
'10000000-0000-0000-0000-000000000031',
'2025-11-09',
'2026-11-09',
'AUD012',
'DNV India',
'Inspection completed successfully.',
'None',
'Closed',
'low'
),

-- Vessel V-304
(
'20000000-0000-0000-0000-000000000013',
'PET-DIST-V304-001',
'PESO',
'PV-CERT-08',
'Pressure vessel certification renewal.',
'non_compliant',
'10000000-0000-0000-0000-000000000043',
'2026-03-25',
'2027-03-25',
'AUD013',
'PESO',
'Safety relief valve calibration overdue.',
'Recalibrate PSV and renew certificate.',
'In Progress',
'high'
),

-- Polymer Reactor T-305
(
'20000000-0000-0000-0000-000000000014',
'PET-POLY-T305-001',
'ISO_14001',
'Clause_7.5',
'Environmental controls for polymerization process.',
'compliant',
'10000000-0000-0000-0000-000000000034',
'2025-12-05',
'2026-12-05',
'AUD014',
'SGS India',
'VOC emission records compliant.',
'None',
'Closed',
'low'
),

-- Polymer Cooler HX-306
(
'20000000-0000-0000-0000-000000000015',
'PET-POLY-HX306-001',
'OISD_144',
'Clause_6.4',
'Cooling system performance verification.',
'partially_compliant',
'10000000-0000-0000-0000-000000000037',
'2026-01-27',
'2027-01-27',
'AUD015',
'Indian Oil Internal Audit',
'Minor fouling observed reducing efficiency.',
'Schedule chemical cleaning during next shutdown.',
'Open',
'medium'
),

-- Storage Tank TK-307
(
'20000000-0000-0000-0000-000000000016',
'PET-POLY-TK307-001',
'Factory_Act_1948',
'Storage Rule 14',
'Storage tank integrity inspection.',
'compliant',
'10000000-0000-0000-0000-000000000040',
'2025-10-30',
'2026-10-30',
'AUD016',
'State Safety Directorate',
'No corrosion or leakage detected.',
'None',
'Closed',
'low'
);

-- ============================================================
-- compliance_records.sql
-- PART 3 : STEEL PLANT (STL)
-- ============================================================

INSERT INTO compliance_records
(
    record_id,
    uat,
    regulation,
    requirement_clause,
    requirement_description,
    current_status,
    evidence_doc_id,
    last_audit_date,
    next_audit_due,
    auditor_id,
    auditor_org,
    findings,
    corrective_action_required,
    capa_status,
    risk_rating
)
VALUES

-- RM-101 Raw Material Crusher
(
'20000000-0000-0000-0000-000000000017',
'STL-RM-RM101-001',
'ISO_9001',
'Clause_8.5',
'Mechanical integrity and preventive maintenance of raw material crusher.',
'partially_compliant',
'10000000-0000-0000-0000-000000000046',
'2026-01-15',
'2027-01-15',
'AUD017',
'TUV SUD India',
'Gearbox wear exceeded maintenance threshold.',
'Replace gearbox assembly during next shutdown.',
'Open',
'medium'
),

-- BF-201 Blast Furnace
(
'20000000-0000-0000-0000-000000000018',
'STL-BF-BF201-001',
'Factory_Act_1948',
'Section_41B',
'Blast furnace safety and emergency preparedness.',
'compliant',
'10000000-0000-0000-0000-000000000049',
'2025-11-22',
'2026-11-22',
'AUD018',
'Directorate of Industrial Safety',
'Cooling system, emergency shutdown and operator training fully compliant.',
'None',
'Closed',
'low'
),

-- CCM-301 Continuous Casting Machine
(
'20000000-0000-0000-0000-000000000019',
'STL-CCM-CCM301-001',
'OISD_117',
'Clause_7.1',
'Rotating equipment and casting line inspection.',
'compliant',
'10000000-0000-0000-0000-000000000052',
'2026-03-12',
'2027-03-12',
'AUD019',
'Steel Authority Quality Cell',
'Drive motors, rollers and lubrication system operating normally.',
'None',
'Closed',
'low'
),

-- Hydraulic Power Unit P-401
(
'20000000-0000-0000-0000-000000000020',
'STL-HYD-P401-001',
'ISO_14001',
'Clause_6.1',
'Hydraulic oil leak prevention and environmental management.',
'non_compliant',
'10000000-0000-0000-0000-000000000055',
'2026-04-09',
'2027-04-09',
'AUD020',
'SGS India',
'Hydraulic oil leakage observed near return manifold.',
'Replace damaged seals and clean contaminated area.',
'In Progress',
'high'
),

-- Cooling Tower CT-501
(
'20000000-0000-0000-0000-000000000021',
'STL-UTIL-CT501-001',
'ISO_14001',
'Clause_9.1',
'Cooling water quality and environmental compliance.',
'compliant',
'10000000-0000-0000-0000-000000000058',
'2025-10-05',
'2026-10-05',
'AUD021',
'Environmental Compliance Services',
'Water chemistry, drift eliminators and blowdown records satisfactory.',
'None',
'Closed',
'low'
);

Inserting Inspection records

-- ============================================================
-- inspections.sql
-- PART 1 : REFINERY PLANT (REF)
-- ============================================================

INSERT INTO inspections
(
    inspection_id,
    uat,
    inspection_type,
    inspection_standard,
    inspector_id,
    inspector_name,
    inspection_date,
    next_due_date,
    frequency_months,
    findings,
    severity,
    recommendation,
    photo_hashes,
    document_refs,
    work_order_generated,
    compliance_status
)
VALUES

-- 1. Reactor R-101
(
'30000000-0000-0000-0000-000000000001',
'REF-HTX-R101-001',
'pressure_test',
'API 510',
'INS001',
'Rajesh Kumar',
'2025-06-18',
'2026-06-18',
12,
'Reactor shell, nozzles and pressure relief devices inspected. No pressure loss detected.',
'satisfactory',
'Continue annual pressure testing.',
ARRAY[
'4e0cbf96aaec9b1d5e49d78c1f0c5f6d1f77e0e65c1d93d540d40f58b44f0001'
],
ARRAY[
'10000000-0000-0000-0000-000000000001'::uuid,
'10000000-0000-0000-0000-000000000003'::uuid
],
'WO-2024-0001',
'compliant'
),

-- 2. Heat Exchanger E-201
(
'30000000-0000-0000-0000-000000000002',
'REF-HTX-E201-001',
'ultrasonic_thickness',
'API 570',
'INS002',
'Anil Mehta',
'2025-04-10',
'2026-04-10',
12,
'Minor tube wall thinning observed near outlet channel due to fouling.',
'minor',
'Chemical cleaning during next planned shutdown.',
ARRAY[
'5a4bb3f67f7d8d6aa1c2b14ce38a6dd53bdc0d7d91d0e4f12244ee2f20000002'
],
ARRAY[
'10000000-0000-0000-0000-000000000004'::uuid,
'10000000-0000-0000-0000-000000000006'::uuid
],
'WO-2025-0009',
'conditional'
),

-- 3. Pump P-201
(
'30000000-0000-0000-0000-000000000003',
'REF-HTX-P201-001',
'vibration_analysis',
'ISO 10816',
'INS003',
'Vikas Sharma',
'2026-01-11',
'2026-07-11',
6,
'Drive-end bearing vibration exceeded normal operating baseline.',
'major',
'Replace bearings and perform shaft alignment.',
ARRAY[
'cd89b31de64aa9086ccebd4d90819e5f2de01ab43ef3124bbd0a000000000003'
],
ARRAY[
'10000000-0000-0000-0000-000000000007'::uuid
],
'WO-2025-0010',
'non_compliant'
),

-- 4. Pressure Vessel V-301
(
'30000000-0000-0000-0000-000000000004',
'REF-HTX-V301-001',
'visual',
'ASME Section VIII',
'INS004',
'Sunil Nair',
'2025-09-02',
'2026-09-02',
12,
'External coating intact. No evidence of corrosion or leakage.',
'satisfactory',
'Routine monitoring only.',
ARRAY[
'8cc44b31f40a5b611f90f234b76fd42d57aa990f6dd3ce4f8000000000000004'
],
ARRAY[
'10000000-0000-0000-0000-000000000010'::uuid
],
'WO-2024-0004',
'compliant'
),

-- 5. Tank T-401
(
'30000000-0000-0000-0000-000000000005',
'REF-HTX-T401-001',
'thermography',
'ISO 18434',
'INS005',
'Prakash Singh',
'2026-02-21',
'2027-02-21',
12,
'Agitator motor coupling showed elevated thermal signature.',
'observation',
'Monitor bearing temperature monthly.',
ARRAY[
'4dc1134567d44aa91be4dc11f9003b2dd9910bba44cc56770000000000000005'
],
ARRAY[
'10000000-0000-0000-0000-000000000013'::uuid
],
'WO-2026-0015',
'conditional'
),

-- 6. Boiler B-101
(
'30000000-0000-0000-0000-000000000006',
'REF-UTIL-B101-001',
'pressure_test',
'IBR',
'INS006',
'Amit Verma',
'2025-10-05',
'2026-10-05',
12,
'Hydrostatic pressure test successfully completed.',
'satisfactory',
'Boiler fit for continued service.',
ARRAY[
'92afde456710bbcc78deaa98765bb1cc442299dd9911ee550000000000000006'
],
ARRAY[
'10000000-0000-0000-0000-000000000016'::uuid
],
'WO-2025-0006',
'compliant'
),

-- 7. Air Compressor C-101
(
'30000000-0000-0000-0000-000000000007',
'REF-UTIL-C101-001',
'oil_analysis',
'ISO 4406',
'INS007',
'Harish Patel',
'2026-03-14',
'2026-09-14',
6,
'Oil contamination slightly above recommended particle count.',
'minor',
'Replace lubricant and oil filter.',
ARRAY[
'1122ccdd33445566778899aabbccddeeff001122334455667788990000000007'
],
ARRAY[
'10000000-0000-0000-0000-000000000019'::uuid
],
'WO-2025-0007',
'conditional'
),

-- 8. Cooling Water Pump CW-101
(
'30000000-0000-0000-0000-000000000008',
'REF-UTIL-CW101-001',
'leak_test',
'API 610',
'INS008',
'Deepak Joshi',
'2026-05-09',
'2027-05-09',
12,
'Mechanical seal leak test passed. No leakage detected.',
'satisfactory',
'Continue preventive maintenance schedule.',
ARRAY[
'99887766554433221100ffeeddccbbaa99887766554433221100000000000008'
],
ARRAY[
'10000000-0000-0000-0000-000000000022'::uuid
],
'WO-2025-0008',
'compliant'
);

-- ============================================================
-- inspections.sql
-- PART 2 : PETROCHEMICAL PLANT (PET)
-- ============================================================

INSERT INTO inspections
(
    inspection_id,
    uat,
    inspection_type,
    inspection_standard,
    inspector_id,
    inspector_name,
    inspection_date,
    next_due_date,
    frequency_months,
    findings,
    severity,
    recommendation,
    photo_hashes,
    document_refs,
    work_order_generated,
    compliance_status
)
VALUES

-- 9. Compressor C-301
(
'30000000-0000-0000-0000-000000000009',
'PET-DIST-C301-001',
'vibration_analysis',
'ISO 10816',
'INS009',
'Suresh Patel',
'2025-08-18',
'2026-02-18',
6,
'Compressor vibration remained within acceptable operating limits. Minor seal wear observed.',
'observation',
'Continue periodic vibration monitoring.',
ARRAY[
'c301aabb00112233445566778899aabbccddeeff001122334455667788990001'
],
ARRAY[
'10000000-0000-0000-0000-000000000025'::uuid,
'10000000-0000-0000-0000-000000000027'::uuid
],
'WO-2024-0016',
'compliant'
),

-- 10. Feed Pump P-302
(
'30000000-0000-0000-0000-000000000010',
'PET-DIST-P302-001',
'vibration_analysis',
'API 610',
'INS010',
'Ajay Nair',
'2026-02-08',
'2026-08-08',
6,
'Shaft alignment slightly outside tolerance causing elevated bearing temperature.',
'minor',
'Perform laser alignment during next shutdown.',
ARRAY[
'p302bbcc11223344556677889900aabbccddeeff112233445566778899000002'
],
ARRAY[
'10000000-0000-0000-0000-000000000028'::uuid
],
'WO-2026-0023',
'conditional'
),

-- 11. Heat Exchanger E-303
(
'30000000-0000-0000-0000-000000000011',
'PET-DIST-E303-001',
'ultrasonic_thickness',
'API 570',
'INS011',
'Rohit Menon',
'2025-11-20',
'2026-11-20',
12,
'Minor scaling detected inside tubes reducing heat transfer efficiency.',
'minor',
'Schedule chemical descaling during annual turnaround.',
ARRAY[
'e30399887766554433221100ffeeddccbbaa9988776655443322110000000003'
],
ARRAY[
'10000000-0000-0000-0000-000000000031'::uuid,
'10000000-0000-0000-0000-000000000033'::uuid
],
'WO-2025-0018',
'conditional'
),

-- 12. Vessel V-304
(
'30000000-0000-0000-0000-000000000012',
'PET-DIST-V304-001',
'pressure_test',
'ASME Section VIII',
'INS012',
'Vinod Rao',
'2026-03-24',
'2027-03-24',
12,
'Pressure test successful. Relief valve calibration overdue.',
'major',
'Calibrate PSV before next production campaign.',
ARRAY[
'v304123456789abcdef123456789abcdef123456789abcdef123456789abcd04'
],
ARRAY[
'10000000-0000-0000-0000-000000000043'::uuid,
'10000000-0000-0000-0000-000000000045'::uuid
],
'WO-2026-0020',
'non_compliant'
),

-- 13. Polymer Reactor T-305
(
'30000000-0000-0000-0000-000000000013',
'PET-POLY-T305-001',
'thermography',
'ISO 18434',
'INS013',
'Manoj Sharma',
'2026-01-16',
'2027-01-16',
12,
'Motor and gearbox temperatures normal. Reactor insulation intact.',
'satisfactory',
'Routine monitoring.',
ARRAY[
't305abcdefabcdef123456789987654321abcdefabcdef123456789987654305'
],
ARRAY[
'10000000-0000-0000-0000-000000000034'::uuid
],
'WO-2025-0019',
'compliant'
),

-- 14. Polymer Cooler HX-306
(
'30000000-0000-0000-0000-000000000014',
'PET-POLY-HX306-001',
'visual',
'API 570',
'INS014',
'Nitin Joshi',
'2026-05-02',
'2027-05-02',
12,
'External fins clean. Slight fouling observed inside cooling channels.',
'observation',
'Flush exchanger during scheduled maintenance.',
ARRAY[
'hx30600112233445566778899aabbccddeeff001122334455667788990000006'
],
ARRAY[
'10000000-0000-0000-0000-000000000037'::uuid
],
'WO-2026-0024',
'conditional'
),

-- 15. Storage Tank TK-307
(
'30000000-0000-0000-0000-000000000015',
'PET-POLY-TK307-001',
'leak_test',
'API 653',
'INS015',
'Kiran Deshmukh',
'2025-10-28',
'2026-10-28',
12,
'No leakage detected from shell, bottom plate or nozzles.',
'satisfactory',
'Continue annual integrity inspections.',
ARRAY[
'tk307ffeeddccbbaa99887766554433221100ffeeddccbbaa998877665544007'
],
ARRAY[
'10000000-0000-0000-0000-000000000040'::uuid,
'10000000-0000-0000-0000-000000000042'::uuid
],
'WO-2025-0022',
'compliant'
);

-- ============================================================
-- inspections.sql
-- PART 3 : STEEL PLANT (STL)
-- ============================================================

INSERT INTO inspections
(
    inspection_id,
    uat,
    inspection_type,
    inspection_standard,
    inspector_id,
    inspector_name,
    inspection_date,
    next_due_date,
    frequency_months,
    findings,
    severity,
    recommendation,
    photo_hashes,
    document_refs,
    work_order_generated,
    compliance_status
)
VALUES

-- 16. Raw Material Crusher RM-101
(
'30000000-0000-0000-0000-000000000016',
'STL-RM-RM101-001',
'vibration_analysis',
'ISO 10816',
'INS016',
'Rakesh Kulkarni',
'2026-01-18',
'2026-07-18',
6,
'Gearbox vibration exceeded baseline by 18%. Gear tooth wear detected.',
'major',
'Replace gearbox assembly during scheduled shutdown.',
ARRAY[
'rm10100112233445566778899aabbccddeeff00112233445566778899000001'
],
ARRAY[
'10000000-0000-0000-0000-000000000046'::uuid,
'10000000-0000-0000-0000-000000000048'::uuid
],
'WO-2026-0030',
'non_compliant'
),

-- 17. Blast Furnace BF-201
(
'30000000-0000-0000-0000-000000000017',
'STL-BF-BF201-001',
'thermography',
'API 579',
'INS017',
'Ajay Deshpande',
'2025-11-24',
'2026-11-24',
12,
'Cooling jackets and tuyere sections showed uniform thermal profile.',
'satisfactory',
'Continue annual thermal inspection.',
ARRAY[
'bf201abcdef123456789abcdef123456789abcdef123456789abcdef1234502'
],
ARRAY[
'10000000-0000-0000-0000-000000000049'::uuid,
'10000000-0000-0000-0000-000000000051'::uuid
],
'WO-2025-0026',
'compliant'
),

-- 18. Continuous Casting Machine CCM-301
(
'30000000-0000-0000-0000-000000000018',
'STL-CCM-CCM301-001',
'visual',
'ISO 9001',
'INS018',
'Sunil Verma',
'2026-03-15',
'2027-03-15',
12,
'Guide rollers, mold assembly and lubrication system inspected. No abnormalities observed.',
'observation',
'Routine preventive maintenance recommended.',
ARRAY[
'ccm30199887766554433221100ffeeddccbbaa998877665544332211000003'
],
ARRAY[
'10000000-0000-0000-0000-000000000052'::uuid,
'10000000-0000-0000-0000-000000000054'::uuid
],
'WO-2025-0027',
'compliant'
),

-- 19. Hydraulic Power Unit P-401
(
'30000000-0000-0000-0000-000000000019',
'STL-HYD-P401-001',
'oil_analysis',
'ISO 4406',
'INS019',
'Mahesh Patil',
'2026-04-12',
'2026-10-12',
6,
'Hydraulic oil contamination level exceeded ISO cleanliness target. Minor seal leakage observed.',
'minor',
'Replace return-line filters and flush hydraulic circuit.',
ARRAY[
'p401fedcba9876543210fedcba9876543210fedcba9876543210fedcba00004'
],
ARRAY[
'10000000-0000-0000-0000-000000000055'::uuid,
'10000000-0000-0000-0000-000000000057'::uuid
],
'WO-2026-0028',
'conditional'
),

-- 20. Cooling Tower CT-501
(
'30000000-0000-0000-0000-000000000020',
'STL-UTIL-CT501-001',
'visual',
'CTI STD-201',
'INS020',
'Vivek Sharma',
'2025-10-08',
'2026-10-08',
12,
'Cooling tower fan assembly, drift eliminators and basin inspected. No structural defects found.',
'satisfactory',
'Maintain existing preventive maintenance schedule.',
ARRAY[
'ct501abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef0005'
],
ARRAY[
'10000000-0000-0000-0000-000000000058'::uuid,
'10000000-0000-0000-0000-000000000060'::uuid
],
'WO-2026-0029',
'compliant'
);

Inserting Sensor Data

-- ============================================================
-- sensor_data.sql
-- PART 1A : REF PLANT - NORMAL OPERATION
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================
-- Reactor R-101
-- ============================
('REF-HTX-R101-001','TIC-101','Temperature',318.4,'°C','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',24.8,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-R101-001','LIC-101','Level',68.2,'%','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-R101-001','TIC-101','Temperature',319.1,'°C','GOOD','2026-06-29 10:05:00+00'),

-- ============================
-- Heat Exchanger E-201
-- ============================
('REF-HTX-E201-001','TT-201-IN','Temperature',184.6,'°C','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-E201-001','TT-201-OUT','Temperature',138.7,'°C','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-E201-001','DP-201','Differential Pressure',0.42,'bar','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Process Pump P-201
-- ============================
('REF-HTX-P201-001','VIB-201','Vibration',2.1,'mm/s','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-P201-001','PI-201','Discharge Pressure',15.8,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-P201-001','FI-201','Flow',246.3,'m3/h','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Pressure Vessel V-301
-- ============================
('REF-HTX-V301-001','PIC-301','Pressure',8.6,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-V301-001','LIT-301','Level',57.4,'%','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-V301-001','TT-301','Temperature',71.2,'°C','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Agitator Tank T-401
-- ============================
('REF-HTX-T401-001','AIT-401','Agitator Speed',1485,'RPM','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-T401-001','VIB-401','Vibration',1.4,'mm/s','GOOD','2026-06-29 10:00:00+00'),
('REF-HTX-T401-001','TT-401','Temperature',84.3,'°C','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Boiler B-101
-- ============================
('REF-UTIL-B101-001','PT-101','Steam Pressure',41.5,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-B101-001','TT-101','Steam Temperature',447.8,'°C','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-B101-001','LT-101','Drum Level',51.6,'%','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Air Compressor C-101
-- ============================
('REF-UTIL-C101-001','PI-101','Discharge Pressure',7.3,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-C101-001','VIB-101','Vibration',1.2,'mm/s','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-C101-001','TT-101','Bearing Temperature',63.1,'°C','GOOD','2026-06-29 10:00:00+00'),

-- ============================
-- Cooling Water Pump CW-101
-- ============================
('REF-UTIL-CW101-001','FI-101','Flow',512.8,'m3/h','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-CW101-001','PI-101','Pressure',4.7,'bar','GOOD','2026-06-29 10:00:00+00'),
('REF-UTIL-CW101-001','VIB-101','Vibration',1.1,'mm/s','GOOD','2026-06-29 10:00:00+00');

-- ============================================================
-- sensor_data.sql
-- PART 1B : REF PLANT - FAILURE PROGRESSION
-- (R-101 High Temperature Trip, E-201 Fouling,
--  P-201 Bearing Failure)
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================================================
-- R-101 HIGH TEMPERATURE TRIP
-- Failure Date : 2026-06-30
-- ============================================================

('REF-HTX-R101-001','TIC-101','Temperature',326.8,'°C','GOOD','2026-06-30 10:20:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',25.2,'bar','GOOD','2026-06-30 10:20:00+00'),

('REF-HTX-R101-001','TIC-101','Temperature',337.4,'°C','GOOD','2026-06-30 10:23:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',25.8,'bar','GOOD','2026-06-30 10:23:00+00'),

('REF-HTX-R101-001','TIC-101','Temperature',349.5,'°C','GOOD','2026-06-30 10:26:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',26.4,'bar','GOOD','2026-06-30 10:26:00+00'),

('REF-HTX-R101-001','TIC-101','Temperature',361.9,'°C','GOOD','2026-06-30 10:29:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',27.0,'bar','GOOD','2026-06-30 10:29:00+00'),

('REF-HTX-R101-001','TIC-101','Temperature',378.2,'°C','GOOD','2026-06-30 10:31:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',27.7,'bar','GOOD','2026-06-30 10:31:00+00'),

('REF-HTX-R101-001','TIC-101','Temperature',386.4,'°C','GOOD','2026-06-30 10:32:00+00'),
('REF-HTX-R101-001','PIC-101','Pressure',28.3,'bar','GOOD','2026-06-30 10:32:00+00'),

-- ============================================================
-- E-201 FOULING DEVELOPMENT
-- ============================================================

('REF-HTX-E201-001','DP-201','Differential Pressure',0.55,'bar','GOOD','2026-04-10 08:00:00+00'),
('REF-HTX-E201-001','TT-201-OUT','Temperature',135.2,'°C','GOOD','2026-04-10 08:00:00+00'),

('REF-HTX-E201-001','DP-201','Differential Pressure',0.78,'bar','GOOD','2026-04-18 08:00:00+00'),
('REF-HTX-E201-001','TT-201-OUT','Temperature',129.4,'°C','GOOD','2026-04-18 08:00:00+00'),

('REF-HTX-E201-001','DP-201','Differential Pressure',1.12,'bar','GOOD','2026-04-24 08:00:00+00'),
('REF-HTX-E201-001','TT-201-OUT','Temperature',123.8,'°C','GOOD','2026-04-24 08:00:00+00'),

('REF-HTX-E201-001','DP-201','Differential Pressure',1.43,'bar','GOOD','2026-04-28 08:00:00+00'),
('REF-HTX-E201-001','TT-201-OUT','Temperature',118.1,'°C','GOOD','2026-04-28 08:00:00+00'),

-- ============================================================
-- P-201 BEARING FAILURE
-- ============================================================

('REF-HTX-P201-001','VIB-201','Vibration',2.4,'mm/s','GOOD','2026-03-12 14:00:00+00'),
('REF-HTX-P201-001','BT-201','Bearing Temperature',69.5,'°C','GOOD','2026-03-12 14:00:00+00'),

('REF-HTX-P201-001','VIB-201','Vibration',3.6,'mm/s','GOOD','2026-03-12 14:10:00+00'),
('REF-HTX-P201-001','BT-201','Bearing Temperature',74.8,'°C','GOOD','2026-03-12 14:10:00+00'),

('REF-HTX-P201-001','VIB-201','Vibration',5.8,'mm/s','GOOD','2026-03-12 14:20:00+00'),
('REF-HTX-P201-001','BT-201','Bearing Temperature',82.4,'°C','GOOD','2026-03-12 14:20:00+00'),

('REF-HTX-P201-001','VIB-201','Vibration',8.9,'mm/s','GOOD','2026-03-12 14:30:00+00'),
('REF-HTX-P201-001','BT-201','Bearing Temperature',91.6,'°C','GOOD','2026-03-12 14:30:00+00'),

('REF-HTX-P201-001','VIB-201','Vibration',11.8,'mm/s','GOOD','2026-03-12 14:40:00+00'),
('REF-HTX-P201-001','BT-201','Bearing Temperature',101.8,'°C','GOOD','2026-03-12 14:40:00+00');

-- ============================================================
-- sensor_data.sql
-- PART 2A : PET PLANT - NORMAL OPERATION
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================================================
-- Compressor C-301
-- ============================================================
('PET-DIST-C301-001','PIC-301','Pressure',16.4,'bar','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-C301-001','TT-301','Temperature',88.2,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',2.3,'mm/s','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Feed Pump P-302
-- ============================================================
('PET-DIST-P302-001','PI-302','Pressure',12.7,'bar','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-P302-001','FI-302','Flow',184.8,'m3/h','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-P302-001','VIB-302','Vibration',2.0,'mm/s','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Heat Exchanger E-303
-- ============================================================
('PET-DIST-E303-001','TT-303-IN','Temperature',205.3,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-E303-001','TT-303-OUT','Temperature',154.8,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-E303-001','DP-303','Differential Pressure',0.36,'bar','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Vessel V-304
-- ============================================================
('PET-DIST-V304-001','PIC-304','Pressure',7.6,'bar','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-V304-001','LIC-304','Level',61.9,'%','GOOD','2026-06-29 09:00:00+00'),
('PET-DIST-V304-001','TT-304','Temperature',73.5,'°C','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Polymer Reactor T-305
-- ============================================================
('PET-POLY-T305-001','TIC-305','Temperature',271.4,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-T305-001','PIC-305','Pressure',19.8,'bar','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-T305-001','AIT-305','Agitator Speed',1490,'RPM','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Polymer Cooler HX-306
-- ============================================================
('PET-POLY-HX306-001','TT-306-IN','Temperature',151.6,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',96.8,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-HX306-001','DP-306','Differential Pressure',0.41,'bar','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Storage Tank TK-307
-- ============================================================
('PET-POLY-TK307-001','LIT-307','Level',78.5,'%','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-TK307-001','TT-307','Temperature',42.6,'°C','GOOD','2026-06-29 09:00:00+00'),
('PET-POLY-TK307-001','PIC-307','Pressure',1.2,'bar','GOOD','2026-06-29 09:00:00+00'),

-- ============================================================
-- Additional Normal Historian Readings
-- ============================================================

('PET-DIST-C301-001','PIC-301','Pressure',16.5,'bar','GOOD','2026-06-29 09:05:00+00'),
('PET-DIST-P302-001','FI-302','Flow',185.2,'m3/h','GOOD','2026-06-29 09:05:00+00'),
('PET-DIST-E303-001','TT-303-OUT','Temperature',154.2,'°C','GOOD','2026-06-29 09:05:00+00'),
('PET-POLY-T305-001','TIC-305','Temperature',272.0,'°C','GOOD','2026-06-29 09:05:00+00');

-- ============================================================
-- sensor_data.sql
-- PART 2B : PET PLANT - FAILURE PROGRESSION
-- (C-301 Seal Leak, P-302 Misalignment, HX-306 Fouling)
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================================================
-- C-301 Mechanical Seal Leak
-- ============================================================

('PET-DIST-C301-001','PIC-301','Pressure',16.2,'bar','GOOD','2026-02-15 08:00:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',2.5,'mm/s','GOOD','2026-02-15 08:00:00+00'),

('PET-DIST-C301-001','PIC-301','Pressure',15.8,'bar','GOOD','2026-02-15 08:10:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',3.6,'mm/s','GOOD','2026-02-15 08:10:00+00'),

('PET-DIST-C301-001','PIC-301','Pressure',15.1,'bar','GOOD','2026-02-15 08:20:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',4.8,'mm/s','GOOD','2026-02-15 08:20:00+00'),

('PET-DIST-C301-001','PIC-301','Pressure',14.5,'bar','GOOD','2026-02-15 08:30:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',6.3,'mm/s','GOOD','2026-02-15 08:30:00+00'),

('PET-DIST-C301-001','PIC-301','Pressure',13.9,'bar','GOOD','2026-02-15 08:40:00+00'),
('PET-DIST-C301-001','VIB-301','Vibration',8.1,'mm/s','GOOD','2026-02-15 08:40:00+00'),

-- ============================================================
-- P-302 Shaft Misalignment
-- ============================================================

('PET-DIST-P302-001','VIB-302','Vibration',2.4,'mm/s','GOOD','2026-03-21 11:00:00+00'),
('PET-DIST-P302-001','BT-302','Bearing Temperature',63.4,'°C','GOOD','2026-03-21 11:00:00+00'),

('PET-DIST-P302-001','VIB-302','Vibration',3.5,'mm/s','GOOD','2026-03-21 11:10:00+00'),
('PET-DIST-P302-001','BT-302','Bearing Temperature',68.7,'°C','GOOD','2026-03-21 11:10:00+00'),

('PET-DIST-P302-001','VIB-302','Vibration',5.1,'mm/s','GOOD','2026-03-21 11:20:00+00'),
('PET-DIST-P302-001','BT-302','Bearing Temperature',75.2,'°C','GOOD','2026-03-21 11:20:00+00'),

('PET-DIST-P302-001','VIB-302','Vibration',7.2,'mm/s','GOOD','2026-03-21 11:30:00+00'),
('PET-DIST-P302-001','BT-302','Bearing Temperature',82.8,'°C','GOOD','2026-03-21 11:30:00+00'),

('PET-DIST-P302-001','VIB-302','Vibration',9.4,'mm/s','GOOD','2026-03-21 11:40:00+00'),
('PET-DIST-P302-001','BT-302','Bearing Temperature',91.1,'°C','GOOD','2026-03-21 11:40:00+00'),

-- ============================================================
-- HX-306 Fouling
-- ============================================================

('PET-POLY-HX306-001','DP-306','Differential Pressure',0.52,'bar','GOOD','2026-04-05 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',95.2,'°C','GOOD','2026-04-05 09:00:00+00'),

('PET-POLY-HX306-001','DP-306','Differential Pressure',0.79,'bar','GOOD','2026-04-12 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',101.8,'°C','GOOD','2026-04-12 09:00:00+00'),

('PET-POLY-HX306-001','DP-306','Differential Pressure',1.08,'bar','GOOD','2026-04-18 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',109.7,'°C','GOOD','2026-04-18 09:00:00+00'),

('PET-POLY-HX306-001','DP-306','Differential Pressure',1.39,'bar','GOOD','2026-04-24 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',117.3,'°C','GOOD','2026-04-24 09:00:00+00'),

('PET-POLY-HX306-001','DP-306','Differential Pressure',1.72,'bar','GOOD','2026-04-30 09:00:00+00'),
('PET-POLY-HX306-001','TT-306-OUT','Temperature',126.1,'°C','GOOD','2026-04-30 09:00:00+00');

-- ============================================================
-- sensor_data.sql
-- PART 3A : STEEL PLANT - NORMAL OPERATION
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================================================
-- RM-101 Raw Material Crusher
-- ============================================================
('STL-RM-RM101-001','VIB-101','Vibration',2.8,'mm/s','GOOD','2026-06-29 08:00:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',58.4,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-RM-RM101-001','MOT-101','Motor Current',148.6,'A','GOOD','2026-06-29 08:00:00+00'),

-- ============================================================
-- BF-201 Blast Furnace
-- ============================================================
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1187.4,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-BF-BF201-001','PT-201','Blast Pressure',2.42,'bar','GOOD','2026-06-29 08:00:00+00'),
('STL-BF-BF201-001','FIT-201','Cooling Water Flow',456.8,'m3/h','GOOD','2026-06-29 08:00:00+00'),

-- ============================================================
-- CCM-301 Continuous Casting Machine
-- ============================================================
('STL-CCM-CCM301-001','ST-301','Casting Speed',1.82,'m/min','GOOD','2026-06-29 08:00:00+00'),
('STL-CCM-CCM301-001','TT-301','Mould Temperature',276.5,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-CCM-CCM301-001','FIT-301','Cooling Water Flow',219.4,'m3/h','GOOD','2026-06-29 08:00:00+00'),

-- ============================================================
-- Hydraulic Power Unit P-401
-- ============================================================
('STL-HYD-P401-001','HP-401','Hydraulic Pressure',212.5,'bar','GOOD','2026-06-29 08:00:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',48.1,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-HYD-P401-001','LT-401','Oil Level',79.8,'%','GOOD','2026-06-29 08:00:00+00'),

-- ============================================================
-- Cooling Tower CT-501
-- ============================================================
('STL-UTIL-CT501-001','TT-501-IN','Water Inlet Temperature',36.7,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-UTIL-CT501-001','TT-501-OUT','Water Outlet Temperature',28.5,'°C','GOOD','2026-06-29 08:00:00+00'),
('STL-UTIL-CT501-001','FIT-501','Circulation Flow',874.2,'m3/h','GOOD','2026-06-29 08:00:00+00'),

-- ============================================================
-- Additional Historian Samples
-- ============================================================

('STL-RM-RM101-001','VIB-101','Vibration',2.9,'mm/s','GOOD','2026-06-29 08:05:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1189.2,'°C','GOOD','2026-06-29 08:05:00+00'),
('STL-CCM-CCM301-001','ST-301','Casting Speed',1.84,'m/min','GOOD','2026-06-29 08:05:00+00'),
('STL-HYD-P401-001','HP-401','Hydraulic Pressure',213.1,'bar','GOOD','2026-06-29 08:05:00+00'),
('STL-UTIL-CT501-001','FIT-501','Circulation Flow',876.5,'m3/h','GOOD','2026-06-29 08:05:00+00'),

('STL-RM-RM101-001','GT-101','Gearbox Temperature',58.8,'°C','GOOD','2026-06-29 08:10:00+00'),
('STL-BF-BF201-001','PT-201','Blast Pressure',2.44,'bar','GOOD','2026-06-29 08:10:00+00'),
('STL-CCM-CCM301-001','TT-301','Mould Temperature',277.0,'°C','GOOD','2026-06-29 08:10:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',48.3,'°C','GOOD','2026-06-29 08:10:00+00'),
('STL-UTIL-CT501-001','TT-501-OUT','Water Outlet Temperature',28.4,'°C','GOOD','2026-06-29 08:10:00+00');

-- ============================================================
-- sensor_data.sql
-- PART 3B : STEEL PLANT - FAILURE PROGRESSION
-- (RM-101 Gearbox Wear, BF-201 Cooling Water Leak,
--  P-401 Hydraulic Failure)
-- ============================================================

INSERT INTO sensor_data
(
    uat,
    sensor_tag,
    sensor_type,
    reading_value,
    unit,
    quality_code,
    recorded_at
)
VALUES

-- ============================================================
-- RM-101 Gearbox Wear
-- ============================================================

('STL-RM-RM101-001','VIB-101','Vibration',3.8,'mm/s','GOOD','2026-05-18 08:00:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',66.5,'°C','GOOD','2026-05-18 08:00:00+00'),

('STL-RM-RM101-001','VIB-101','Vibration',5.4,'mm/s','GOOD','2026-05-18 08:10:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',72.8,'°C','GOOD','2026-05-18 08:10:00+00'),

('STL-RM-RM101-001','VIB-101','Vibration',7.3,'mm/s','GOOD','2026-05-18 08:20:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',79.6,'°C','GOOD','2026-05-18 08:20:00+00'),

('STL-RM-RM101-001','VIB-101','Vibration',9.8,'mm/s','GOOD','2026-05-18 08:30:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',88.9,'°C','GOOD','2026-05-18 08:30:00+00'),

('STL-RM-RM101-001','VIB-101','Vibration',12.6,'mm/s','GOOD','2026-05-18 08:40:00+00'),
('STL-RM-RM101-001','GT-101','Gearbox Temperature',96.4,'°C','GOOD','2026-05-18 08:40:00+00'),

-- ============================================================
-- BF-201 Cooling Water Leak
-- ============================================================

('STL-BF-BF201-001','FIT-201','Cooling Water Flow',455.1,'m3/h','GOOD','2026-04-02 14:00:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1192.8,'°C','GOOD','2026-04-02 14:00:00+00'),

('STL-BF-BF201-001','FIT-201','Cooling Water Flow',438.4,'m3/h','GOOD','2026-04-02 14:10:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1206.7,'°C','GOOD','2026-04-02 14:10:00+00'),

('STL-BF-BF201-001','FIT-201','Cooling Water Flow',419.3,'m3/h','GOOD','2026-04-02 14:20:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1223.5,'°C','GOOD','2026-04-02 14:20:00+00'),

('STL-BF-BF201-001','FIT-201','Cooling Water Flow',401.7,'m3/h','GOOD','2026-04-02 14:30:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1238.8,'°C','GOOD','2026-04-02 14:30:00+00'),

('STL-BF-BF201-001','FIT-201','Cooling Water Flow',386.2,'m3/h','GOOD','2026-04-02 14:40:00+00'),
('STL-BF-BF201-001','TT-201','Hot Blast Temperature',1251.6,'°C','GOOD','2026-04-02 14:40:00+00'),

-- ============================================================
-- P-401 Hydraulic Pressure Failure
-- ============================================================

('STL-HYD-P401-001','HP-401','Hydraulic Pressure',210.8,'bar','GOOD','2026-06-08 09:00:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',49.6,'°C','GOOD','2026-06-08 09:00:00+00'),

('STL-HYD-P401-001','HP-401','Hydraulic Pressure',198.4,'bar','GOOD','2026-06-08 09:10:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',53.1,'°C','GOOD','2026-06-08 09:10:00+00'),

('STL-HYD-P401-001','HP-401','Hydraulic Pressure',182.7,'bar','GOOD','2026-06-08 09:20:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',58.7,'°C','GOOD','2026-06-08 09:20:00+00'),

('STL-HYD-P401-001','HP-401','Hydraulic Pressure',164.5,'bar','GOOD','2026-06-08 09:30:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',64.9,'°C','GOOD','2026-06-08 09:30:00+00'),

('STL-HYD-P401-001','HP-401','Hydraulic Pressure',149.8,'bar','GOOD','2026-06-08 09:40:00+00'),
('STL-HYD-P401-001','OT-401','Oil Temperature',71.8,'°C','GOOD','2026-06-08 09:40:00+00');

