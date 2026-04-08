import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CustomDataGridOverlay from "../../../Components/CustomDatagridOverlay/CustomDataGridOverlay";
import { fetchCurrencyLookup } from "../../../services/currencyService";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import {
  createCompanyBankAccount,
  UpdateCompanyBankAccount,
} from "../../../services/bankAccountService";
import {
  deleteCompanyBankAccount,
  fetchCompanyBankAccountsByCompanyId,
} from "../../../services/companyBankAccountService";
import { AlertsContext } from "../../AlertsContext/Context";

import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
const EditBankDetails = ({ selectedCompanyId }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState({});
  const [bankDetailsData, setbankDetailsData] = useState({
    name: "",
    branch: "",
    accountNumber: "",
    swiftCode: "",
    ifscCode: "",
    currencyId: null,
  });

  const requiredFields = {
    name: "Bank Name",
    branch: "Bank Branch",
    accountNumber: "Account Number",
    ifscCode: "IFSC Code",
  };

  const resetForm = () => {
    setbankDetailsData({
      name: "",
      branch: "",
      accountNumber: "",
      swiftCode: "",
      ifscCode: "",
      currencyId: null,
    });
    setErrors({});
    setIsEditing(false);
    setEditId(null);
  };
  const closeAccordionAndReset = () => {
    resetForm();
    setAccordionOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setbankDetailsData((prev) => ({ ...prev, [name]: value }));

    if (requiredFields[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: value.trim() ? "" : `${requiredFields[name]} is required`,
      }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    Object.keys(requiredFields).forEach((field) => {
      if (!bankDetailsData[field]) {
        newErrors[field] = `${requiredFields[field]} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBankAccount = async () => {
    if (!selectedCompanyId) return;
    if (!validateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoading(true);
    setRowsLoading(true);
    closeAccordionAndReset();
    try {
      await createCompanyBankAccount({
        bankAccount: {
          bankName: bankDetailsData.name,
          branchName: bankDetailsData.branch,
          accountNumber: bankDetailsData.accountNumber,
          swiftCode: bankDetailsData.swiftCode,
          currencyId: bankDetailsData.currencyId,
          ifscCode: bankDetailsData.ifscCode,
        },
        id: selectedCompanyId,
      });

      const data = await fetchCompanyBankAccountsByCompanyId(selectedCompanyId);
      setRows(data || []);
      Alert("Vendor bank account created successfully!", "success");
    } catch (error) {
      Alert("Error creating vendor bank account", "error");
    } finally {
      setLoading(false);
      setRowsLoading(false);
    }
  };

  const handleEditBankAccount = async () => {
    if (!selectedCompanyId || !editId) return;
    if (!validateFields()) {
      Alert("Please fill in all required fields", "error");
      return;
    }
    setLoading(true);
    setRowsLoading(true);
    closeAccordionAndReset();
    try {
      const payload = {
        id: editId,
        bankAccount: {
          id: bankDetailsData.bankAccountId,
          bankName: bankDetailsData.name,
          branchName: bankDetailsData.branch,
          accountNumber: bankDetailsData.accountNumber,
          swiftCode: bankDetailsData.swiftCode,
          ifscCode: bankDetailsData.ifscCode,
          currencyId: bankDetailsData.currencyId,
        },
      };
      await UpdateCompanyBankAccount(selectedCompanyId, payload);
      await fetchBankAccounts();
      Alert("Bank account updated successfully!", "success");
    } catch (error) {
      Alert("Error updating bank account", "error");
    } finally {
      setLoading(false);
      setRowsLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setRowsLoading(true);
    if (!selectedCompanyId && selectedCompanyId !== 0) return;
    try {
      const data = await fetchCompanyBankAccountsByCompanyId(selectedCompanyId);
      setRows(data || []);
    } catch (error) {
      Alert("Error fetching vendor bank accounts", "error");
      setRows([]);
    } finally {
      setRowsLoading(false);
    }
  };

  const handleDeleteRow = async (id) => {
    const confirmed = await showConfirmation(
      "Are you sure?",
      "You want to delete this bank account?"
    );
    if (confirmed) {
      try {
        await deleteCompanyBankAccount(id);
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        Alert("Vendor bank account deleted successfully!", "success");
      } catch (error) {
        Alert("Failed to delete vendor bank account", "error");
      }
    }
  };

  const handleRowClick = (params) => {
    const selectedRow = params.row;
    setbankDetailsData({
      bankAccountId: selectedRow.bankAccount.id,
      name: selectedRow.bankAccount.bankName,
      branch: selectedRow.bankAccount.branchName,
      accountNumber: selectedRow.bankAccount.accountNumber,
      swiftCode: selectedRow.bankAccount.swiftCode,
      ifscCode: selectedRow.bankAccount.ifscCode,
      currencyId: selectedRow.bankAccount.currencyId,
    });
    setEditId(selectedRow.id);
    setIsEditing(true);
    setAccordionOpen(true);
  };

  const fetchCurrencies = async () => {
    try {
      const currencyData = await fetchCurrencyLookup();
      setCurrencies(currencyData);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchBankAccounts();
  }, [selectedCompanyId]);

  const columns = [
    {
      field: "name",
      headerName: "Bank Name",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.bankAccount.bankName;
      },
    },
    {
      field: "branch",
      headerName: "Bank Branch",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.bankAccount.branchName;
      },
    },
    {
      field: "accountNumber",
      headerName: "Bank Account Number",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.bankAccount.accountNumber;
      },
    },
    {
      field: "swiftCode",
      headerName: "Swift Code",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.bankAccount.swiftCode;
      },
    },
    hasPermission(PERMISSIONS.VENDORS.BANKS.DELETE)
      ? {
          headerName: "Actions",
          flex: 0.5,
          renderCell: ({ row }) => {
            return (
              <ion-icon
                name="trash-outline"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteRow(row.id, event);
                }}
              ></ion-icon>
            );
          },
        }
      : [],
  ];

  return (
    <div className="bank-details-container">
      <Accordion
        expanded={accordionOpen}
        onChange={(e, isExpanded) => {
          if (!hasPermission(PERMISSIONS.VENDORS.BANKS.MODIFY)) {
            Alert("You do not have access to create..!", "warning");
            return;
          }
          setAccordionOpen(isExpanded);
          if (!isExpanded) resetForm();
        }}
      >
        <AccordionSummary
          expandIcon={
            accordionOpen ? (
              <CloseIcon className="AppHyperLink" />
            ) : (
              <AddCircleOutlineIcon
                className={
                  hasPermission(PERMISSIONS.VENDORS.BANKS.MODIFY)
                    ? "AppHyperLink"
                    : "IonIconDisabled AppHyperLink"
                }
              />
            )
          }
        >
          <Typography variant="subtitle1">
            {isEditing ? "Edit Bank Account" : "Add Bank Account"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="bank-details-grid">
            <TextField
              className="AdminTextFeilds"
              label="Bank Name"
              name="name"
              value={bankDetailsData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="Bank Branch"
              name="branch"
              value={bankDetailsData.branch}
              onChange={handleInputChange}
              error={!!errors.branch}
              helperText={errors.branch}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="Bank Account Number"
              name="accountNumber"
              value={bankDetailsData.accountNumber}
              onChange={handleInputChange}
              error={!!errors.accountNumber}
              helperText={errors.accountNumber}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="IFSC Code"
              name="ifscCode"
              value={bankDetailsData.ifscCode}
              onChange={handleInputChange}
              error={!!errors.ifscCode}
              helperText={errors.ifscCode}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="Swift Code"
              name="swiftCode"
              value={bankDetailsData.swiftCode}
              onChange={handleInputChange}
            />
            <Autocomplete
              options={currencies}
              getOptionLabel={(option) =>
                option
                  ? `${option.country ?? ""} ${
                      option.code ? `(${option.code})` : ""
                    }`
                  : ""
              }
              disableClearable
              value={
                currencies.find((c) => c.id === bankDetailsData.currencyId) ||
                null
              }
              onChange={(_, newValue) => {
                setbankDetailsData((prevData) => ({
                  ...prevData,
                  currencyId: newValue ? newValue.id : null,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Currency"
                  variant="outlined"
                  className="AdminTextFeilds"
                  name="currency"
                />
              )}
            />
          </div>
          <div className="bank-actions-row">
            <Button
              className="CancelButton"
              onClick={closeAccordionAndReset}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className="CreateButton"
              onClick={
                isEditing ? handleEditBankAccount : handleCreateBankAccount
              }
              disabled={loading}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="dataGridContainer">
        <StyledDataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={rowsLoading}
          onRowClick={handleRowClick}
          slots={{ toolbar: GridToolbar, noRowsOverlay: CustomDataGridOverlay }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
        />
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditBankDetails;
