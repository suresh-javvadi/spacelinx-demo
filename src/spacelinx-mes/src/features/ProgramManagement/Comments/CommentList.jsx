import React from "react";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert, Reply } from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CommentItem = ({ comment, onReply }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const getInitials = (email) => {
    if (!email) return "?";
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (date) => {
    if (!date) return "";
    return dayjs(date).fromNow();
  };

  return (
    <div className="CommentItem">
      <Avatar className="CommentAvatar">{getInitials(comment.createdBy)}</Avatar>
      <div className="CommentContent">
        <div className="CommentHeader">
          <span className="CommentAuthor">{comment.createdBy}</span>
          <span className="CommentTime">{formatTime(comment.createdAt)}</span>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: "auto" }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { onReply?.(comment); setAnchorEl(null); }}>
              <Reply fontSize="small" sx={{ mr: 1 }} /> Reply
            </MenuItem>
          </Menu>
        </div>
        <p className="CommentText">{comment.content}</p>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="CommentReplies">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentList = ({ comments, staff, onReply }) => {
  if (!comments || comments.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#666", padding: 16 }}>
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="CommentsList">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default CommentList;
