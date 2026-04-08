import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  fetchCompanyPartsById,
  createCompanyPart,
  deleteCompanyPart,
} from "../../../services/companyPartService";
import { fetchUniquePartsWithOutobsolete } from "../../../services/partService";
import { Autocomplete, TextField, Button } from "@mui/material";
import { usePartDetailsDrawer } from "../../admin/parts/PartDetailsContext";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const CompanyParts = ({ selectedCompanyId }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [vendorParts, setVendorParts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [parts, setParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState(null);

  useEffect(() => {
    fetchVendorPartsData();
  }, [selectedCompanyId]);

  const fetchVendorPartsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchCompanyPartsById(selectedCompanyId);
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setVendorParts(sortedData);

      fetchPartsData(sortedData);
    } catch (error) {
      console.error("Error fetching vendor parts data:", error);
      Alert("Failed to fetch vendor parts data.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPartsData = async (vendorData) => {
    setPartsLoading(true);
    try {
      const data = await fetchUniquePartsWithOutobsolete();

      const sortedParts = data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((part) => part.makeBuy === 1 && part.status === "Release");

      const existingPartIds = (vendorData || vendorParts).map(
        (vp) => vp.partId
      );

      const filteredParts = sortedParts.filter(
        (part) => !existingPartIds.includes(part.id)
      );

      setParts(filteredParts);
    } catch (error) {
      console.error("Error fetching parts data:", error);
      Alert("Failed to fetch parts data.", "error");
    } finally {
      setPartsLoading(false);
    }
  };

  const handleAddPart = async () => {
    if (!hasPermission(PERMISSIONS.VENDORS.PARTS.MODIFY)) {
      Alert("You do not have permission to modify vendor part", "warning");
      return;
    }
    if (!selectedPart) {
      Alert("Please select a part to add.", "warning");
      return;
    }
    setLoadingData(true);
    const newVendorPart = {
      companyId: selectedCompanyId,
      partId: selectedPart.id,
    };

    try {
      await createCompanyPart(newVendorPart);
      Alert("Part added successfully.", "success");
      fetchVendorPartsData();
      setSelectedPart(null);
      setParts((prev) => prev.filter((part) => part.id !== selectedPart.id));
    } catch (error) {
      console.error("Error adding vendor part:", error);
      Alert("Failed to add vendor part.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeletePart = async (id) => {
    const confirmed = await showConfirmation(
      "Are you sure?",
      "You want to delete this part?"
    );

    if (!confirmed) return;

    setLoadingData(true);

    try {
      await deleteCompanyPart(id);

      const updatedVendorParts = vendorParts.filter((part) => part?.id !== id);

      setVendorParts(updatedVendorParts);
      fetchPartsData(updatedVendorParts);

      showAlert("success", "Deleted!", "Part deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("error", "Error", "Failed to delete part. Try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 0.5,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (row.part) {
              openPartDetailsDrawer({
                partNumberSuffix: row.part?.partNumberSuffix,
              });
            }
          }}
        >
          {row.part?.partNumber || "---"}
        </div>
      ),
      valueGetter: (_value, row) => row.part?.partNumber || "---",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (_value, row) => (row.part ? row.part.name : ""),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) => row.part.status,
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      valueGetter: (_value, row) => {
        const val = row.part?.makeBuy;
        return val == null ? "" : val ? "Buy" : "Make";
      },
      flex: 0.5,
    },
    hasPermission(PERMISSIONS.VENDORS.PARTS.DELETE)
      ? {
          field: "action",
          headerName: "",
          width: 50,
          renderCell: ({ row }) => (
            <ion-icon
              name="trash-outline"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePart(row.id);
              }}
            ></ion-icon>
          ),
        }
      : [],
  ];

  return (
    <div>
      <div className="VendorPartsHeader">
        <Autocomplete
          options={parts}
          getOptionLabel={(option) =>
            `${option.partNumber} - ${option.name}` || ""
          }
          loading={partsLoading}
          loadingText="Loading parts..."
          value={selectedPart}
          className="VendorPartsAutocomplete"
          onChange={(event, newValue) => setSelectedPart(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Part" size="small" />
          )}
        />

        <Button
          onClick={handleAddPart}
          className={
            hasPermission(PERMISSIONS.VENDORS.PARTS.MODIFY)
              ? "VendorPartsAddButton"
              : "IonIconDisabled VendorPartsAddButton"
          }
        >
          Add
        </Button>
      </div>

      <div className="VendorPartsDataGrid">
        <StyledDataGrid
          rows={vendorParts}
          columns={columns}
          loading={loadingData}
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
};

export default CompanyParts;
