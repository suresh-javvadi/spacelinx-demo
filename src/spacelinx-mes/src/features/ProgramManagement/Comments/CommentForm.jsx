import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { createTaskComment } from "../../../services/taskCommentService";
import { AlertsContext } from "../../AlertsContext/Context";

const CommentForm = ({ taskId, parentCommentId, staff, onCommentAdded, onCancel }) => {
  const { Alert } = useContext(AlertsContext);
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert("Please enter a comment", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        taskId,
        parentCommentId: parentCommentId || null,
        content: content.trim(),
        mentions: mentions.length > 0 ? JSON.stringify(mentions.map((m) => m.id)) : null,
      };

      await createTaskComment(payload);
      Alert("Comment added!", "success");
      setContent("");
      setMentions([]);
      onCommentAdded?.();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert("Failed to add comment", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Write a comment... Use @ to mention someone"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="outlined"
        size="small"
      />

      <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
        <Autocomplete
          multiple
          size="small"
          options={staff || []}
          getOptionLabel={(option) =>
            `${option.firstName || ""} ${option.lastName || ""}`
          }
          value={mentions}
          onChange={(e, newValue) => setMentions(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                size="small"
                label={`@${option.firstName}`}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Mention people..."
              variant="outlined"
            />
          )}
          sx={{ flex: 1, minWidth: 200 }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          {parentCommentId && (
            <Button variant="text" size="small" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={saving || !content.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : <Send />}
          >
            {saving ? "Posting..." : "Post"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm;
