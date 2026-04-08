CREATE OR REPLACE VIEW mes.workorderguidestepsview
AS
SELECT wo.id AS workorderid,
    gs.sequence AS guidestepsequence,
    gs.title AS guidestepname,
    count(DISTINCT wost.id) AS numberofworkordertasks,
    count(DISTINCT gst.id) AS numberofguidesteptasks,
    wos.captured_time AS capturedtime,
    wos.status AS workorderstepstatus
 FROM
    mes.work_order wo
 JOIN 
    mes.guide_step gs ON wo.guide_id = gs.guide_id AND gs.deleted_by IS NULL
 LEFT JOIN 
    mes.work_order_step wos ON wo.id = wos.work_order_id AND gs.id = wos.guide_step_id AND wos.deleted_by IS NULL
 LEFT JOIN
    mes.guide_step_task gst ON gs.id = gst.guide_step_id AND gst.deleted_by IS NULL
 LEFT JOIN
    mes.work_order_task wost ON wo.id = wost.work_order_id AND wost.guide_step_task_id = gst.id AND wost.deleted_by IS NULL
 GROUP BY
   wo.id, gs.sequence, gs.title, wos.captured_time, wos.id, wos.status
 ORDER BY
   wo.id, gs.sequence;