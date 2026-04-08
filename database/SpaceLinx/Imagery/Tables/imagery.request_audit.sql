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
    coverage_area GEOMETRY NOT NULL,
    preferred_acquisition_timeframe_start DATE, -- Date Range
    preferred_acquisition_timeframe_end DATE, -- Date Range
    cloud_cover_tolerance FLOAT,
    preferred_acquisition_time VARCHAR(50) NOT NULL, -- AM, PM, Any Time
    acquisition_time_start TIME, -- Time Range
    acquisition_time_end TIME, -- Time Range
    priority VARCHAR(50), --high, medium, low
    delivery_format VARCHAR(50), -- JP2, GeoTIFF, JPEG etc - Reference table
    delivery_method VARCHAR(100), -- FTP, email, API etc - Reference table
    processing_level VARCHAR(100), --raw data, orthorectified, analyzed - Reference table
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', --pending, processing, completed, canceled
    notes VARCHAR(500),
    satellite_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE SET NULL,
    FOREIGN KEY (request_id) REFERENCES imagery.request(id) ON DELETE SET NULL
);