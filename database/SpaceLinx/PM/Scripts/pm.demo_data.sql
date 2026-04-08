-- =============================================
-- Project Management Demo Data Script
-- SpaceLinx MES - PM Schema
-- =============================================
-- This script creates demo data for the Project Management module
-- including programs, projects, milestones, tasks, and related entities.
--
-- Prerequisites: application.staff and application.customer must have data
-- Run this after the main schema has been created
-- =============================================

-- =============================================
-- 1. CUSTOMERS (for program references)
-- =============================================
INSERT INTO application.customer (id, name, description, tax_number, category, is_active, created_by)
VALUES
    ('c0000001-0001-0001-0001-000000000001', 'NASA Goddard Space Flight Center', 'Primary customer for satellite components', 'NASA-GSFC-001', 'Government', TRUE, 'demo-script'),
    ('c0000001-0001-0001-0001-000000000002', 'European Space Agency (ESA)', 'European space exploration partner', 'ESA-EU-002', 'Government', TRUE, 'demo-script'),
    ('c0000001-0001-0001-0001-000000000003', 'SpaceX Commercial', 'Commercial launch services customer', 'SPACEX-COM-003', 'Commercial', TRUE, 'demo-script'),
    ('c0000001-0001-0001-0001-000000000004', 'Indian Space Research Organisation', 'ISRO satellite programs', 'ISRO-IN-004', 'Government', TRUE, 'demo-script')
ON CONFLICT (tax_number) DO NOTHING;

-- =============================================
-- 2. PROGRAMS
-- =============================================
-- Using existing staff IDs from the database
INSERT INTO pm.program (
    id, program_code, name, description, start_date, end_date,
    customer_id, program_manager_id, supply_chain_manager_id, buyer_id,
    status, goals, budget, actual_spend, is_active, created_by
)
VALUES
    -- Program 1: LEO Satellite Constellation
    (
        'p0000001-0001-0001-0001-000000000001',
        'PRG-000001',
        'LEO Satellite Constellation',
        'Development and deployment of a Low Earth Orbit satellite constellation for global communications coverage',
        '2024-01-15 00:00:00+00',
        '2026-12-31 00:00:00+00',
        'c0000001-0001-0001-0001-000000000001', -- NASA GSFC
        '6709c935-540d-4618-a546-cce69ee94438', -- Vineeth Reddy Katkuri - Technical Program Manager
        '1bec61dd-8e24-426f-b6b9-535121e42e77', -- Tarun Pandrangi - Global Supply Chain Manager
        'c2524e78-4bac-49b4-9cc2-89623505dc6c', -- Durga - Sr Executive SCM
        'Active',
        'Deploy 24 satellites in LEO orbit by Q4 2026. Achieve 99.5% uptime for global coverage.',
        25000000.00,
        8500000.00,
        TRUE,
        'demo-script'
    ),
    -- Program 2: Earth Observation Platform
    (
        'p0000001-0001-0001-0001-000000000002',
        'PRG-000002',
        'Earth Observation Platform',
        'High-resolution Earth imaging satellite platform for environmental monitoring and disaster response',
        '2024-06-01 00:00:00+00',
        '2027-06-30 00:00:00+00',
        'c0000001-0001-0001-0001-000000000004', -- ISRO
        '4a0130cf-6024-4881-b2f5-e3baae8e3fae', -- Vidhyuth Iyengar - Technical project manager
        '1bec61dd-8e24-426f-b6b9-535121e42e77', -- Tarun Pandrangi
        'a1fcf59d-9c32-4e44-a87a-266753fa3fa0', -- Amarnadh - Supply Chain Logistics
        'Active',
        'Develop imaging satellite with 0.5m resolution. Complete ground station integration.',
        15000000.00,
        3200000.00,
        TRUE,
        'demo-script'
    ),
    -- Program 3: Next-Gen Propulsion System
    (
        'p0000001-0001-0001-0001-000000000003',
        'PRG-000003',
        'Next-Gen Propulsion System',
        'Research and development of advanced electric propulsion systems for deep space missions',
        '2025-01-01 00:00:00+00',
        '2028-12-31 00:00:00+00',
        'c0000001-0001-0001-0001-000000000002', -- ESA
        '91cf89fe-561a-41b8-9051-eb5ba9f922e1', -- Karthik Govindasamy - Co-Founder
        '1bec61dd-8e24-426f-b6b9-535121e42e77', -- Tarun Pandrangi
        'c2524e78-4bac-49b4-9cc2-89623505dc6c', -- Durga
        'Planning',
        'Achieve 50% improvement in specific impulse over current ion thrusters. Complete qualification testing.',
        35000000.00,
        0.00,
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- Update sequences to avoid conflicts
SELECT setval('pm.program_code_seq', 10, false);

-- =============================================
-- 3. PROJECTS
-- =============================================
INSERT INTO pm.project (
    id, project_code, name, description, program_id, project_manager_id,
    start_date, end_date, status, budget, is_active, created_by
)
VALUES
    -- Projects for LEO Satellite Constellation
    (
        'pj000001-0001-0001-0001-000000000001',
        'PRJ-000001',
        'Satellite Bus Development',
        'Design and manufacture of the standardized satellite bus platform for the constellation',
        'p0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh S - Mechanical Design Engineer
        '2024-01-15 00:00:00+00',
        '2025-06-30 00:00:00+00',
        'Active',
        8000000.00,
        TRUE,
        'demo-script'
    ),
    (
        'pj000001-0001-0001-0001-000000000002',
        'PRJ-000002',
        'Communication Payload',
        'Development of the Ku-band communication payload with phased array antenna',
        'p0000001-0001-0001-0001-000000000001',
        '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de', -- Rambabu N - Senior RF engineer
        '2024-03-01 00:00:00+00',
        '2025-09-30 00:00:00+00',
        'Active',
        6000000.00,
        TRUE,
        'demo-script'
    ),
    (
        'pj000001-0001-0001-0001-000000000003',
        'PRJ-000003',
        'Ground Segment Integration',
        'Setup and integration of ground control stations and mission operations center',
        'p0000001-0001-0001-0001-000000000001',
        '081e970a-36e4-4822-b269-2071edc7a29d', -- Abhishek Sajjanar - Software Engineer
        '2024-06-01 00:00:00+00',
        '2025-12-31 00:00:00+00',
        'Active',
        4000000.00,
        TRUE,
        'demo-script'
    ),
    -- Projects for Earth Observation Platform
    (
        'pj000001-0001-0001-0001-000000000004',
        'PRJ-000004',
        'Imaging Sensor Development',
        'Design and fabrication of high-resolution optical imaging sensors',
        'p0000001-0001-0001-0001-000000000002',
        '27cdb950-8c01-4dd3-8713-e03a1e43c568', -- Suraj Singh - Optical Engineer
        '2024-06-01 00:00:00+00',
        '2026-03-31 00:00:00+00',
        'Active',
        7500000.00,
        TRUE,
        'demo-script'
    ),
    (
        'pj000001-0001-0001-0001-000000000005',
        'PRJ-000005',
        'Data Processing Pipeline',
        'Development of the image processing and distribution pipeline',
        'p0000001-0001-0001-0001-000000000002',
        '081e970a-36e4-4822-b269-2071edc7a29d', -- Abhishek Sajjanar
        '2024-09-01 00:00:00+00',
        '2026-06-30 00:00:00+00',
        'Planning',
        3500000.00,
        TRUE,
        'demo-script'
    ),
    -- Projects for Propulsion System
    (
        'pj000001-0001-0001-0001-000000000006',
        'PRJ-000006',
        'Ion Thruster Prototype',
        'Design and testing of advanced gridded ion thruster',
        'p0000001-0001-0001-0001-000000000003',
        '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora - Director Electrical Systems
        '2025-01-01 00:00:00+00',
        '2027-06-30 00:00:00+00',
        'Planning',
        18000000.00,
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- Update sequences to avoid conflicts
SELECT setval('pm.project_code_seq', 10, false);

-- =============================================
-- 4. BOARD COLUMNS (Kanban boards for each project)
-- =============================================
-- Create default board columns for each project
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000001', 'demo-script');
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000002', 'demo-script');
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000003', 'demo-script');
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000004', 'demo-script');
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000005', 'demo-script');
SELECT pm.create_default_board_columns('pj000001-0001-0001-0001-000000000006', 'demo-script');

-- =============================================
-- 5. MILESTONES
-- =============================================
INSERT INTO pm.milestone (
    id, name, description, project_id, target_date, status, is_active, created_by
)
VALUES
    -- Milestones for Satellite Bus Development
    (
        'm0000001-0001-0001-0001-000000000001',
        'Preliminary Design Review (PDR)',
        'Complete preliminary design documentation and stakeholder approval',
        'pj000001-0001-0001-0001-000000000001',
        '2024-04-30 00:00:00+00',
        'Completed',
        TRUE,
        'demo-script'
    ),
    (
        'm0000001-0001-0001-0001-000000000002',
        'Critical Design Review (CDR)',
        'Final design freeze and manufacturing readiness review',
        'pj000001-0001-0001-0001-000000000001',
        '2024-09-30 00:00:00+00',
        'In Progress',
        TRUE,
        'demo-script'
    ),
    (
        'm0000001-0001-0001-0001-000000000003',
        'Engineering Model Complete',
        'First engineering model assembled and tested',
        'pj000001-0001-0001-0001-000000000001',
        '2025-03-31 00:00:00+00',
        'To Do',
        TRUE,
        'demo-script'
    ),
    -- Milestones for Communication Payload
    (
        'm0000001-0001-0001-0001-000000000004',
        'Antenna Array Prototype',
        'Phased array antenna prototype complete and tested',
        'pj000001-0001-0001-0001-000000000002',
        '2024-08-31 00:00:00+00',
        'Completed',
        TRUE,
        'demo-script'
    ),
    (
        'm0000001-0001-0001-0001-000000000005',
        'RF Chain Integration',
        'Complete RF chain integration with flight electronics',
        'pj000001-0001-0001-0001-000000000002',
        '2025-02-28 00:00:00+00',
        'In Progress',
        TRUE,
        'demo-script'
    ),
    -- Milestones for Ground Segment
    (
        'm0000001-0001-0001-0001-000000000006',
        'Ground Station Site Selection',
        'Complete site selection and regulatory approval',
        'pj000001-0001-0001-0001-000000000003',
        '2024-09-30 00:00:00+00',
        'Completed',
        TRUE,
        'demo-script'
    ),
    (
        'm0000001-0001-0001-0001-000000000007',
        'Mission Control Software Alpha',
        'Alpha release of mission control software',
        'pj000001-0001-0001-0001-000000000003',
        '2025-03-31 00:00:00+00',
        'In Progress',
        TRUE,
        'demo-script'
    ),
    -- Milestones for Imaging Sensor
    (
        'm0000001-0001-0001-0001-000000000008',
        'Sensor Chip Fabrication',
        'Complete CCD sensor chip fabrication and characterization',
        'pj000001-0001-0001-0001-000000000004',
        '2025-03-31 00:00:00+00',
        'In Progress',
        TRUE,
        'demo-script'
    ),
    (
        'm0000001-0001-0001-0001-000000000009',
        'Optical Assembly Integration',
        'Integrate optical assembly with sensor and electronics',
        'pj000001-0001-0001-0001-000000000004',
        '2025-09-30 00:00:00+00',
        'To Do',
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 6. TASKS
-- =============================================
-- Get board column IDs for task assignment (we'll use position-based selection)
DO $$
DECLARE
    v_todo_col_1 UUID;
    v_inprogress_col_1 UUID;
    v_review_col_1 UUID;
    v_done_col_1 UUID;
    v_todo_col_2 UUID;
    v_inprogress_col_2 UUID;
BEGIN
    -- Get board columns for project 1
    SELECT id INTO v_todo_col_1 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000001' AND position = 0 LIMIT 1;
    SELECT id INTO v_inprogress_col_1 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000001' AND position = 1 LIMIT 1;
    SELECT id INTO v_review_col_1 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000001' AND position = 2 LIMIT 1;
    SELECT id INTO v_done_col_1 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000001' AND position = 3 LIMIT 1;

    -- Get board columns for project 2
    SELECT id INTO v_todo_col_2 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000002' AND position = 0 LIMIT 1;
    SELECT id INTO v_inprogress_col_2 FROM pm.board_column WHERE project_id = 'pj000001-0001-0001-0001-000000000002' AND position = 1 LIMIT 1;

    -- Insert tasks for Satellite Bus Development (Project 1)
    INSERT INTO pm.task (
        id, task_code, name, description, project_id, assigned_to_id, milestone_id,
        status, due_date, priority, start_date, estimated_hours, actual_hours,
        progress_percent, task_type, sort_order, board_column_id, is_active, created_by
    )
    VALUES
        -- Parent Task 1: Structural Design
        (
            't0000001-0001-0001-0001-000000000001',
            'TSK-000001',
            'Structural Design Package',
            'Complete structural design including primary and secondary structure, mounting interfaces, and thermal paths',
            'pj000001-0001-0001-0001-000000000001',
            '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh S
            'm0000001-0001-0001-0001-000000000002', -- CDR milestone
            'In Progress',
            '2024-08-31 00:00:00+00',
            'High',
            '2024-05-01 00:00:00+00',
            320.00,
            180.00,
            55,
            'Task',
            1,
            v_inprogress_col_1,
            TRUE,
            'demo-script'
        ),
        -- Subtask 1.1
        (
            't0000001-0001-0001-0001-000000000002',
            'TSK-000002',
            'Primary Structure FEA Analysis',
            'Finite element analysis of primary load-bearing structure under launch and operational loads',
            'pj000001-0001-0001-0001-000000000001',
            '84875ef8-df6f-4a8d-9074-7f8e39a7201a', -- Hemanth - Mechanical Design Engineer
            'm0000001-0001-0001-0001-000000000002',
            'Completed',
            '2024-06-30 00:00:00+00',
            'High',
            '2024-05-01 00:00:00+00',
            80.00,
            92.00,
            100,
            'SubTask',
            1,
            v_done_col_1,
            TRUE,
            'demo-script'
        ),
        -- Subtask 1.2
        (
            't0000001-0001-0001-0001-000000000003',
            'TSK-000003',
            'Thermal Interface Design',
            'Design thermal interfaces between components and radiator panels',
            'pj000001-0001-0001-0001-000000000001',
            '3315a9e7-af12-402b-b139-cbe716b1de77', -- Aditya CVN - Thermal Engineer
            'm0000001-0001-0001-0001-000000000002',
            'In Progress',
            '2024-07-31 00:00:00+00',
            'High',
            '2024-06-01 00:00:00+00',
            120.00,
            65.00,
            50,
            'SubTask',
            2,
            v_inprogress_col_1,
            TRUE,
            'demo-script'
        ),
        -- Subtask 1.3
        (
            't0000001-0001-0001-0001-000000000004',
            'TSK-000004',
            'Mounting Interface Specifications',
            'Define mounting interfaces for all payloads and subsystems',
            'pj000001-0001-0001-0001-000000000001',
            'd0f3d90f-b75d-4c52-b8ad-edf599c1a287', -- Abhishek Ghadi - Mechanical Design
            'm0000001-0001-0001-0001-000000000002',
            'To Do',
            '2024-08-15 00:00:00+00',
            'Medium',
            '2024-07-15 00:00:00+00',
            60.00,
            0.00,
            0,
            'SubTask',
            3,
            v_todo_col_1,
            TRUE,
            'demo-script'
        ),

        -- Parent Task 2: Power System Design
        (
            't0000001-0001-0001-0001-000000000005',
            'TSK-000005',
            'Electrical Power System Design',
            'Design EPS including solar arrays, batteries, power distribution, and regulation',
            'pj000001-0001-0001-0001-000000000001',
            '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora - Director Electrical Systems
            'm0000001-0001-0001-0001-000000000002',
            'In Progress',
            '2024-09-15 00:00:00+00',
            'High',
            '2024-05-15 00:00:00+00',
            400.00,
            210.00,
            48,
            'Task',
            2,
            v_inprogress_col_1,
            TRUE,
            'demo-script'
        ),
        -- Subtask 2.1
        (
            't0000001-0001-0001-0001-000000000006',
            'TSK-000006',
            'Solar Array Sizing Analysis',
            'Perform power budget analysis and size solar arrays for mission requirements',
            'pj000001-0001-0001-0001-000000000001',
            '9b809c14-d3ca-4668-a018-048cc4f161ec', -- Ashesh - Power Electronics Engineer
            'm0000001-0001-0001-0001-000000000002',
            'Completed',
            '2024-06-15 00:00:00+00',
            'High',
            '2024-05-15 00:00:00+00',
            60.00,
            55.00,
            100,
            'SubTask',
            1,
            v_done_col_1,
            TRUE,
            'demo-script'
        ),
        -- Subtask 2.2
        (
            't0000001-0001-0001-0001-000000000007',
            'TSK-000007',
            'Battery Selection and Testing',
            'Select and qualify batteries for space environment operation',
            'pj000001-0001-0001-0001-000000000001',
            'ad17e8f1-1706-422e-a5e1-3ef06ef72ff8', -- Amar Tolani - Power Electronics
            'm0000001-0001-0001-0001-000000000002',
            'In Progress',
            '2024-08-31 00:00:00+00',
            'High',
            '2024-06-15 00:00:00+00',
            160.00,
            95.00,
            55,
            'SubTask',
            2,
            v_inprogress_col_1,
            TRUE,
            'demo-script'
        ),

        -- Parent Task 3: ADCS Design
        (
            't0000001-0001-0001-0001-000000000008',
            'TSK-000008',
            'Attitude Determination and Control System',
            'Design ADCS including sensors, actuators, and control algorithms',
            'pj000001-0001-0001-0001-000000000001',
            'b5cc9f99-b57e-4358-bd05-ed65ad7135c2', -- Vishish Behara - ADCS Engineer
            'm0000001-0001-0001-0001-000000000003',
            'To Do',
            '2024-12-31 00:00:00+00',
            'High',
            '2024-09-01 00:00:00+00',
            480.00,
            0.00,
            0,
            'Task',
            3,
            v_todo_col_1,
            TRUE,
            'demo-script'
        ),

        -- Completed Task
        (
            't0000001-0001-0001-0001-000000000009',
            'TSK-000009',
            'Requirements Document',
            'Complete system requirements document and stakeholder review',
            'pj000001-0001-0001-0001-000000000001',
            '4a0130cf-6024-4881-b2f5-e3baae8e3fae', -- Vidhyuth - Technical PM
            'm0000001-0001-0001-0001-000000000001', -- PDR
            'Completed',
            '2024-03-31 00:00:00+00',
            'High',
            '2024-01-15 00:00:00+00',
            120.00,
            135.00,
            100,
            'Task',
            0,
            v_done_col_1,
            TRUE,
            'demo-script'
        ),

        -- Review Task
        (
            't0000001-0001-0001-0001-000000000010',
            'TSK-000010',
            'Mass Budget Reconciliation',
            'Reconcile mass budget with latest component specifications',
            'pj000001-0001-0001-0001-000000000001',
            '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
            'm0000001-0001-0001-0001-000000000002',
            'Logged',
            '2024-07-20 00:00:00+00',
            'Medium',
            '2024-07-01 00:00:00+00',
            24.00,
            22.00,
            90,
            'Task',
            4,
            v_review_col_1,
            TRUE,
            'demo-script'
        )
    ON CONFLICT (id) DO NOTHING;

    -- Insert tasks for Communication Payload (Project 2)
    INSERT INTO pm.task (
        id, task_code, name, description, project_id, assigned_to_id, milestone_id,
        status, due_date, priority, start_date, estimated_hours, actual_hours,
        progress_percent, task_type, sort_order, board_column_id, is_active, created_by
    )
    VALUES
        (
            't0000001-0001-0001-0001-000000000011',
            'TSK-000011',
            'Phased Array Antenna Design',
            'Design Ku-band phased array antenna with beam steering capability',
            'pj000001-0001-0001-0001-000000000002',
            '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de', -- Rambabu - Senior RF Engineer
            'm0000001-0001-0001-0001-000000000004',
            'Completed',
            '2024-07-31 00:00:00+00',
            'High',
            '2024-03-01 00:00:00+00',
            280.00,
            310.00,
            100,
            'Task',
            1,
            NULL, -- Will be set below
            TRUE,
            'demo-script'
        ),
        (
            't0000001-0001-0001-0001-000000000012',
            'TSK-000012',
            'RF Front-End Development',
            'Develop RF front-end including LNA, filters, and mixers',
            'pj000001-0001-0001-0001-000000000002',
            '7a457b4e-827c-4387-8789-75a4f129db25', -- Aishwarya - RF Engineer
            'm0000001-0001-0001-0001-000000000005',
            'In Progress',
            '2024-12-31 00:00:00+00',
            'High',
            '2024-08-01 00:00:00+00',
            320.00,
            145.00,
            40,
            'Task',
            2,
            v_inprogress_col_2,
            TRUE,
            'demo-script'
        ),
        (
            't0000001-0001-0001-0001-000000000013',
            'TSK-000013',
            'Digital Signal Processing Board',
            'Design and fabricate DSP board for signal modulation/demodulation',
            'pj000001-0001-0001-0001-000000000002',
            '5ea57a39-d7a2-4cc5-87a6-3c19a26b58e6', -- Suryanarayana - FPGA Engineer
            'm0000001-0001-0001-0001-000000000005',
            'To Do',
            '2025-01-31 00:00:00+00',
            'High',
            '2024-10-01 00:00:00+00',
            400.00,
            0.00,
            0,
            'Task',
            3,
            v_todo_col_2,
            TRUE,
            'demo-script'
        ),
        (
            't0000001-0001-0001-0001-000000000014',
            'TSK-000014',
            'EMI/EMC Testing',
            'Conduct electromagnetic interference and compatibility testing',
            'pj000001-0001-0001-0001-000000000002',
            '59ea1afc-049f-4288-80e0-b63eb540e3da', -- Akshat - Test Engineer
            'm0000001-0001-0001-0001-000000000005',
            'To Do',
            '2025-02-15 00:00:00+00',
            'Medium',
            '2025-01-15 00:00:00+00',
            80.00,
            0.00,
            0,
            'Task',
            4,
            v_todo_col_2,
            TRUE,
            'demo-script'
        )
    ON CONFLICT (id) DO NOTHING;

    -- Set parent task relationships
    UPDATE pm.task SET parent_task_id = 't0000001-0001-0001-0001-000000000001'
    WHERE id IN ('t0000001-0001-0001-0001-000000000002', 't0000001-0001-0001-0001-000000000003', 't0000001-0001-0001-0001-000000000004');

    UPDATE pm.task SET parent_task_id = 't0000001-0001-0001-0001-000000000005'
    WHERE id IN ('t0000001-0001-0001-0001-000000000006', 't0000001-0001-0001-0001-000000000007');

END $$;

-- Update task sequences
SELECT setval('pm.task_code_seq', 20, false);

-- =============================================
-- 7. TASK ASSIGNEES (Multiple assignees per task)
-- =============================================
INSERT INTO pm.task_assignee (
    id, task_id, staff_id, assignee_role, assigned_at, is_active, created_by
)
VALUES
    -- Structural Design - Primary and Reviewers
    (
        'ta000001-0001-0001-0001-000000000001',
        't0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
        'Primary',
        '2024-05-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000002',
        't0000001-0001-0001-0001-000000000001',
        '4a0130cf-6024-4881-b2f5-e3baae8e3fae', -- Vidhyuth - reviewer
        'Reviewer',
        '2024-05-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000003',
        't0000001-0001-0001-0001-000000000001',
        '91cf89fe-561a-41b8-9051-eb5ba9f922e1', -- Karthik - watcher
        'Watcher',
        '2024-05-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    -- EPS Design - Multiple assignees
    (
        'ta000001-0001-0001-0001-000000000004',
        't0000001-0001-0001-0001-000000000005',
        '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora
        'Primary',
        '2024-05-15 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000005',
        't0000001-0001-0001-0001-000000000005',
        '9b809c14-d3ca-4668-a018-048cc4f161ec', -- Ashesh
        'Secondary',
        '2024-05-15 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000006',
        't0000001-0001-0001-0001-000000000005',
        'ad17e8f1-1706-422e-a5e1-3ef06ef72ff8', -- Amar Tolani
        'Secondary',
        '2024-05-15 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    -- ADCS Design
    (
        'ta000001-0001-0001-0001-000000000007',
        't0000001-0001-0001-0001-000000000008',
        'b5cc9f99-b57e-4358-bd05-ed65ad7135c2', -- Vishish
        'Primary',
        '2024-08-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000008',
        't0000001-0001-0001-0001-000000000008',
        '2f9667f0-4c14-4bc0-ad8d-7357c0011c6e', -- Gavin - GNC
        'Secondary',
        '2024-08-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    -- RF Front-End
    (
        'ta000001-0001-0001-0001-000000000009',
        't0000001-0001-0001-0001-000000000012',
        '7a457b4e-827c-4387-8789-75a4f129db25', -- Aishwarya
        'Primary',
        '2024-08-01 00:00:00+00',
        TRUE,
        'demo-script'
    ),
    (
        'ta000001-0001-0001-0001-000000000010',
        't0000001-0001-0001-0001-000000000012',
        '4707a088-b01e-4b8d-8726-be282167597c', -- Sasank - RF System Engineer
        'Secondary',
        '2024-08-01 00:00:00+00',
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 8. TASK DEPENDENCIES
-- =============================================
INSERT INTO pm.task_dependency (
    id, predecessor_task_id, successor_task_id, dependency_type, lag_days, is_active, created_by
)
VALUES
    -- FEA must complete before Mounting Interface can start (Finish-to-Start)
    (
        'td000001-0001-0001-0001-000000000001',
        't0000001-0001-0001-0001-000000000002', -- FEA Analysis
        't0000001-0001-0001-0001-000000000004', -- Mounting Interface
        'FS',
        0,
        TRUE,
        'demo-script'
    ),
    -- Solar Array Sizing must complete before Battery Selection (FS with 5 day lag)
    (
        'td000001-0001-0001-0001-000000000002',
        't0000001-0001-0001-0001-000000000006', -- Solar Array Sizing
        't0000001-0001-0001-0001-000000000007', -- Battery Selection
        'FS',
        5,
        TRUE,
        'demo-script'
    ),
    -- Requirements must complete before Structural Design can start
    (
        'td000001-0001-0001-0001-000000000003',
        't0000001-0001-0001-0001-000000000009', -- Requirements
        't0000001-0001-0001-0001-000000000001', -- Structural Design
        'FS',
        0,
        TRUE,
        'demo-script'
    ),
    -- Requirements must complete before EPS Design can start
    (
        'td000001-0001-0001-0001-000000000004',
        't0000001-0001-0001-0001-000000000009', -- Requirements
        't0000001-0001-0001-0001-000000000005', -- EPS Design
        'FS',
        0,
        TRUE,
        'demo-script'
    ),
    -- Structural and EPS must both complete before ADCS (both are predecessors)
    (
        'td000001-0001-0001-0001-000000000005',
        't0000001-0001-0001-0001-000000000001', -- Structural Design
        't0000001-0001-0001-0001-000000000008', -- ADCS
        'FS',
        7,
        TRUE,
        'demo-script'
    ),
    (
        'td000001-0001-0001-0001-000000000006',
        't0000001-0001-0001-0001-000000000005', -- EPS Design
        't0000001-0001-0001-0001-000000000008', -- ADCS
        'FS',
        7,
        TRUE,
        'demo-script'
    ),
    -- Antenna Design must complete before RF Front-End
    (
        'td000001-0001-0001-0001-000000000007',
        't0000001-0001-0001-0001-000000000011', -- Antenna Design
        't0000001-0001-0001-0001-000000000012', -- RF Front-End
        'FS',
        0,
        TRUE,
        'demo-script'
    ),
    -- RF Front-End must complete before DSP Board (Start-to-Start with lag for parallel work)
    (
        'td000001-0001-0001-0001-000000000008',
        't0000001-0001-0001-0001-000000000012', -- RF Front-End
        't0000001-0001-0001-0001-000000000013', -- DSP Board
        'SS',
        30,
        TRUE,
        'demo-script'
    ),
    -- DSP Board must complete before EMI Testing
    (
        'td000001-0001-0001-0001-000000000009',
        't0000001-0001-0001-0001-000000000013', -- DSP Board
        't0000001-0001-0001-0001-000000000014', -- EMI Testing
        'FS',
        3,
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 9. TASK COMMENTS
-- =============================================
INSERT INTO pm.task_comment (
    id, task_id, parent_comment_id, content, mentions, is_active, created_at, created_by
)
VALUES
    -- Comments on Structural Design task
    (
        'tc000001-0001-0001-0001-000000000001',
        't0000001-0001-0001-0001-000000000001',
        NULL,
        'Initial structural concept looks good. We need to ensure 15% margin on all load cases as per customer requirement.',
        '[]',
        TRUE,
        '2024-05-05 10:30:00+00',
        'Vidhyuth Iyengar'
    ),
    (
        'tc000001-0001-0001-0001-000000000002',
        't0000001-0001-0001-0001-000000000001',
        'tc000001-0001-0001-0001-000000000001', -- Reply to first comment
        'Agreed. I have updated the FEA models to include the 15% margin. @Krishna Dora - can you review the thermal load cases?',
        '["16d2e499-943f-4ae4-98a1-18dae3822b30"]',
        TRUE,
        '2024-05-06 14:15:00+00',
        'Santhosh S'
    ),
    (
        'tc000001-0001-0001-0001-000000000003',
        't0000001-0001-0001-0001-000000000001',
        'tc000001-0001-0001-0001-000000000002', -- Reply to second comment
        'Reviewed the thermal cases. Looks good, but we need to add the eclipse transition case. I will update the thermal model.',
        '[]',
        TRUE,
        '2024-05-07 09:45:00+00',
        'Krishna Dora'
    ),
    -- Comments on Battery Selection task
    (
        'tc000001-0001-0001-0001-000000000004',
        't0000001-0001-0001-0001-000000000007',
        NULL,
        'We have three battery options from vendors: Option A (Li-ion), Option B (LiFePO4), and Option C (Li-polymer). Scheduling trade study review for next week.',
        '[]',
        TRUE,
        '2024-06-20 11:00:00+00',
        'Amar Tolani'
    ),
    (
        'tc000001-0001-0001-0001-000000000005',
        't0000001-0001-0001-0001-000000000007',
        'tc000001-0001-0001-0001-000000000004',
        '@Ashesh Can you prepare the comparison matrix before the review? Focus on cycle life, temperature range, and specific energy.',
        '["9b809c14-d3ca-4668-a018-048cc4f161ec"]',
        TRUE,
        '2024-06-20 14:30:00+00',
        'Krishna Dora'
    ),
    (
        'tc000001-0001-0001-0001-000000000006',
        't0000001-0001-0001-0001-000000000007',
        'tc000001-0001-0001-0001-000000000005',
        'Comparison matrix is ready. Option A shows best overall performance for our mission profile. See attached document.',
        '[]',
        TRUE,
        '2024-06-25 16:00:00+00',
        'Ashesh Chand Rai'
    ),
    -- Comments on Phased Array task
    (
        'tc000001-0001-0001-0001-000000000007',
        't0000001-0001-0001-0001-000000000011',
        NULL,
        'Prototype testing complete! Achieved 25 dBi gain with ±60° scan range. This exceeds our requirements.',
        '[]',
        TRUE,
        '2024-07-28 17:30:00+00',
        'Rambabu Nallajeru'
    ),
    (
        'tc000001-0001-0001-0001-000000000008',
        't0000001-0001-0001-0001-000000000011',
        'tc000001-0001-0001-0001-000000000007',
        'Excellent work team! This is a major milestone. @Vineeth please update the program status report.',
        '["6709c935-540d-4618-a546-cce69ee94438"]',
        TRUE,
        '2024-07-29 09:00:00+00',
        'Karthik Govindasamy'
    ),
    -- Comment on RF Front-End
    (
        'tc000001-0001-0001-0001-000000000009',
        't0000001-0001-0001-0001-000000000012',
        NULL,
        'Starting component procurement. Some RF components have 12-week lead time. Need to order this week to stay on schedule.',
        '[]',
        TRUE,
        '2024-08-05 10:00:00+00',
        'Aishwarya Chaudhary'
    ),
    (
        'tc000001-0001-0001-0001-000000000010',
        't0000001-0001-0001-0001-000000000012',
        'tc000001-0001-0001-0001-000000000009',
        '@Tarun Please expedite PO for the GaAs LNAs and mixer ICs. Critical path items.',
        '["1bec61dd-8e24-426f-b6b9-535121e42e77"]',
        TRUE,
        '2024-08-05 11:30:00+00',
        'Rambabu Nallajeru'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 10. TASK ACTIVITIES (Audit trail)
-- =============================================
INSERT INTO pm.task_activity (
    id, task_id, activity_type, field_changed, old_value, new_value, description, created_at, created_by
)
VALUES
    -- Activities for Structural Design task
    (
        'tact0001-0001-0001-0001-000000000001',
        't0000001-0001-0001-0001-000000000001',
        'Created',
        NULL, NULL, NULL,
        'Task created',
        '2024-05-01 08:00:00+00',
        'Vidhyuth Iyengar'
    ),
    (
        'tact0001-0001-0001-0001-000000000002',
        't0000001-0001-0001-0001-000000000001',
        'AssigneeAdded',
        'assigned_to_id',
        NULL,
        'Santhosh S',
        'Assigned to Santhosh S',
        '2024-05-01 08:05:00+00',
        'Vidhyuth Iyengar'
    ),
    (
        'tact0001-0001-0001-0001-000000000003',
        't0000001-0001-0001-0001-000000000001',
        'StatusChanged',
        'status',
        'To Do',
        'In Progress',
        'Status changed from To Do to In Progress',
        '2024-05-02 09:00:00+00',
        'Santhosh S'
    ),
    (
        'tact0001-0001-0001-0001-000000000004',
        't0000001-0001-0001-0001-000000000001',
        'ProgressChanged',
        'progress_percent',
        '0',
        '25',
        'Progress updated to 25%',
        '2024-05-15 16:00:00+00',
        'Santhosh S'
    ),
    (
        'tact0001-0001-0001-0001-000000000005',
        't0000001-0001-0001-0001-000000000001',
        'CommentAdded',
        NULL, NULL, NULL,
        'Comment added',
        '2024-05-05 10:30:00+00',
        'Vidhyuth Iyengar'
    ),
    (
        'tact0001-0001-0001-0001-000000000006',
        't0000001-0001-0001-0001-000000000001',
        'ProgressChanged',
        'progress_percent',
        '25',
        '55',
        'Progress updated to 55%',
        '2024-06-30 17:00:00+00',
        'Santhosh S'
    ),
    -- Activities for FEA task
    (
        'tact0001-0001-0001-0001-000000000007',
        't0000001-0001-0001-0001-000000000002',
        'Created',
        NULL, NULL, NULL,
        'Task created',
        '2024-05-01 08:30:00+00',
        'Santhosh S'
    ),
    (
        'tact0001-0001-0001-0001-000000000008',
        't0000001-0001-0001-0001-000000000002',
        'StatusChanged',
        'status',
        'In Progress',
        'Completed',
        'Status changed from In Progress to Completed',
        '2024-06-28 18:00:00+00',
        'Hemanth Surya Kiran'
    ),
    -- Activities for Battery Selection task
    (
        'tact0001-0001-0001-0001-000000000009',
        't0000001-0001-0001-0001-000000000007',
        'Created',
        NULL, NULL, NULL,
        'Task created',
        '2024-06-15 10:00:00+00',
        'Krishna Dora'
    ),
    (
        'tact0001-0001-0001-0001-000000000010',
        't0000001-0001-0001-0001-000000000007',
        'DependencyAdded',
        NULL,
        NULL,
        'Solar Array Sizing',
        'Dependency added: Solar Array Sizing (FS)',
        '2024-06-15 10:05:00+00',
        'Krishna Dora'
    ),
    (
        'tact0001-0001-0001-0001-000000000011',
        't0000001-0001-0001-0001-000000000007',
        'PriorityChanged',
        'priority',
        'Medium',
        'High',
        'Priority changed from Medium to High',
        '2024-06-20 09:00:00+00',
        'Vidhyuth Iyengar'
    ),
    -- Activities for Antenna Design task (completed)
    (
        'tact0001-0001-0001-0001-000000000012',
        't0000001-0001-0001-0001-000000000011',
        'StatusChanged',
        'status',
        'In Progress',
        'Completed',
        'Status changed from In Progress to Completed',
        '2024-07-28 17:00:00+00',
        'Rambabu Nallajeru'
    ),
    -- Time logged activities
    (
        'tact0001-0001-0001-0001-000000000013',
        't0000001-0001-0001-0001-000000000003',
        'TimeLogged',
        'actual_hours',
        '58',
        '65',
        '7 hours logged by Aditya CVN',
        '2024-07-15 18:00:00+00',
        'Aditya CVN'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 11. RESOURCE ALLOCATIONS
-- =============================================
INSERT INTO pm.resource_allocation (
    id, staff_id, project_id, task_id, start_date, end_date,
    allocated_hours_per_day, allocation_percent, allocation_type, notes, is_active, created_by
)
VALUES
    -- Santhosh - Full time on Satellite Bus
    (
        'ra000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
        'pj000001-0001-0001-0001-000000000001', -- Satellite Bus
        NULL,
        '2024-05-01',
        '2025-06-30',
        8.0,
        100,
        'Project',
        'Lead structural engineer for satellite bus development',
        TRUE,
        'demo-script'
    ),
    -- Krishna Dora - Split between Satellite Bus and Propulsion
    (
        'ra000001-0001-0001-0001-000000000002',
        '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora
        'pj000001-0001-0001-0001-000000000001', -- Satellite Bus
        't0000001-0001-0001-0001-000000000005', -- EPS Design task
        '2024-05-15',
        '2024-12-31',
        4.0,
        50,
        'Task',
        'EPS design lead',
        TRUE,
        'demo-script'
    ),
    (
        'ra000001-0001-0001-0001-000000000003',
        '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora
        'pj000001-0001-0001-0001-000000000006', -- Ion Thruster
        NULL,
        '2025-01-01',
        '2027-06-30',
        4.0,
        50,
        'Project',
        'Propulsion system electrical lead',
        TRUE,
        'demo-script'
    ),
    -- Rambabu - Communication Payload full time
    (
        'ra000001-0001-0001-0001-000000000004',
        '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de', -- Rambabu
        'pj000001-0001-0001-0001-000000000002', -- Communication Payload
        NULL,
        '2024-03-01',
        '2025-09-30',
        8.0,
        100,
        'Project',
        'RF systems lead',
        TRUE,
        'demo-script'
    ),
    -- Aishwarya - Communication Payload
    (
        'ra000001-0001-0001-0001-000000000005',
        '7a457b4e-827c-4387-8789-75a4f129db25', -- Aishwarya
        'pj000001-0001-0001-0001-000000000002', -- Communication Payload
        't0000001-0001-0001-0001-000000000012', -- RF Front-End task
        '2024-08-01',
        '2025-03-31',
        8.0,
        100,
        'Task',
        'RF front-end development',
        TRUE,
        'demo-script'
    ),
    -- Vishish - ADCS allocation
    (
        'ra000001-0001-0001-0001-000000000006',
        'b5cc9f99-b57e-4358-bd05-ed65ad7135c2', -- Vishish
        'pj000001-0001-0001-0001-000000000001', -- Satellite Bus
        't0000001-0001-0001-0001-000000000008', -- ADCS task
        '2024-09-01',
        '2025-03-31',
        8.0,
        100,
        'Task',
        'ADCS design and implementation',
        TRUE,
        'demo-script'
    ),
    -- Suraj - Imaging Sensor
    (
        'ra000001-0001-0001-0001-000000000007',
        '27cdb950-8c01-4dd3-8713-e03a1e43c568', -- Suraj
        'pj000001-0001-0001-0001-000000000004', -- Imaging Sensor
        NULL,
        '2024-06-01',
        '2026-03-31',
        8.0,
        100,
        'Project',
        'Optical systems lead',
        TRUE,
        'demo-script'
    ),
    -- Training allocation example
    (
        'ra000001-0001-0001-0001-000000000008',
        '081e970a-36e4-4822-b269-2071edc7a29d', -- Abhishek Sajjanar
        NULL,
        NULL,
        '2024-07-15',
        '2024-07-19',
        8.0,
        100,
        'Training',
        'AWS Solutions Architect certification training',
        TRUE,
        'demo-script'
    ),
    -- Leave allocation example
    (
        'ra000001-0001-0001-0001-000000000009',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
        NULL,
        NULL,
        '2024-12-23',
        '2025-01-03',
        8.0,
        100,
        'Leave',
        'Holiday leave',
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 12. TIME ENTRIES
-- =============================================
INSERT INTO pm.time_entry (
    id, task_id, staff_id, entry_date, hours_worked, description, billable, work_type, is_active, created_by
)
VALUES
    -- Time entries for Structural Design task
    (
        'te000001-0001-0001-0001-000000000001',
        't0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
        '2024-05-02',
        8.0,
        'Initial structural concept development and load case definition',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000002',
        't0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf',
        '2024-05-03',
        7.5,
        'CAD modeling of primary structure',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000003',
        't0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf',
        '2024-05-06',
        8.0,
        'Interface definition with thermal subsystem',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    -- Time entries for FEA Analysis
    (
        'te000001-0001-0001-0001-000000000004',
        't0000001-0001-0001-0001-000000000002',
        '84875ef8-df6f-4a8d-9074-7f8e39a7201a', -- Hemanth
        '2024-05-08',
        8.0,
        'FEA model setup and mesh generation',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000005',
        't0000001-0001-0001-0001-000000000002',
        '84875ef8-df6f-4a8d-9074-7f8e39a7201a',
        '2024-05-09',
        8.0,
        'Launch load simulation runs',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000006',
        't0000001-0001-0001-0001-000000000002',
        '84875ef8-df6f-4a8d-9074-7f8e39a7201a',
        '2024-05-10',
        6.0,
        'Results analysis and documentation',
        TRUE,
        'Documentation',
        TRUE,
        'demo-script'
    ),
    -- Time entries for Thermal Interface
    (
        'te000001-0001-0001-0001-000000000007',
        't0000001-0001-0001-0001-000000000003',
        '3315a9e7-af12-402b-b139-cbe716b1de77', -- Aditya CVN
        '2024-06-05',
        8.0,
        'Thermal model development',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000008',
        't0000001-0001-0001-0001-000000000003',
        '3315a9e7-af12-402b-b139-cbe716b1de77',
        '2024-06-12',
        7.0,
        'Eclipse transition thermal analysis',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    -- Time entries for Solar Array Sizing
    (
        'te000001-0001-0001-0001-000000000009',
        't0000001-0001-0001-0001-000000000006',
        '9b809c14-d3ca-4668-a018-048cc4f161ec', -- Ashesh
        '2024-05-20',
        8.0,
        'Power budget analysis',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000010',
        't0000001-0001-0001-0001-000000000006',
        '9b809c14-d3ca-4668-a018-048cc4f161ec',
        '2024-05-21',
        7.0,
        'Solar array sizing calculations',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    -- Time entries for Battery Selection
    (
        'te000001-0001-0001-0001-000000000011',
        't0000001-0001-0001-0001-000000000007',
        'ad17e8f1-1706-422e-a5e1-3ef06ef72ff8', -- Amar Tolani
        '2024-06-20',
        8.0,
        'Vendor evaluation and initial testing',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000012',
        't0000001-0001-0001-0001-000000000007',
        '9b809c14-d3ca-4668-a018-048cc4f161ec', -- Ashesh
        '2024-06-24',
        6.0,
        'Trade study comparison matrix',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    -- Time entries for Phased Array Antenna
    (
        'te000001-0001-0001-0001-000000000013',
        't0000001-0001-0001-0001-000000000011',
        '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de', -- Rambabu
        '2024-04-15',
        8.0,
        'Antenna element design',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000014',
        't0000001-0001-0001-0001-000000000011',
        '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de',
        '2024-05-20',
        8.0,
        'Beam forming network design',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000015',
        't0000001-0001-0001-0001-000000000011',
        '73a2056a-1af8-42c4-ae1a-f1a1ad1bf5de',
        '2024-07-25',
        8.0,
        'Prototype testing and characterization',
        TRUE,
        'Testing',
        TRUE,
        'demo-script'
    ),
    -- Time entries for RF Front-End
    (
        'te000001-0001-0001-0001-000000000016',
        't0000001-0001-0001-0001-000000000012',
        '7a457b4e-827c-4387-8789-75a4f129db25', -- Aishwarya
        '2024-08-05',
        8.0,
        'LNA circuit design',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000017',
        't0000001-0001-0001-0001-000000000012',
        '7a457b4e-827c-4387-8789-75a4f129db25',
        '2024-08-12',
        7.5,
        'Filter design and simulation',
        TRUE,
        'Development',
        TRUE,
        'demo-script'
    ),
    -- Meetings (non-billable)
    (
        'te000001-0001-0001-0001-000000000018',
        't0000001-0001-0001-0001-000000000001',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf',
        '2024-05-15',
        2.0,
        'Design review meeting',
        FALSE,
        'Meeting',
        TRUE,
        'demo-script'
    ),
    (
        'te000001-0001-0001-0001-000000000019',
        't0000001-0001-0001-0001-000000000005',
        '16d2e499-943f-4ae4-98a1-18dae3822b30', -- Krishna Dora
        '2024-06-01',
        3.0,
        'EPS kickoff meeting with team',
        FALSE,
        'Meeting',
        TRUE,
        'demo-script'
    ),
    -- Documentation time
    (
        'te000001-0001-0001-0001-000000000020',
        't0000001-0001-0001-0001-000000000009',
        '4a0130cf-6024-4881-b2f5-e3baae8e3fae', -- Vidhyuth
        '2024-02-15',
        8.0,
        'System requirements documentation',
        TRUE,
        'Documentation',
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 13. DASHBOARD WIDGETS
-- =============================================
INSERT INTO pm.dashboard_widget (
    id, user_id, widget_type, title, position_x, position_y, width, height,
    settings, project_id, is_active, created_by
)
VALUES
    -- Dashboard for Program Manager (Vineeth)
    (
        'dw000001-0001-0001-0001-000000000001',
        '6709c935-540d-4618-a546-cce69ee94438', -- Vineeth
        'TaskSummary',
        'Task Overview',
        0, 0, 4, 2,
        '{"showCompleted": true, "timeRange": "month"}',
        NULL,
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000002',
        '6709c935-540d-4618-a546-cce69ee94438',
        'ProjectProgress',
        'Program Progress',
        4, 0, 4, 2,
        '{"showBudget": true, "showSchedule": true}',
        NULL,
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000003',
        '6709c935-540d-4618-a546-cce69ee94438',
        'OverdueTasks',
        'Overdue Tasks',
        8, 0, 4, 2,
        '{"maxItems": 10}',
        NULL,
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000004',
        '6709c935-540d-4618-a546-cce69ee94438',
        'TeamWorkload',
        'Team Workload',
        0, 2, 6, 3,
        '{"showAllocations": true}',
        NULL,
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000005',
        '6709c935-540d-4618-a546-cce69ee94438',
        'MilestoneTracker',
        'Upcoming Milestones',
        6, 2, 6, 3,
        '{"daysAhead": 90}',
        NULL,
        TRUE,
        'demo-script'
    ),
    -- Dashboard for Project Lead (Santhosh)
    (
        'dw000001-0001-0001-0001-000000000006',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf', -- Santhosh
        'MyTasks',
        'My Tasks',
        0, 0, 6, 3,
        '{"showSubtasks": true, "groupBy": "status"}',
        'pj000001-0001-0001-0001-000000000001',
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000007',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf',
        'TimeLoggedChart',
        'Time Logged This Month',
        6, 0, 6, 3,
        '{"chartType": "bar", "groupBy": "day"}',
        'pj000001-0001-0001-0001-000000000001',
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000008',
        '0e3c965d-2e25-4e59-87ae-5d7807d07ecf',
        'RecentActivity',
        'Recent Activity',
        0, 3, 12, 2,
        '{"maxItems": 15, "activityTypes": ["StatusChanged", "CommentAdded", "TimeLogged"]}',
        'pj000001-0001-0001-0001-000000000001',
        TRUE,
        'demo-script'
    ),
    -- Dashboard for Engineer (Aishwarya)
    (
        'dw000001-0001-0001-0001-000000000009',
        '7a457b4e-827c-4387-8789-75a4f129db25', -- Aishwarya
        'MyTasks',
        'My Tasks',
        0, 0, 8, 4,
        '{"showSubtasks": true, "sortBy": "dueDate"}',
        NULL,
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000010',
        '7a457b4e-827c-4387-8789-75a4f129db25',
        'StatusDistribution',
        'Task Status',
        8, 0, 4, 2,
        '{"chartType": "pie"}',
        'pj000001-0001-0001-0001-000000000002',
        TRUE,
        'demo-script'
    ),
    (
        'dw000001-0001-0001-0001-000000000011',
        '7a457b4e-827c-4387-8789-75a4f129db25',
        'PriorityBreakdown',
        'Priority Distribution',
        8, 2, 4, 2,
        '{"chartType": "donut"}',
        'pj000001-0001-0001-0001-000000000002',
        TRUE,
        'demo-script'
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SUMMARY
-- =============================================
-- This demo data script creates:
-- - 4 Customers
-- - 3 Programs (LEO Constellation, Earth Observation, Propulsion)
-- - 6 Projects across the programs
-- - 24 Board Columns (4 per project via create_default_board_columns)
-- - 9 Milestones
-- - 14 Tasks (including parent tasks and subtasks)
-- - 10 Task Assignees (multiple assignees per task)
-- - 9 Task Dependencies (various types: FS, SS)
-- - 10 Task Comments (including threaded replies with mentions)
-- - 13 Task Activities (audit trail)
-- - 9 Resource Allocations (project, task, training, leave)
-- - 20 Time Entries (various work types)
-- - 11 Dashboard Widgets (for different user roles)
-- =============================================
