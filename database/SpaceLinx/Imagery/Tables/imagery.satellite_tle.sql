-- Table: imagery.satellite_tle
-- DROP TABLE IF EXISTS imagery.satellite_tle;

CREATE TABLE imagery.satellite_tle(
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	satellite_id UUID NOT NULL,
	tle_data VARCHAR(255),
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(255) NOT NULL,
	updated_at TIMESTAMPTZ,
	updated_by VARCHAR(255), 
	FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE CASCADE
);