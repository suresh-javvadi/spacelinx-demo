import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import {
  fetchInventoryPartWithPartId,
  updateInventoryPart,
  updateInventoryPartById,
} from "../../../services/inventoryPartService";
import { AlertsContext } from "../../AlertsContext/Context";
import { TextField } from "@mui/material";
import { fetchLocationsLookUp } from "../../../services/locationService";
import { fetchBinsByLocationId } from "../../../services/binService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import Cliploader from "../../../Components/Loaders/Cliploader";

const PartInventory = ({ selectedPartId, onInventoryFetchError }) => {
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const { Alert } = useContext(AlertsContext);
  const [inventoryStockData, setInventoryStockData] = useState([]);
  const [partMeta, setPartMeta] = useState({});
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [binsData, setBinsData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (selectedPartId) fetchInventoryForPart();
  }, [selectedPartId]);

  useEffect(() => {
    fetchLocations();
  }, []);
  useEffect(() => {
    if (selectedLocation?.id) {
      fetchBinsData(selectedLocation?.id);
    }
  }, [selectedLocation]);
  useEffect(() => {
    if (selectedLocation && selectedBin) {
      const match = inventoryStockData.find(
        (entry) =>
          entry.location?.id === selectedLocation.id &&
          entry.binId === selectedBin.id,
      );

      if (match) {
        setQuantity(match.quantity);
        setIsEditing(true);
      } else {
        setQuantity("");
        setIsEditing(false);
      }
    }
  }, [selectedLocation, selectedBin]);

  const fetchInventoryForPart = async () => {
    setLoadingData(true);
    try {
      const data = await fetchInventoryPartWithPartId(selectedPartId);
      if (data) {
        setInventoryStockData(data.stock || []);
        setPartMeta(data.part);
      }
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      onInventoryFetchError?.(error); // Pass the error to parent
      setInventoryStockData([]);
      setPartMeta({});
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBinsData = async (id) => {
    try {
      const data = await fetchBinsByLocationId(id);
      setBinsData(data);
    } catch (error) {
      console.error("Error fetching bins:", error);
      Alert("Failed to fetch bins for this location", "error");
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await fetchLocationsLookUp();
      setLocationsData(data);
    } catch (error) {
      Alert("Failed to fetch locations", "error");
    }
  };

  const calculatePartMeta = (stocks, qtyReserved = 0) => {
    const totalLocationQuantity = stocks.reduce(
      (sum, s) => sum + (s.quantity || 0),
      0,
    );

    const reserved = isNaN(qtyReserved) ? 0 : Number(qtyReserved);
    const qtyAvailable = Math.max(0, totalLocationQuantity - reserved);
    const method1InHand = reserved + qtyAvailable;
    const method2InHand = totalLocationQuantity;

    const qtyOnhand = Math.max(method1InHand, method2InHand);

    return { qtyAvailable, qtyOnhand };
  };

  const handlePartMetaChange = (field, value) => {
    setPartMeta((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "qtyReserved") {
        const reserved = parseInt(value || 0, 10);
        const meta = calculatePartMeta(inventoryStockData, reserved);
        updated.qtyAvailable = meta.qtyAvailable;
        updated.qtyOnhand = meta.qtyOnhand;
      }

      return updated;
    });
  };

  const validateReservedQuantity = () => {
    const reserved = Number(partMeta.qtyReserved || 0);
    const inHand = Number(partMeta.qtyOnhand || 0);

    if (reserved > inHand) {
      Alert(
        `Reserved quantity (${reserved}) cannot be more than in-hand quantity (${inHand})`,
        "error",
      );
      return false;
    }
    return true;
  };

  // Transform inventory data to tree structure
  const transformToTreeData = () => {
    const locationMap = new Map();

    inventoryStockData.forEach((stock) => {
      const locationId = stock.location?.id || stock.locationId;
      const locationName = stock.location?.name || "Unknown Location";

      const uniqueLocationKey = `location-${locationId}`;

      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          key: uniqueLocationKey,
          locationName,
          locationNumber: stock.location?.number || "",
          type: "location",
          children: [],
          totalQuantity: 0,
        });
      }

      const location = locationMap.get(locationId);
      const uniqueBinKey = `bin-${locationId}-${stock.binId}`;

      location.children.push({
        key: uniqueBinKey,
        locationName,
        binCode: stock.bin?.binCode || "N/A",
        aisle: stock.bin?.aisle || "N/A",
        rack: stock.bin?.rack || "N/A",
        quantity: stock.quantity || 0,
        type: "bin",
        stockData: stock,
      });

      location.totalQuantity += stock.quantity || 0;
    });

    return Array.from(locationMap.values());
  };

  // Filter data based on search text
  const filterTreeData = (data, searchValue) => {
    if (!searchValue) return data;

    const filtered = [];
    const searchLower = searchValue.toLowerCase();

    data.forEach((location) => {
      const matchingBins = location.children.filter((bin) => {
        return (
          bin.binCode.toLowerCase().includes(searchLower) ||
          bin.aisle.toLowerCase().includes(searchLower) ||
          bin.rack.toLowerCase().includes(searchLower) ||
          bin.locationName.toLowerCase().includes(searchLower)
        );
      });

      const locationMatches =
        location.locationName.toLowerCase().includes(searchLower) ||
        location.locationNumber.toLowerCase().includes(searchLower);

      if (locationMatches || matchingBins.length > 0) {
        filtered.push({
          ...location,
          children: locationMatches ? location.children : matchingBins,
        });
      }
    });

    return filtered;
  };

  // Update filtered data when search text or inventory data changes
  useEffect(() => {
    const treeData = transformToTreeData();
    const filtered = filterTreeData(treeData, searchText);
    setFilteredData(filtered);
  }, [inventoryStockData, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRowClick = (record) => {
    if (!hasPermission(PERMISSIONS.PARTS.INVENTORY.MODIFY)) {
      Alert("You do not have permission to modify inventory", "warning");
      return;
    }
    if (record.type === "bin" && record.stockData) {
      const stockData = record.stockData;
      setSelectedLocation(stockData?.location);
      setSelectedBin(stockData?.bin);
      setQuantity(stockData.quantity || "");
      setIsAccordionOpen(true);
      setIsEditing(true);
    }
  };

  const handleUpdateInventoryTable = () => {
    if (!selectedLocation || quantity === "") {
      Alert("Please fill in all required fields", "warning");
      return;
    }

    const newStock = {
      binId: selectedBin?.id || null,
      quantity: Number(quantity),
      location: selectedLocation,
      locationId: selectedLocation.id,
      bin: selectedBin || null,
    };

    const updatedStockData = [...inventoryStockData];

    const existingIndex = updatedStockData.findIndex(
      (entry) =>
        entry.location?.id === selectedLocation.id &&
        (entry.binId || null) === (selectedBin?.id || null),
    );

    if (existingIndex >= 0) {
      updatedStockData[existingIndex] = {
        ...updatedStockData[existingIndex],
        ...newStock,
      };
    } else {
      updatedStockData.push(newStock);
    }

    const updatedMeta = calculatePartMeta(
      updatedStockData,
      Number(partMeta.qtyReserved || 0),
    );

    setInventoryStockData(updatedStockData);
    setPartMeta((prev) => ({
      ...prev,
      qtyAvailable: updatedMeta.qtyAvailable,
      qtyOnhand: updatedMeta.qtyOnhand,
    }));

    setSelectedLocation(null);
    setSelectedBin(null);
    setQuantity("");
    setIsEditing(false);
    setIsAccordionOpen(false);
  };

  const handleAccordionToggle = () => {
    if (!hasPermission(PERMISSIONS.PARTS.INVENTORY.MODIFY)) {
      Alert("You do not have permission to modify inventory", "warning");
      return;
    }
    if (isAccordionOpen) {
      setSelectedLocation(null);
      setSelectedBin(null);
      setQuantity("");
      setIsEditing(false);
    }
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleAddOrUpdate = async () => {
    if (!hasPermission(PERMISSIONS.PARTS.INVENTORY.MODIFY)) {
      Alert("You do not have permission to modify inventory", "warning");
      return;
    }
    if (!validateReservedQuantity()) return;

    setLoadingData(true);

    const payload = {
      skuCode: partMeta.skuCode || "",
      unitPrice: Number(partMeta.unitPrice || 0),
      reorderLevel: Number(partMeta.reorderLevel || 0),
      qtyReserved: Number(partMeta.qtyReserved || 0),
      qtyOnhand: Number(partMeta.qtyOnhand || 0),
      qtyAvailable: Number(partMeta.qtyAvailable || 0),
      inventoryStocks: inventoryStockData.map((entry) => ({
        binId: entry.binId || null,
        quantity: Number(entry.quantity),
        locationId: entry.location?.id || entry.locationId,
      })),
    };

    try {
      await updateInventoryPart(selectedPartId, payload);
      Alert("Inventory saved successfully", "success");
      fetchInventoryForPart();
    } catch (error) {
      Alert(
        error?.response?.data?.message || "Error saving inventory",
        "error",
      );
    } finally {
      setLoadingData(false);
    }
  };
  const handleUpdate = async () => {
    if (!hasPermission(PERMISSIONS.PARTS.INVENTORY.MODIFY)) {
      Alert("You do not have permission to modify inventory", "warning");
      return;
    }
    if (!validateReservedQuantity()) return;

    setLoadingData(true);

    const payload = {
      skuCode: partMeta.skuCode || "",
      unitPrice: Number(partMeta.unitPrice || 0),
      reorderLevel: Number(partMeta.reorderLevel || 0),
    };

    try {
      await updateInventoryPartById(selectedPartId, payload);
      Alert("Inventory saved successfully", "success");
      fetchInventoryForPart();
    } catch (error) {
      Alert(
        error?.response?.data?.message || "Error saving inventory",
        "error",
      );
    } finally {
      setLoadingData(false);
    }
  };

  const getDisabledLocationsAndBins = () => {
    const disabledLocations = new Set();
    const binMap = new Map();

    // Collect bins per location
    inventoryStockData.forEach((entry) => {
      const locationId = entry.location?.id;
      const binId = entry.binId;

      if (!binMap.has(locationId)) binMap.set(locationId, new Set());
      binMap.get(locationId).add(binId);
    });

    locationsData.forEach((loc) => {
      const locationId = loc.id;
      const allBinsForLoc = binsData.filter((b) => b.locationId === locationId);
      const existingBinIds = binMap.get(locationId) || new Set();

      // If all bins are used up, disable location
      if (
        allBinsForLoc.length > 0 &&
        allBinsForLoc.every((b) => existingBinIds.has(b.id))
      ) {
        disabledLocations.add(locationId);
      }
    });

    return { disabledLocations, binMap };
  };

  const columns = [
    {
      title: "Location / Bin",
      dataIndex: "locationName",
      key: "locationName",
      render: (text, record) => {
        if (record.type === "location") {
          return (
            <strong className="location-name">
              {record.locationName} ({record.locationNumber})
            </strong>
          );
        }
        return <span style={{ marginLeft: 16 }}>{record.binCode}</span>;
      },
    },
    {
      title: "Aisle",
      dataIndex: "aisle",
      key: "aisle",
      render: (text, record) => {
        if (record.type === "location") return null;
        return text || "N/A";
      },
    },
    {
      title: "Rack",
      dataIndex: "rack",
      key: "rack",
      render: (text, record) => {
        if (record.type === "location") return null;
        return text || "N/A";
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => {
        if (record.type === "location") {
          return <strong>{record.totalQuantity}</strong>;
        }
        return text || 0;
      },
    },
  ];
  return (
    <div className="PartInventoryMain">
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={true} />
        </div>
      ) : (
        <div className="PartInventoryTab">
          <div className="PartDetails">
            <div className="InPartDetailsHeader">
              <div>Available Quantity: {partMeta.qtyAvailable || 0}</div>
              <div>Reserved Quantity: {partMeta.qtyReserved || 0}</div>
              <div>Issued Quantity: {partMeta.qtyIssued || 0}</div>
            </div>
            <div className="PartDetailsInputs">
              <TextField
                label="SKU Code"
                value={partMeta.skuCode || ""}
                onChange={(e) =>
                  handlePartMetaChange("skuCode", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Reorder Level"
                type="number"
                value={partMeta.reorderLevel || 0}
                onChange={(e) =>
                  handlePartMetaChange("reorderLevel", e.target.value)
                }
                fullWidth
              />
            </div>
            <div className="PartInventoryTabFooter">
              <Button
                onClick={handleUpdate}
                className={
                  !hasPermission(PERMISSIONS.PARTS.INVENTORY.MODIFY)
                    ? "IonIconDisabled UploadButton"
                    : "UploadButton"
                }
              >
                Save
              </Button>{" "}
            </div>
          </div>

          {/* <Row gutter={[16, 16]} style={{ marginBottom: 0 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              className="PartInventoryDataGridHeader"
              placeholder="Search location, bin, aisle, or rack..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <div className="AntTableDiv">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loadingData}
            className="PartInventoryAntTable"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: "pointer" },
            })}
            rowClassName={(record) =>
              record.type === "location" ? "location-row" : "bin-row"
            }
          />
        </div> */}
        </div>
      )}
    </div>
  );
};

export default PartInventory;
