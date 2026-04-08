CREATE VIEW imagery.strip_information_view AS
SELECT 
    si.id,
    si.pass_id,
    si.imaging_orbit_number,
    si.dump_orbit_number,
    si.strip_number,
    si.imaging_start_time,
    si.imaging_end_time,
    si.imaging_region,
    si.strip_length,
    si.swath,
    si.sensor_id,
    si.accuracy,
    si.snr,
    si.cloud_cover,
    si.off_nadir,
    p.orbit_number AS pass_orbit_number,
    jsonb_build_object(
        'satelliteId', p.satellite_id,
        'orbitNumber', p.orbit_number,
        'stationId', p.station_id,
        'id', p.id
    ) AS pass,
    s.name AS sensor_name,
    jsonb_build_object(
        'sensorTypeId', s.sensor_type_id,
        'name', s.name,
        'owner', s.owner,
        'technologyTypeId', s.technology_type_id,
        'operationalStatus', s.operational_status,
        'manufacturerId', s.manufacturer_id,
        'id', s.id
    ) AS sensor,
    si.is_active,
    si.created_at,
    si.created_by,
    si.updated_at,
    si.updated_by
FROM imagery.strip_information si
JOIN imagery.pass_information p ON si.pass_id = p.id
JOIN imagery.sensor s ON si.sensor_id = s.id;