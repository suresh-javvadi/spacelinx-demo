-- Table: mes.guide_step
-- DROP TABLE IF EXISTS mes.guide_step;

CREATE TABLE mes.guide_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    guide_id UUID NOT NULL,
    image_id UUID,
    video_id UUID,
    sequence INT NOT NULL,
    comment Text,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL,
    FOREIGN KEY (video_id) REFERENCES common.video(id) ON DELETE SET NULL
);