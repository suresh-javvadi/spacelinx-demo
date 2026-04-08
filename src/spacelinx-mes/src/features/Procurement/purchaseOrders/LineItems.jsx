import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from "@mui/material";
import DiscountIcon from "@mui/icons-material/Discount";
import CustomDataGridOverlay from "../../../Components/CustomDatagridOverlay/CustomDataGridOverlay";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import { createFilterOptions } from "@mui/material/Autocomplete";
import {
  createPartItem,
  fetchPartsWithGoodsAndServices,
} from "../../../services/partService";
import {
  fetchOptionSetByName,
  updateOptionSet,
} from "../../../services/optionSetService";
import { fetchCurrencyLookup } from "../../../services/currencyService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { formatAmount } from "../../../utils/numberFormatter";

const initialLineItemState = {
  part: null,
  hsn: "",
  description: "",
  orderedQuantity: "1",
  unitPrice: 0,
  taxType: "Fixed",
  tax: 0,
  discount: 0,
  discountType: "Percentage",
  expectedDeliveryDate: null,
};

const initialNewTaxGroupState = {
  name: "",
  value: "",
  operator: "%",
  description: "",
};

const filterOptions = createFilterOptions({
  stringify: (option) =>
    `${option.manufacturingPartNumber} ${option.partNumber} ${option.name}`,
});

const LineItems = ({ lineItems = [], setPoData, poData, lineItemsRef }) => {
  const { Alert } = useContext(AlertsContext);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [optionSetData, setOptionSetData] = useState(null);
  const [itemAutoCompleteLoading, setItemAutoCompleteLoading] = useState(false);
  const [isTaxPopupOpen, setIsTaxPopupOpen] = useState(false);
  const [newTaxGroup, setNewTaxGroup] = useState(initialNewTaxGroupState);
  const [newTaxGroupErrors, setNewTaxGroupErrors] = useState({});
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountLevel, setDiscountLevel] = useState("Item Level");
  const [internalLineItems, setInternalLineItems] = useState([]);
  const [GSTOption, setGSTOption] = useState("SGST/CGST");
  const [currencies, setCurrencies] = useState([]);
  const [poSymbol, setPoSymbol] = useState("₹");
  const [roundOffEnabled, setRoundOffEnabled] = useState(
    poData?.roundOff !== 0 && poData?.roundOff !== null,
  );
  const [roundOffValue, setRoundOffValue] = useState(poData?.roundOff || 0);

  useEffect(() => {
    if (poData?.currencyId && currencies.length > 0) {
      const selectedCurrency = currencies.find(
        (c) => c.id === poData.currencyId,
      );
      if (selectedCurrency?.symbol) {
        setPoSymbol(selectedCurrency.symbol);
      } else {
        setPoSymbol("₹");
      }
    } else {
      setPoSymbol("₹");
    }
  }, [poData?.currencyId, currencies]);

  useEffect(() => {
    if (lineItemsRef) {
      const payloadItems = internalLineItems.map((item) => {
        const calculatedValues = calculateItemTaxAndTotal(item);
        return {
          ...item,
          tax: item.tax,
          taxAmount: calculatedValues.tax,
          totalPrice: calculatedValues.totalPrice,
          total: calculatedValues.grandTotal,
          ExpectedDeliveryDate: item.expectedDeliveryDate
            ? dayjs(item.expectedDeliveryDate).format("YYYY-MM-DD")
            : null,
        };
      });
      lineItemsRef.current = payloadItems;
    }
  }, [internalLineItems, lineItemsRef]);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPartsWithGoodsAndServices();
      setParts(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert("Error fetching parts", "error");
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, [Alert]);

  const fetchCurrencyData = useCallback(async () => {
    setLoading(true);
    try {
      const currencyData = await fetchCurrencyLookup();
      if (currencyData) {
        setCurrencies(currencyData);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptionSets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOptionSetByName("Tax Groups");
      if (data) {
        setOptionSetData(data);
        const parsedOptions = data.values ? JSON.parse(data.values) : [];
        setTaxOptions(parsedOptions);
      } else {
        setTaxOptions([]);
        setOptionSetData(null);
      }
    } catch (error) {
      Alert("Error fetching tax options", "error");
      setTaxOptions([]);
      setOptionSetData(null);
    } finally {
      setLoading(false);
    }
  }, [Alert]);

  useEffect(() => {
    fetchParts();
    fetchOptionSets();
    fetchCurrencyData();
  }, [fetchParts, fetchOptionSets, fetchCurrencyData]);

  useEffect(() => {
    const ensureIds = lineItems?.map((item) => {
      const dateValue = item.expectedDeliveryDate
        ? dayjs(item.expectedDeliveryDate)
        : initialLineItemState.expectedDeliveryDate;

      if (!item.id) {
        return {
          ...item,
          id: `${Date.now()}-${Math.random()}`,
          isClientGeneratedId: true,
          expectedDeliveryDate: dateValue,
        };
      }
      return {
        ...item,
        isClientGeneratedId: false,
        expectedDeliveryDate: dateValue,
      };
    });
    setInternalLineItems(ensureIds);
  }, [lineItems]);

  const handleFieldChange = (id, name, value) => {
    setInternalLineItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, [name]: value } : item,
      );
      return updatedItems;
    });
  };

  const createItem = async (input, type) => {
    setItemAutoCompleteLoading(true);
    const payload = {
      name: input,
      unitPrice: 0,
      itemType: type,
    };
    try {
      const newPart = await createPartItem(payload);
      Alert(`${input} Created Successfully as ${type}`, "success");
      setParts((prevParts) => [...prevParts, newPart]);
      return newPart;
    } catch (error) {
      console.error(error);
      Alert(`Failed to create ${input} as ${type}`, "error");
      return null;
    } finally {
      setItemAutoCompleteLoading(false);
    }
  };

  const validate = (item) => {
    const newErrors = {};
    if (!item.part) newErrors.part = "Part is required.";
    const quantity = Number(item.orderedQuantity);
    if (isNaN(quantity)) {
      newErrors.orderedQuantity = "Quantity must be a number.";
    } else if (quantity < 1) {
      newErrors.orderedQuantity = "Quantity must be at least 1.";
    }
    const unitPrice = Number(item.unitPrice);
    if (isNaN(unitPrice)) newErrors.unitPrice = "Unit Price must be a number.";
    return newErrors;
  };

  const calculateItemTaxAndTotal = useCallback(
    (itemData) => {
      const quantity = Number(itemData.orderedQuantity) || 0;
      const price = Number(itemData.unitPrice) || 0;
      let base = quantity * price;

      let discountAmount = 0;
      if (discountLevel === "Item Level" && itemData.discount) {
        if (itemData.discountType === "Percentage") {
          discountAmount = base * (Number(itemData.discount) / 100);
        } else {
          discountAmount = Number(itemData.discount);
        }
      }
      const totalPriceExcludingTaxAndDiscount = base - discountAmount;

      let taxAmount = 0;
      let taxRateOrFixedAmount = Number(itemData.tax) || 0;
      const taxOption = taxOptions.find((opt) => opt.name === itemData.taxType);

      if (taxOption) {
        const groupValue = Number(taxOption.value) || 0;
        if (taxOption.operator === "%") {
          taxAmount = totalPriceExcludingTaxAndDiscount * (groupValue / 100);
        } else if (taxOption.operator === "+") {
          taxAmount = groupValue;
        }
      } else if (itemData.taxType === "Percentage") {
        taxAmount =
          totalPriceExcludingTaxAndDiscount * (taxRateOrFixedAmount / 100);
      } else if (itemData.taxType === "Fixed") {
        taxAmount = taxRateOrFixedAmount;
      }

      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      if (GSTOption === "SGST/CGST") {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      } else if (GSTOption === "IGST") {
        igst = taxAmount;
      }

      return {
        tax: taxAmount,
        cgst,
        sgst,
        igst,
        totalPrice: base,
        grandTotal: totalPriceExcludingTaxAndDiscount + taxAmount,
        discount: discountAmount,
        taxPercentage:
          taxAmount > 0 && totalPriceExcludingTaxAndDiscount > 0
            ? (taxAmount / totalPriceExcludingTaxAndDiscount) * 100
            : 0,
        taxType: itemData.taxType,
      };
    },
    [taxOptions, discountLevel, GSTOption],
  );

  const costSummary = useMemo(() => {
    const subtotal = internalLineItems.reduce((acc, item) => {
      const quantity = Number(item.orderedQuantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + quantity * price;
    }, 0);

    let totalTax = 0;
    let totalDiscount = 0;

    const taxBreakdown = {
      sgst: {},
      cgst: {},
      igst: {},
    };

    const taxCounts = {
      sgst: {},
      cgst: {},
      igst: {},
    };

    internalLineItems.forEach((item) => {
      const { tax, cgst, sgst, igst, discount, taxPercentage } =
        calculateItemTaxAndTotal(item);
      totalTax += tax;
      totalDiscount += discount;

      const taxKey = taxPercentage.toFixed(2);
      if (GSTOption === "SGST/CGST") {
        if (taxKey in taxBreakdown.sgst) {
          taxBreakdown.sgst[taxKey] += sgst;
          taxBreakdown.cgst[taxKey] += cgst;
          taxCounts.sgst[taxKey] += 1;
          taxCounts.cgst[taxKey] += 1;
        } else {
          taxBreakdown.sgst[taxKey] = sgst;
          taxBreakdown.cgst[taxKey] = cgst;
          taxCounts.sgst[taxKey] = 1;
          taxCounts.cgst[taxKey] = 1;
        }
      } else if (GSTOption === "IGST") {
        if (taxKey in taxBreakdown.igst) {
          taxBreakdown.igst[taxKey] += igst;
          taxCounts.igst[taxKey] += 1;
        } else {
          taxBreakdown.igst[taxKey] = igst;
          taxCounts.igst[taxKey] = 1;
        }
      }
    });

    if (discountLevel === "Transaction Level" && discountValue) {
      if (discountType === "Percentage") {
        const transactionDiscount = subtotal * (Number(discountValue) / 100);
        totalDiscount = transactionDiscount;
      } else {
        totalDiscount = Number(discountValue) || 0;
      }
    }

    const discountedSubtotal = subtotal - totalDiscount;
    const grandTotalBeforeRoundOff = discountedSubtotal + totalTax;

    const finalRoundOff = roundOffEnabled ? Number(roundOffValue) || 0 : 0;
    const grandTotal = grandTotalBeforeRoundOff + finalRoundOff;

    setPoData({
      ...poData,
      totalAmount: grandTotal,
      roundOff: finalRoundOff,
    });

    return {
      subtotal,
      totalTax,
      totalDiscount,
      grandTotal,
      grandTotalBeforeRoundOff,
      roundOff: finalRoundOff,
      taxBreakdown,
      taxCounts,
    };
  }, [
    internalLineItems,
    discountValue,
    discountLevel,
    discountType,
    calculateItemTaxAndTotal,
    setPoData,
    GSTOption,
    roundOffEnabled,
    roundOffValue,
  ]);

  const handleDeleteRow = (id, event) => {
    event.stopPropagation();
    const updatedItems = internalLineItems.filter((item) => item.id !== id);
    setInternalLineItems(updatedItems);
  };

  const handleAddNewLineItem = () => {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      part: null,
      hsn: "",
      description: "",
      orderedQuantity: initialLineItemState.orderedQuantity,
      unitPrice: initialLineItemState.unitPrice,
      taxType: initialLineItemState.taxType,
      tax: initialLineItemState.tax,
      discount: initialLineItemState.discount,
      discountType: initialLineItemState.discountType,
      expectedDeliveryDate: initialLineItemState.expectedDeliveryDate,
      isNew: true,
    };
    setInternalLineItems([...internalLineItems, newItem]);
  };

  const handleDiscountLevelChange = (e) => {
    const value = e.target.value;
    setDiscountLevel(value);

    if (value === "Transaction Level") {
      setPoData({
        ...poData,
        discount: discountValue,
        discountType: discountType,
      });
      setInternalLineItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          discount: 0,
          discountType: "Percentage",
        })),
      );
    } else {
      setPoData({
        ...poData,
        discount: 0,
        discountType: null,
      });
      setInternalLineItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          discount: 0,
          discountType: "Percentage",
        })),
      );
    }
  };

  const validateNewTaxGroup = () => {
    const newErrors = {};
    if (!newTaxGroup.name) {
      newErrors.name = "Name is required.";
    }
    if (!newTaxGroup.value || isNaN(Number(newTaxGroup.value))) {
      newErrors.value = "Value is required and must be a number.";
    }
    setNewTaxGroupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTaxGroup = async () => {
    if (!validateNewTaxGroup()) {
      return;
    }

    if (!optionSetData) {
      Alert("Could not find the 'Tax Groups' option set.", "error");
      return;
    }

    const currentValues = optionSetData.values
      ? JSON.parse(optionSetData.values)
      : [];
    const newGroup = {
      name: newTaxGroup.name,
      value: newTaxGroup.value,
      operator: newTaxGroup.operator,
      description: newTaxGroup.description,
    };

    const updatedValues = [...currentValues, newGroup];
    const updatedPayload = {
      ...optionSetData,
      values: JSON.stringify(updatedValues),
    };

    try {
      await updateOptionSet(optionSetData.id, updatedPayload);
      Alert("New tax group created successfully!", "success");
      setTaxOptions(updatedValues);
      setIsTaxPopupOpen(false);
      setNewTaxGroup(initialNewTaxGroupState);
      setNewTaxGroupErrors({});
    } catch (error) {
      console.error("Error updating option set:", error);
      Alert("Failed to create new tax group.", "error");
    }
  };

  const columns = [
    {
      field: "serialNumber",
      headerName: "Item No.",
      minWidth: 50,
      renderCell: (params) =>
        (params.api.getRowIndexRelativeToVisibleRows(params.id) + 1) * 10,
    },
    {
      field: "partNumber",
      headerName: "# Item",
      flex: 2,
      headerClassName: "DataGridColumn",
      valueGetter: (_value, row) =>
        row.part ? `${row.part.partNumber || ""} - ${row.part.name || ""}` : "",
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <Autocomplete
              freeSolo
              options={parts}
              value={row.part}
              loading={itemAutoCompleteLoading}
              fullWidth
              onChange={async (e, newValue) => {
                if (newValue?.isCustom) {
                  const createdPart = await createItem(
                    newValue.name,
                    newValue.type,
                  );
                  if (createdPart) {
                    handleFieldChange(row.id, "part", createdPart);
                  }
                } else {
                  handleFieldChange(row.id, "part", newValue);
                }
              }}
              getOptionLabel={(option) => {
                if (option.type === "Goods" || option.type === "Services") {
                  return `Add ${option.type}: "${option.name}"`;
                }
                return option
                  ? `${option.partNumber || ""} - ${option.name || ""}`
                  : "";
              }}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              filterOptions={(options, state) => {
                const filtered = filterOptions(options, state);
                const { inputValue } = state;

                if (inputValue) {
                  const customOptions = [];

                  const existingGoods = filtered.some(
                    (option) =>
                      option.name === inputValue && option.itemType === "Goods",
                  );
                  if (!existingGoods) {
                    customOptions.push({
                      name: inputValue,
                      type: "Goods",
                      isCustom: true,
                    });
                  }

                  const existingServices = filtered.some(
                    (option) =>
                      option.name === inputValue &&
                      option.itemType === "Services",
                  );
                  if (!existingServices) {
                    customOptions.push({
                      name: inputValue,
                      type: "Services",
                      isCustom: true,
                    });
                  }
                  return [...customOptions, ...filtered];
                }
                return filtered;
              }}
              renderOption={(props, option) => {
                if (option.isCustom) {
                  return (
                    <li {...props} className="LineItemsPartOption">
                      <p className="AddOption">+ Add {option.type}</p>
                      <div>
                        <strong>Name</strong>
                        <p>:</p>
                        <p>{option.name}</p>
                      </div>
                    </li>
                  );
                }

                return (
                  <li {...props} className="LineItemsPartOption">
                    <div>
                      <strong>XDL No.</strong> <p>:</p>
                      <p>{option.partNumber || "N/A"}</p>
                    </div>
                    {option.itemType === null ? (
                      <div>
                        <strong>Manf. No.</strong> <p>:</p>
                        <p>{option.manufacturingPartNumber || "N/A"}</p>
                      </div>
                    ) : null}
                    <div>
                      <strong>Name</strong> <p>:</p>
                      <p>{option.name || "N/A"}</p>
                    </div>
                    <div>
                      <strong>Type</strong> <p>:</p>
                      <p>{option.itemType || "Part"}</p>
                    </div>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Search with Name | XDL No. | Manf. No."
                  error={!!errors.part}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "30px",
                      fontSize: "12px",
                    },
                  }}
                />
              )}
            />
          </div>
        );
      },
    },
    {
      field: "hsn",
      headerName: "HSN Code",
      flex: 0.7,
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <TextField
              fullWidth
              size="small"
              type="text"
              value={row.hsn}
              onChange={(e) => handleFieldChange(row.id, "hsn", e.target.value)}
              placeholder="HSN Code"
              sx={{
                "& .MuiInputBase-root": { height: "30px", fontSize: "12px" },
              }}
            />
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <TextField
              fullWidth
              size="small"
              type="text"
              value={row.description || ""}
              onChange={(e) =>
                handleFieldChange(row.id, "description", e.target.value)
              }
              placeholder="Description"
              sx={{
                "& .MuiInputBase-root": { height: "30px", fontSize: "12px" },
              }}
            />
          </div>
        );
      },
    },
    {
      field: "orderedQuantity",
      headerName: "Quantity",
      flex: 0.7,
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <TextField
              size="small"
              type="number"
              value={row.orderedQuantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) >= 1 && !isNaN(value))) {
                  handleFieldChange(row.id, "orderedQuantity", value);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  handleFieldChange(row.id, "orderedQuantity", 1);
                }
              }}
              placeholder="Qty"
              inputProps={{
                min: 1,
                step: "1",
              }}
              sx={{
                "& .MuiInputBase-root": { height: "30px", fontSize: "12px" },
              }}
            />
          </div>
        );
      },
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 0.8,
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <TextField
              size="small"
              type="number"
              value={row.unitPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) >= 0 && !isNaN(value))) {
                  handleFieldChange(row.id, "unitPrice", value);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  handleFieldChange(row.id, "unitPrice", 0);
                }
              }}
              placeholder="Price"
              inputProps={{
                min: 0,
                step: 0.0001,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{poSymbol} </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "30px",
                  fontSize: "12px",
                },
              }}
            />
          </div>
        );
      },
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      flex: 1,
      renderCell: ({ row }) => {
        const subtotal =
          (Number(row.orderedQuantity) || 0) * (Number(row.unitPrice) || 0);
        return `${poSymbol} ${formatAmount(subtotal)}`;
      },
    },
    ...(discountLevel === "Item Level"
      ? [
          {
            field: "discount",
            headerName: "Discount",
            flex: 1,
            renderCell: ({ row }) => {
              const discountType = row.discountType || "Percentage";
              return (
                <div
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onKeyPress={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  style={{ width: "100%" }}
                >
                  <TextField
                    size="small"
                    value={row.discount || 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = Number(value);
                      if (value === "") {
                        handleFieldChange(row.id, "discount", "");
                        return;
                      }
                      if (!isNaN(numericValue)) {
                        if (row.discountType === "Percentage") {
                          if (numericValue > 100) return;
                          if (numericValue < 0) return;
                        } else {
                          const quantity = Number(row.orderedQuantity) || 0;
                          const price = Number(row.unitPrice) || 0;
                          const subtotal = quantity * price;

                          if (numericValue > subtotal) return;
                          if (numericValue < 0) return;
                        }
                        handleFieldChange(row.id, "discount", numericValue);
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleFieldChange(row.id, "discount", 0);
                      }
                    }}
                    placeholder=""
                    inputProps={{
                      min: 0,
                      step: 0.1,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <TextField
                            select
                            value={discountType}
                            onChange={(e) => {
                              handleFieldChange(
                                row.id,
                                "discountType",
                                e.target.value,
                              );
                              handleFieldChange(row.id, "discount", 0);
                            }}
                            sx={{
                              "& .MuiInputBase-root": {
                                height: "30px",
                                fontSize: "12px",
                                "& fieldset": {
                                  border: "none",
                                },
                              },
                            }}
                          >
                            <MenuItem value="Percentage">%</MenuItem>
                            <MenuItem value="Fixed">{poSymbol}</MenuItem>
                          </TextField>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "30px",
                        fontSize: "12px",
                      },
                    }}
                  />
                </div>
              );
            },
          },
        ]
      : []),
    {
      field: "taxType",
      headerName: "Tax ",
      flex: 1,
      renderCell: ({ row }) => {
        const mainTaxOptions = [
          ...taxOptions,
          { name: "Fixed", description: "Fixed amount tax", operator: "+" },
          {
            name: "Percentage",
            description: "Percentage based tax",
            operator: "%",
          },
          { name: "None", description: "No tax applied", operator: "" },
        ];

        const currentTaxType = row.taxType || "Fixed";

        return (
          <div
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <Autocomplete
              size="small"
              value={
                mainTaxOptions.find(
                  (option) => option.name === currentTaxType,
                ) || null
              }
              onChange={async (e, newValue) => {
                const newTaxType = newValue?.name || "None";
                // For built-in types (Fixed, Percentage, None), reset to 0.
                // For custom tax groups, use their defined value.
                const newTaxValue =
                  newValue?.value !== undefined ? newValue.value : 0;

                handleFieldChange(row.id, "taxType", newTaxType);
                handleFieldChange(row.id, "tax", newTaxValue);
              }}
              disableClearable={true}
              options={mainTaxOptions}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) =>
                option?.name === value?.name
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <div className="TaxGroupsOptions">
                    <p className="Heading">{option.name}</p>
                    {option.description && (
                      <p className="Description">{option.description}</p>
                    )}
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "30px",
                      fontSize: "12px",
                    },
                  }}
                />
              )}
              sx={{ width: "100%" }}
              ListboxProps={{
                style: { position: "relative" },
                onScroll: (event) => {
                  event.stopPropagation();
                },
              }}
              PaperComponent={({ children }) => (
                <Paper>
                  {children}
                  <div
                    className="TaxGroupAddButton"
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      setIsTaxPopupOpen(true);
                    }}
                  >
                    + New Tax Group
                  </div>
                </Paper>
              )}
            />
          </div>
        );
      },
    },
    {
      field: "tax",
      headerName: "Tax Value",
      flex: 1,
      renderCell: ({ row }) => {
        const taxOption = taxOptions.find(
          (opt) => opt.name === (row.taxType || "None"),
        );
        const isTaxValueEditable =
          row.taxType === "Fixed" || row.taxType === "Percentage";
        const displayValue = taxOption ? taxOption.value : (row.tax ?? 0);

        return (
          <div
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <TextField
              size="small"
              type="number"
              value={displayValue}
              onChange={(e) => {
                const newValue = e.target.value;
                if (
                  newValue === "" ||
                  (Number(newValue) >= 0 && !isNaN(newValue))
                ) {
                  handleFieldChange(row.id, "tax", newValue);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  handleFieldChange(row.id, "tax", 0);
                }
              }}
              fullWidth
              placeholder="Value"
              disabled={!isTaxValueEditable}
              inputProps={{
                min: 0,
                step: 0.0001,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {taxOption?.operator ||
                      (row.taxType === "Percentage" ? "%" : `${poSymbol} `)}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "30px",
                  fontSize: "12px",
                },
              }}
            />
          </div>
        );
      },
    },
    {
      field: "taxAmount",
      headerName: "Tax Amount",
      flex: 1,
      valueGetter: (_value, row) => {
        const { tax } = calculateItemTaxAndTotal(row);
        return tax;
      },
      renderCell: ({ value }) => {
        const taxAmount = value || 0;
        return `${poSymbol} ${formatAmount(taxAmount)}`;
      },
    },
    {
      field: "expectedDeliveryDate",
      headerName: "Exp. Delivery",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <div
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      "& .MuiInputBase-root": {
                        height: "30px",
                        fontSize: "12px",
                      },
                    },
                  },
                }}
                value={row.expectedDeliveryDate}
                onChange={(newValue) => {
                  handleFieldChange(row.id, "expectedDeliveryDate", newValue);
                }}
                format="YYYY-MM-DD"
              />
            </LocalizationProvider>
          </div>
        );
      },
    },
    {
      headerName: "",
      field: "actions",
      flex: 0.2,
      renderCell: ({ row }) => {
        return (
          <div
            className="DataGridActionsDiv"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <ion-icon
              name="trash-outline"
              style={{
                fontSize: "1.2rem",
              }}
              onClick={(event) => handleDeleteRow(row.id, event)}
            ></ion-icon>
          </div>
        );
      },
    },
  ];

  return (
    <div className="LineItemsDiv">
      <div className="LineItemControlsDiv">
        <div className="LineItemControlsDivInner">
          <button onClick={handleAddNewLineItem} className="AddOrUpdateButton">
            + Add a Line Item
          </button>
          <Divider orientation="vertical" />
          <TextField
            select
            value={discountLevel}
            onChange={handleDiscountLevelChange}
            sx={{
              "& .MuiInputBase-root": {
                height: "30px",
                fontSize: "12px",
              },
              minWidth: 200,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DiscountIcon sx={{ fontSize: "16px !important" }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="Item Level">Item Level</MenuItem>
            <MenuItem value="Transaction Level">Transaction Level</MenuItem>
          </TextField>

          {discountLevel === "Transaction Level" && (
            <TextField
              label="Disc. Value"
              value={discountValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "" && Number(val) < 0) {
                  Alert("Discount cannot be negative", "error");
                  return;
                }
                if (discountType === "Percentage" && Number(val) > 100) {
                  Alert("Percentage discount cannot exceed 100%", "error");
                  return;
                }
                setDiscountValue(val);
                setPoData({
                  ...poData,
                  discount: val,
                });
              }}
              InputLabelProps={{
                sx: {
                  fontSize: "12px",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  "&.Mui-focused": {
                    top: "0px",
                    transform: "translateY(0%) scale(0.75)",
                  },
                  "&.MuiFormLabel-filled": {
                    top: "-5px",
                    transform: "translateY(0%) scale(0.75)",
                  },
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "30px",
                  fontSize: "12px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TextField
                      select
                      value={discountType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        if (
                          newType === "Percentage" &&
                          Number(discountValue) > 100
                        ) {
                          Alert(
                            "Percentage discount cannot exceed 100%. Adjusting value.",
                            "warning",
                          );
                          setDiscountValue(100);
                          setDiscountType(newType);
                          setPoData({
                            ...poData,
                            discountType: newType,
                            discount: 100,
                          });
                          return;
                        }
                        setDiscountType(newType);
                        setPoData({
                          ...poData,
                          discountType: newType,
                        });
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "30px",
                          fontSize: "12px",
                          "& fieldset": {
                            border: "none",
                          },
                        },
                      }}
                    >
                      <MenuItem value="Percentage">%</MenuItem>
                      <MenuItem value="Fixed">{poSymbol}</MenuItem>
                    </TextField>
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Divider orientation="vertical" />
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="gst-option-radio-buttons"
              name="gst-option-radio-buttons-group"
              value={GSTOption}
              onChange={(e) => {
                setGSTOption(e.target.value);
                setPoData({ ...poData, taxOption: e.target.value });
              }}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "12px",
                },
              }}
            >
              <FormControlLabel
                value="SGST/CGST"
                control={<Radio size="small" />}
                label="SGST/CGST"
              />
              <FormControlLabel
                value="IGST"
                control={<Radio size="small" />}
                label="IGST"
              />
              <FormControlLabel
                value="No Tax Split"
                control={<Radio size="small" />}
                label="No Tax Split"
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="LineItemControlsDivInner">
          <Autocomplete
            options={currencies}
            fullWidth
            getOptionLabel={(option) =>
              option
                ? `${option.country ?? ""} ${
                    option.code ? `(${option.code} ${option.symbol})` : ""
                  }`
                : ""
            }
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            value={currencies.find((c) => c.id === poData?.currencyId) || null}
            onChange={(event, newValue) => {
              setPoData({
                ...poData,
                currencyId: newValue ? newValue.id : null,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Currency Code"
                InputLabelProps={{
                  sx: {
                    fontSize: "12px",
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    "&.Mui-focused": {
                      top: "0px",
                      transform: "translateY(0%) scale(0.75)",
                    },
                    "&.MuiFormLabel-filled": {
                      top: "-5px",
                      transform: "translateY(0%) scale(0.75)",
                    },
                  },
                }}
              />
            )}
            sx={{
              "& .MuiInputBase-root": {
                height: "30px",
                fontSize: "12px",
                minWidth: 300,
              },
            }}
          />
        </div>
      </div>
      <div className="LineItemsDataGridDiv">
        <StyledDataGrid
          rows={internalLineItems}
          columns={columns}
          loading={loading || itemAutoCompleteLoading}
          getRowId={(row) => row.id}
          hideFooter={true}
          className="LineItemsDataGrid"
          slots={{
            noRowsOverlay: CustomDataGridOverlay,
            noResultsOverlay: CustomDataGridOverlay,
          }}
          sx={{
            "& .MuiDataGrid-virtualScrollerContent": {
              paddingTop: "8px", // space between header & first row
            },
          }}
        />
      </div>
      <div className="cost-summary-container">
        <h3 className="cost-summary-title">Cost Summary</h3>
        <div className="cost-summary-stack">
          <div className="cost-row">
            <span className="text-secondary">Subtotal (Excl. Tax)</span>
            <span>
              {poSymbol} {formatAmount(costSummary.subtotal)}
            </span>
          </div>
          <div className="cost-row">
            <span className="text-secondary">Total Discount</span>
            <span>
              -{poSymbol} {formatAmount(costSummary.totalDiscount)}
            </span>
          </div>
          {GSTOption === "SGST/CGST" ? (
            Object.keys(costSummary.taxBreakdown.sgst).map((percent) => (
              <div key={`tax-${percent}`}>
                <div className="cost-row">
                  <span className="text-secondary">
                    SGST ({parseFloat(percent) / 2}%)
                  </span>
                  <span>
                    {poSymbol}{" "}
                    {formatAmount(costSummary.taxBreakdown.sgst[percent])}
                  </span>
                </div>
                <div className="cost-row">
                  <span className="text-secondary">
                    CGST ({parseFloat(percent) / 2}%)
                  </span>
                  <span>
                    {poSymbol}{" "}
                    {formatAmount(costSummary.taxBreakdown.cgst[percent])}
                  </span>
                </div>
              </div>
            ))
          ) : GSTOption === "IGST" ? (
            Object.entries(costSummary.taxBreakdown.igst).map(
              ([percent, amount]) => (
                <div key={`igst-${percent}`} className="cost-row">
                  <span className="text-secondary">IGST ({percent}%)</span>
                  <span>
                    {poSymbol} {formatAmount(amount)}
                  </span>
                </div>
              ),
            )
          ) : GSTOption === "No Tax Split" ? (
            <div className="cost-row">
              <span className="text-secondary">Total Tax</span>
              <span>
                {poSymbol} {formatAmount(costSummary.totalTax)}
              </span>
            </div>
          ) : null}
          <hr className="dark-divider" />
          <div className="cost-row" style={{ alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={roundOffEnabled}
                  onChange={(e) => {
                    setRoundOffEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setRoundOffValue(0);
                    }
                  }}
                  size="small"
                />
              }
              label={<span className="text-secondary">Round Off</span>}
              style={{ margin: 0 }}
            />
            <TextField
              type="number"
              value={roundOffValue}
              onChange={(e) => {
                const value = e.target.value;
                setRoundOffValue(value);
              }}
              onBlur={(e) => {
                if (e.target.value === "") {
                  setRoundOffValue(0);
                }
              }}
              disabled={!roundOffEnabled}
              placeholder="0.00"
              inputProps={{
                step: "0.01",
                style: { textAlign: "right" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{poSymbol} </InputAdornment>
                ),
              }}
              sx={{
                width: "150px",
                "& .MuiInputBase-root": {
                  height: "30px",
                  fontSize: "12px",
                },
              }}
            />
          </div>
          <hr className="dark-divider" />
          <div className="cost-row grand-total-row">
            <span className="grand-total-label">Grand Total</span>
            <span className="grand-total-amount">
              {poSymbol} {formatAmount(costSummary.grandTotal)}
            </span>
          </div>
        </div>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
      <Dialog open={isTaxPopupOpen} onClose={() => setIsTaxPopupOpen(false)}>
        <DialogTitle>{"New Tax Group"}</DialogTitle>
        <DialogContent>
          <div className="PurchaseOrdersDetailsTab">
            <TextField
              placeholder="Name"
              fullWidth
              value={newTaxGroup.name}
              onChange={(e) =>
                setNewTaxGroup({ ...newTaxGroup, name: e.target.value })
              }
              error={!!newTaxGroupErrors.name}
              helperText={newTaxGroupErrors.name}
            />
            <div className="CreateFlyoutBodyTwoColumns">
              <TextField
                select
                label="Operator"
                value={newTaxGroup.operator}
                onChange={(e) =>
                  setNewTaxGroup({ ...newTaxGroup, operator: e.target.value })
                }
              >
                <MenuItem value="%">%</MenuItem>
                <MenuItem value="+">+</MenuItem>
              </TextField>

              <TextField
                label="Value"
                type="number"
                value={newTaxGroup.value}
                onChange={(e) =>
                  setNewTaxGroup({ ...newTaxGroup, value: e.target.value })
                }
                error={!!newTaxGroupErrors.value}
                helperText={newTaxGroupErrors.value}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {newTaxGroup.operator === "%" ? "%" : `${poSymbol}`}
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <TextField
              placeholder="Description (Optional)"
              fullWidth
              value={newTaxGroup.description}
              onChange={(e) =>
                setNewTaxGroup({
                  ...newTaxGroup,
                  description: e.target.value,
                })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <button
            className="DimButton"
            onClick={() => {
              setIsTaxPopupOpen(false);
              setNewTaxGroup(initialNewTaxGroupState);
              setNewTaxGroupErrors({});
            }}
          >
            Close
          </button>
          <button className="AddOrUpdateButton" onClick={handleCreateTaxGroup}>
            Create
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LineItems;
