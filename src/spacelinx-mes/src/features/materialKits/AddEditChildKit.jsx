import React, { useState, useEffect, useContext } from "react";
import { Button, TextField } from "@mui/material";
import {
  fetchKitBomComments,
  fetchSerialNumberWithkitIdAndPartId,
  updatePartSerialNumbers,
} from "../../services/childKitService";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";

const AddEditChildKit = ({ handleAddEditCloseClick, selectedRow, kitId }) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [comments, setComments] = useState("");
  const [textFields, setTextFields] = useState([]);
  const canModifyMaterialKits = hasPermission(PERMISSIONS.MATERIALKITS.MODIFY);

  useEffect(() => {
    if (selectedRow?.quantityM) {
      setTextFields(
        Array(selectedRow.quantityM).fill({ serialno: "", status: "Pending" })
      );
    }
  }, [selectedRow?.quantityM]);

  useEffect(() => {
    if (kitId && selectedRow.ebomPartId) fetchSerialNumbers();
  }, [kitId, selectedRow.ebomPartId]);

  const handleEditClick = () => {
    if (!canModifyMaterialKits) {
      Alert("You do not have permission to modify material kits!", "warning");
      return;
    }
    setIsEditing((prevIsEditing) => !prevIsEditing);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleTextFieldChange = (index, e) => {
    setTextFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[index] = {
        ...updatedFields[index],
        serialno: e.target.value,
      };
      return updatedFields;
    });
  };

  const fetchSerialNumbers = async () => {
    setLoadingData(true);
    try {
      const data = await fetchSerialNumberWithkitIdAndPartId(
        kitId,
        selectedRow.ebomPartId
      );
      const commentData = await fetchKitBomComments();
      if (commentData) {
        const filteredCommentData = commentData.find(
          (item) =>
            item.partId === selectedRow.ebomPartId && item.kitId === kitId
        );
        setComments(filteredCommentData?.comments || "");
      } else {
        return;
      }
      if (data) {
        const serialNumbers = data.map((item) => ({
          serialno: item.serialno,
          status: item.status,
        }));
        const updatedFields = Array(selectedRow.quantityM).fill({
          serialno: "",
          status: "Pending",
        });
        serialNumbers.forEach((item, index) => {
          if (index < updatedFields.length) {
            updatedFields[index] = item;
          }
        });
        setTextFields(updatedFields);
      } else {
        setTextFields([]);
      }
    } catch (error) {
      Alert("Couldn't fetch Serial Numbers", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveClick = async () => {
    if (!canModifyMaterialKits) {
      Alert("You do not have permission to modify material kits!", "warning");
      return;
    }

    setLoadingData(true);
    const enteredFields = textFields
      .filter(
        (field) => field.serialno.trim() !== "" && field.status !== "Consumed"
      )
      .map((field) => ({ serialno: field.serialno }));
    const numbers = { comments: comments || "", serialNumbers: enteredFields };
    try {
      const serialNumbers = await updatePartSerialNumbers(
        kitId,
        selectedRow.ebomPartId,
        numbers
      );
      Alert(
        `Updated Part ${selectedRow.name}---${selectedRow.number} Serial Numbers Successfully..!`,
        "success"
      );
      fetchSerialNumbers();
      handleAddEditCloseClick();
    } catch (error) {
      Alert("Unable To update Serial Numbers", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyoutKit">
      <div className="CreateFlyoutHeader">
        <h2>Serial Numbers</h2>
        <div>
          <button onClick={handleEditClick} disabled={!canModifyMaterialKits}>
            <ion-icon
              name="create-outline"
              class={!canModifyMaterialKits ? "IonIconDisabled" : undefined}
            ></ion-icon>
          </button>
          <button onClick={handleAddEditCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="CreateFlyoutBodyKit">
          <div className="ScrollableFields">
            {textFields.map((field, index) => (
              <div className="ChildKitSerialNumber" key={index}>
                <p>{index + 1}.</p>
                <TextField
                  value={field.serialno}
                  onChange={(e) => handleTextFieldChange(index, e)}
                  placeholder="Please Enter"
                  disabled={
                    !isEditing ||
                    field.status === "Consumed" ||
                    !canModifyMaterialKits
                  }
                  className="InputFields"
                  fullWidth
                />
                <p
                  style={{
                    color:
                      field.status === "Consumed"
                        ? "green"
                        : field.status === "Unconsumed"
                        ? "orange"
                        : "grey",
                  }}
                >
                  {field.status}
                </p>
              </div>
            ))}
          </div>
          <div className="CommentsContainer">
            <TextField
              label="Comments"
              value={comments}
              onChange={handleCommentChange}
              placeholder="Enter comments"
              fullWidth
              multiline
              rows={3}
              disabled={!isEditing || !canModifyMaterialKits}
              className="CommentsField"
            />
          </div>
        </div>
      )}
      <div className="CreateFlyoutFooterKit">
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleAddEditCloseClick}
          className="CancelButton"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
          className="SaveButton"
          disabled={!isEditing || loadingData || !canModifyMaterialKits}
        >
          Save
        </Button>
      </div>{" "}
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default AddEditChildKit;
