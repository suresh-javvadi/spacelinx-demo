import React, { useEffect, useState, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchUserLookup } from "../../../services/userService";
import { fetchApprovalConfigByType } from "../../../services/approvalsConfigService";
import { useUserContext } from "../../userContext/UserContext";

import { ClipLoader } from "react-spinners";

const POApprovals = ({
  approvals = [],
  approvers,
  setApprovers,
  readOnlyMode,
  loadingData,
  currentUserId,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [usersData, setUsersData] = useState([]);
  const [approvalConfig, setApprovalConfig] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const { isSuperAdmin } = useUserContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchApprovalConfig();
  }, []);

  useEffect(() => {
    if (!approvalConfig?.numberOfLevels || initialized) return;

    const groupedByStage = approvals.reduce((acc, item) => {
      const stage = item.stageNumber;
      if (!acc[stage]) acc[stage] = [];
      if (item.approver) acc[stage].push(item.approver);
      return acc;
    }, {});

    const initializedData = Array.from(
      { length: approvalConfig.numberOfLevels },
      (_, i) => ({
        stage: i + 1,
        users: groupedByStage[i + 1] || [],
      }),
    );

    setApprovers(initializedData);
    setInitialized(true);
  }, [approvalConfig, approvals, initialized]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchUserLookup();
      setUsersData(data || []);
    } catch (error) {
      console.error(error);
      Alert("Failed to load users.", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchApprovalConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await fetchApprovalConfigByType("PurchaseOrder");
      setApprovalConfig(data);
    } catch (error) {
      console.error(error);
      Alert("Failed to load approval configuration.", "error");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleUsersChange = (index, newUsers) => {
    setApprovers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], users: newUsers };
      return updated;
    });
  };

  const getFilteredUsers = (currentIndex) => {
    const selectedIds = approvers
      .filter((_, idx) => idx !== currentIndex)
      .flatMap((a) => a.users.map((u) => u.id));

    return usersData.filter((u) => {
      //block self only if NOT super admin
      if (!isSuperAdmin && u.id === currentUserId) {
        return false;
      }

      // prevent duplicate selection across stages
      if (selectedIds.includes(u.id)) {
        return false;
      }

      return true;
    });
  };

  if (loadingUsers || loadingConfig || loadingData) {
    return (
      <div className="po-approvals__loader">
        <ClipLoader size={30} color="#4F46E5" loading={true} />
      </div>
    );
  }

  if (!approvalConfig) {
    return (
      <p className="po-approvals__empty">No approval configuration found</p>
    );
  }

  return (
    <div className="po-approvals">
      {approvers.map((item, index) => {
        return (
          <div key={`approval-stage-${index}`} className="po-approvals__stage">
            <div className="po-approvals__row">
              <p className="po-approvals__stage-label">Stage {item.stage}</p>

              <div className="po-approvals__approver-select">
                <Autocomplete
                  multiple
                  options={getFilteredUsers(index)}
                  value={item.users}
                  onChange={(e, v) => handleUsersChange(index, v)}
                  readOnly={readOnlyMode}
                  getOptionLabel={(o) =>
                    `${o?.firstName ?? ""} ${o?.lastName ?? ""}`.trim()
                  }
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Approvers – Stage ${item.stage}`}
                      placeholder="Select approvers"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default POApprovals;
