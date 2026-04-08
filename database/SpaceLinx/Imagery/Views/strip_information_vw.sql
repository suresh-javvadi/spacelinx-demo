CREATE OR REPLACE VIEW imagery.strip_information_vw 
AS 
SELECT si.id,
    si.pass_id,
    si.request_id,
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
    si.ground_sampling_distance,
    si.is_active,
    p.orbit_number AS pass_orbit_number,
    s.name AS sensor_name,
    st.id AS sensor_type_id,
    st.name AS sensor_type_name,
    r.name AS request_name,
    sat.id AS satellite_id,
    sat.name AS satellite_name,
    sat.code AS satellite_code,
    sat.inclination_degree AS inclination_degree
    jsonb_build_object(
        'Id', t.id,
        'FilePath', t.file_path
    ) AS thumbnail,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'Id', d.id,
                'FilePath', d.file_path
            )
        ) FILTER (WHERE d.id IS NOT NULL), '[]'::jsonb
    ) AS documents

FROM imagery.strip_information si
JOIN imagery.pass_information p ON si.pass_id = p.id
JOIN imagery.sensor s ON si.sensor_id = s.id
JOIN imagery.sensor_type st ON s.sensor_type_id = st.id
JOIN imagery.request r ON si.request_id = r.id
LEFT JOIN imagery.satellite sat ON r.satellite_id = sat.id;
LEFT JOIN common.image t ON si.id = t.entity_id AND t.entity_type = 'strip-information'
LEFT JOIN common.documents d ON si.id = d.entity_id AND d.entity_type = 'strip-information'
GROUP BY si.id, si.pass_id, p.orbit_number, s.id, st.id, r.id, sat.id, t.id;