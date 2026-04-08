-- Table: imagery.country
-- DROP TABLE IF EXISTS imagery.countey;

CREATE TABLE imagery.country (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) UNIQUE NOT NULL, -- 3 Digit ISO code
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.satellite
-- DROP TABLE IF EXISTS imagery.satellite;

CREATE TABLE imagery.satellite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    international_designator VARCHAR(50) UNIQUE, -- International Designator code given by the Global Space Surveillance Network (GSSN)
    country_id UUID NOT NULL,
    country_code VARCHAR(3),
    launch_date DATE,
    launch_site VARCHAR(255),
    decay_date DATE, -- Expiry date
    period_min FLOAT, -- Orbital period in minutes generally 90 minutes
    inclination_degree FLOAT, -- Orbital inclination in degrees
    perigee_km INT, -- Nearest point to earth
    apogee_km INT, -- Farthest point to earth
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive', -- Operational status of the satellite - IsActive, IsInactive, IsDecommissioned, IsLost, IsMaintenance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (country_code) REFERENCES imagery.country(code) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES imagery.country(id) ON DELETE SET NULL
);

-- Table: imagery.sensor_type
-- DROP TABLE IF EXISTS imagery.sensor_type;

CREATE TABLE imagery.sensor_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL, 
    code VARCHAR(50) NOT NULL, -- PAN, MS, HSI, TIR, SAR, LIDAR
    name VARCHAR(255) NOT NULL, -- PAN, MS, HSI, TIR, SAR, LIDAR
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.technology_type
-- DROP TABLE IF EXISTS imagery.technology_type;

CREATE TABLE imagery.technology_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,  -- Technology type of the sensor
    description VARCHAR(255), -- Technology Type notes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.manufacturer
-- DROP TABLE IF EXISTS imagery.manufacturer;

CREATE TABLE imagery.manufacturer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.sensor
-- DROP TABLE IF EXISTS imagery.sensor;

CREATE TABLE imagery.sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_type_id UUID NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    owner VARCHAR(255),
    technology_type_id UUID NOT NULL,
    rows int,
    columns int,
    bpp int, -- Bits per pixel
    pixel_pitch FLOAT,
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive',
    manufacturer_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (sensor_type_id) REFERENCES imagery.sensor_type(id) ON DELETE SET NULL,
    FOREIGN KEY (technology_type_id) REFERENCES imagery.technology_type(id) ON DELETE SET NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES imagery.manufacturer(id) ON DELETE SET NULL
);

-- Table: imagery.satellite_sensor
-- DROP TABLE IF EXISTS imagery.satellite_sensor;

CREATE TABLE imagery.satellite_sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_id UUID NOT NULL,
    -- Sensor Properties Start
    sensor_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    spatial_resolution_min_m FLOAT,
    swath_width_km FLOAT,
    off_nadir_max_degree FLOAT,
    along_track_max_degree FLOAT,
    -- Sensor Properties End
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL,
    UNIQUE (satellite_id, sensor_id)
);

-- Table: imagery.band_type
-- DROP TABLE IF EXISTS imagery.band_type;

CREATE TABLE imagery.band_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- Red, Green, Blue, Near Infrared, Shortwave Infrared, Thermal - BandType and BandTypeCategory are related
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.band_type_category
-- DROP TABLE IF EXISTS imagery.band_type_category;

CREATE TABLE imagery.band_type_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    description VARCHAR(255), -- Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.band
-- DROP TABLE IF EXISTS imagery.band;

CREATE TABLE imagery.band (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT  UNIQUE NOT NULL, -- Band number is unique
    satellite_sensor_id UUID NOT NULL,
    band_type_id UUID NOT NULL,
    band_type_category_id UUID NOT NULL,
    start_wavelength FLOAT, -- Start wavelength of the band
    end_wavelength FLOAT, -- End wavelength of the band
    wavelength_unit VARCHAR(255), -- Wavelength unit - nm, um, mm - Lookup
    spatial_resolution_min_m FLOAT, -- Minimum spatial resolution in meters Always > 0
    radiometric_res_bits INT, -- e.g. 10
    swath_m FLOAT, -- Swath width in meters - Copy from sensor default values
    start_off_angle_degree FLOAT, -- Start off angle in degrees
    stop_off_angle_degree FLOAT, -- Stop off angle in degrees
    has_dynamic_spatial_res BOOLEAN, -- Dynamic spatial resolution - True, False
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive', -- Operational status of the band - IsActive, IsInactive
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_sensor_id) REFERENCES imagery.satellite_sensor(id) ON DELETE SET NULL,
    FOREIGN KEY (band_type_id) REFERENCES imagery.band_type(id) ON DELETE SET NULL,
    FOREIGN KEY (band_type_category_id) REFERENCES imagery.band_type_category(id) ON DELETE SET NULL
);

-- Table: imagery.station
-- DROP TABLE IF EXISTS imagery.station;

CREATE TABLE imagery.station (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    position point,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: imagery.pass_information
-- DROP TABLE IF EXISTS imagery.pass_information;

CREATE TABLE imagery.pass_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_id UUID NOT NULL,
    orbit_number INT NOT NULL,
    pass_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Date of the pass - Date Only
    aos_start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    los_end_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    station_id UUID NOT NULL, -- Ground station -- Look up table
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE SET NULL,
    FOREIGN KEY (station_id) REFERENCES imagery.station(id) ON DELETE SET NULL
);

-- Table: imagery.strip_information
-- DROP TABLE IF EXISTS imagery.strip_information;

CREATE TABLE imagery.strip_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_id UUID NOT NULL,
    imaging_orbit_number INT NOT NULL,
    dump_orbit_number INT NOT NULL,
    strip_number INT NOT NULL,
    imaging_start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_end_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_region POLYGON NOT NULL, 
    strip_length FLOAT ,
    swath FLOAT,
    sensor_id UUID NOT NULL,
    accuracy FLOAT,
    snr FLOAT,
    cloud_cover FLOAT,
    off_nadir FLOAT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (pass_id) REFERENCES imagery.pass_information(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL
);

-- Table: imagery.request
-- DROP TABLE IF EXISTS imagery.request;

CREATE TABLE imagery.request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(500)  NOT NULL,
    request_datetime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    purpose VARCHAR(500) NOT NULL, --environmental monitoring, urban planning, disaster assessment etc
    image_type VARCHAR(100), -- panchromatic, multispectral etc -- Reference table
    image_resolution float, -- Pixel size in meters
    coverage_area POLYGON NOT NULL,
    preferred_acquisition_timeframe_start DATE, -- Date Range
    preferred_acquisition_timeframe_end DATE, -- Date Range
    cloud_cover_tolerance FLOAT,
    acquisition_time_start TIME, -- Time Range
    acquisition_time_end TIME, -- Time Range
    priority VARCHAR(50), --high, medium, low
    delivery_format VARCHAR(50), -- JP2, GeoTIFF, JPEG etc - Reference table
    delivery_method VARCHAR(100), -- FTP, email, API etc - Reference table
    processing_level VARCHAR(100), --raw data, orthorectified, analyzed - Reference table
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', --pending, processing, completed, canceled
    notes VARCHAR(500),
    sensor_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL
);

-- Table: imagery.request_audit
-- DROP TABLE IF EXISTS imagery.request_audit;

CREATE TABLE imagery.request_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    email VARCHAR(500)  NOT NULL,
    request_datetime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    purpose VARCHAR(500) NOT NULL, --environmental monitoring, urban planning, disaster assessment etc
    image_type VARCHAR(100), -- panchromatic, multispectral etc -- Reference table
    image_resolution float, -- Pixel size in meters
    coverage_area POLYGON NOT NULL,
    preferred_acquisition_timeframe_start DATE, -- Date Range
    preferred_acquisition_timeframe_end DATE, -- Date Range
    cloud_cover_tolerance FLOAT,
    acquisition_time_start TIME, -- Time Range
    acquisition_time_end TIME, -- Time Range
    priority VARCHAR(50), --high, medium, low
    delivery_format VARCHAR(50), -- JP2, GeoTIFF, JPEG etc - Reference table
    delivery_method VARCHAR(100), -- FTP, email, API etc - Reference table
    processing_level VARCHAR(100), --raw data, orthorectified, analyzed - Reference table
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', --pending, processing, completed, canceled
    notes VARCHAR(500),
    sensor_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES imagery.request(id) ON DELETE SET NULL
);

-- Table: imagery.request_comment
-- DROP TABLE IF EXISTS imagery.request_comment;

CREATE TABLE imagery.request_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    email VARCHAR(200) NOT NULL,
    comment VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES imagery.request(id) ON DELETE SET NULL
);