-- Table: imagery.strip_information
-- DROP TABLE IF EXISTS imagery.strip_information;

CREATE TABLE imagery.strip_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_id UUID NOT NULL,
    request_id UUID,
    image_id UUID,
    thumbnail_id UUID,
    imaging_orbit_number INT NOT NULL,
    dump_orbit_number INT NOT NULL,
    strip_number INT NOT NULL,
    imaging_start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_end_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_region GEOMETRY NOT NULL, 
    strip_length FLOAT ,
    swath FLOAT,
    sensor_id UUID NOT NULL,
    accuracy FLOAT,
    snr FLOAT,
    cloud_cover FLOAT,
    off_nadir FLOAT,
    ground_sampling_distance FLOAT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (image_id) REFERENCES common.document(id) ON DELETE SET NULL,
    FOREIGN KEY (thumbnail_id) REFERENCES common.image(id) ON DELETE SET NULL,
    FOREIGN KEY (pass_id) REFERENCES imagery.pass_information(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES imagery.request(id) ON DELETE SET NULL
);