import { Checkbox, Dropdown, Table, Tooltip } from "antd";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePartDetailsDrawer } from "./PartDetailsContext";
import { Resizable } from "react-resizable";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { fetchLocationView } from "../../../services/childPartService";

const emptyValue = "---";
const sanitizeValue = (value) =>
  value === null || value === undefined || value === "" ? emptyValue : value;

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
      minConstraints={[50, 0]}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const RenderCellWithTooltip = ({ displayText, fullText, onClick }) => {
  const sanitizedText = sanitizeValue(displayText);
  const sanitizedFullText = sanitizeValue(fullText);

  const MIN_LENGTH_FOR_TOOLTIP = 20;
  return (
    <Tooltip
      title={
        sanitizedFullText.length > MIN_LENGTH_FOR_TOOLTIP
          ? sanitizedFullText
          : ""
      }
    >
      <span
        className={
          onClick ? "AppHyperLink single-line-cell" : "single-line-cell"
        }
        onClick={(e) => {
          if (onClick) {
            e.stopPropagation();
            onClick(e);
          }
        }}
      >
        {sanitizedText}
      </span>
    </Tooltip>
  );
};

const RenderMakeBuyWithTooltip = ({ makeBuy }) => {
  const text = makeBuy === 1 ? "Buy" : makeBuy === 0 ? "Make" : undefined;
  if (!text) return null;
  return (
    <div className={`make-buy-cell-table ${makeBuy === 1 ? "buy" : "make"}`}>
      <RenderCellWithTooltip displayText={text} fullText={text} />
    </div>
  );
};

const RenderStatusWithTooltip = ({ status }) => {
  const text = status === "Draft" ? "" : status;
  return <RenderCellWithTooltip displayText={text} fullText={text} />;
};

const RenderSpaceQualifiedWithTooltip = ({ spaceQualified }) => {
  const text =
    spaceQualified === true
      ? "Yes"
      : spaceQualified === false
      ? "No"
      : undefined;
  return <RenderCellWithTooltip displayText={text} fullText={text} />;
};

const RenderIsSerialNumberRequiredWithTooltip = ({
  isSerialNumberRequired,
}) => {
  const text =
    isSerialNumberRequired === true
      ? "Yes"
      : isSerialNumberRequired === false
      ? "No"
      : undefined;
  return <RenderCellWithTooltip displayText={text} fullText={text} />;
};

const matchesSearch = (node, term) => {
  if (!term) return true;
  const lowerCaseTerm = term.toLowerCase();

  // LOCATION search
  if (node.type === "LOCATION") {
    return node.locationName?.toLowerCase().includes(lowerCaseTerm);
  }

  // SUBSYSTEM search
  if (node.type === "SUBSYSTEM") {
    return node.subsystemName?.toLowerCase().includes(lowerCaseTerm);
  }

  // PART search (your existing logic)
  if (node.type === "PART") {
    const fields = [
      node.partNumber,
      node.name,
      node.status === "Draft" ? "" : node.status,
      node.manufacturingPartNumber,
      node.manufacturerName,
      node.weight,
      node.trl,
      node.referenceNumber,
      node.partTypeName || "",
      node.partTypeCategory || "",
      node.unitOfMeasure?.name || "",
      node.makeBuy ? "Buy" : "Make",
      node.isSerialNumberRequired ? "Required" : "Not Required",
      node.spaceQualified ? "Yes" : "No",
    ];

    return fields.some((field) =>
      String(field ?? "")
        .toLowerCase()
        .includes(lowerCaseTerm)
    );
  }

  return false;
};

const filterTreeData = (data = [], term) => {
  if (!term) return data;

  return data.reduce((acc, node) => {
    const hasMatch = matchesSearch(node, term);

    let filteredChildren = [];
    if (node.children?.length) {
      filteredChildren = filterTreeData(node.children, term);
    }
    if (hasMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren.length ? filteredChildren : node.children,
      });
    }

    return acc;
  }, []);
};

const formatLocationTreeData = (data = []) => {
  if (!Array.isArray(data)) return [];

  return data.map((location) => {
    const locationPath = `location/${location.locationId}`;

    return {
      key: locationPath,
      __path: locationPath,
      type: "LOCATION",
      locationId: location.locationId,
      name: location.locationName,
      locationName: location.locationName,
      children: formatSubsystemTreeData(location.subsystems, locationPath),
    };
  });
};

const formatSubsystemTreeData = (subsystems = [], parentPath) => {
  if (!Array.isArray(subsystems)) return [];

  return subsystems.map((subsystem, index) => {
    const subsystemPath = `${parentPath}/subsystem/${subsystem.subsystemName}@${index}`;

    return {
      key: subsystemPath,
      __path: subsystemPath,
      type: "SUBSYSTEM",
      subsystemId: subsystem.subsystemId,
      name: subsystem.subsystemName,
      subsystemName: subsystem.subsystemName,
      children: formatPartChildren(subsystem.parts, subsystemPath),
    };
  });
};

const formatPartChildren = (parts = [], parentPath) =>
  parts.map((part, index) => {
    const nodePath = `${parentPath}/${part.ebomId ?? part.id}@${index}`;

    return {
      ...part,
      key: nodePath,
      __path: nodePath,
      type: "PART",
      children: formatPartChildren(part.children, nodePath),
    };
  });

const LocationViewAntDTable = ({
  canEdit = false,
  setSelectedChildPartId,
  setEditMode,
  setSelectedEBomId,
  handleDelete,
  setFormValues,
  setParentId,
  selectedId,
}) => {
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRowKey, setEditingRowKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [bomTreeData, setBomTreeData] = useState([]);
  const [loadingBomTreeData, setLoadingBomTreeData] = useState(true);
  const useDebouncedValue = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
  };

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const getAllExpandableKeys = (nodes, keys = []) => {
    for (const node of nodes) {
      if (node.children?.length) {
        keys.push(node.key);
        getAllExpandableKeys(node.children, keys);
      }
    }
    return keys;
  };

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setExpandedRowKeys([]);
      return;
    }
    setExpandedRowKeys(getAllExpandableKeys(filteredBomTreeData));
  }, [debouncedSearchTerm]);

  const initialVisibleColumnsAntD = {
    partNumber: true,
    name: true,
    quantity: true,
    status: true,
    partTypeName: true,
    partTypeCategory: false,
    makeBuy: true,
    manufacturingPartNumber: true,
    manufacturerName: true,
    trl: false,
    material: true,
    spaceQualified: false,
    weight: false,
    isSerialNumberRequired: false,
    referenceNumber: false,
    countryOfOriginName: false,
    action: true,
    shortDescription: true,
  };

  const [visibleColumnsAntD, setVisibleColumnsAntD] = useState(() => {
    const saved = localStorage.getItem("subsystemBomAntDColumnVisibility");
    const parsed = saved ? JSON.parse(saved) : initialVisibleColumnsAntD;
    return { ...initialVisibleColumnsAntD, ...parsed };
  });

  const initialAntDesignColumns = [
    {
      title: "Part Number",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 150,
      fixed: "left",
      className: "first-column",
      render: (text, record) => {
        if (record.type === "SUBSYSTEM" || record.type === "LOCATION") {
          return {
            children: <div className="subsystem-title">{record.name}</div>,
            props: {
              colSpan: TOTAL_COLUMNS,
            },
          };
        }

        return (
          <RenderCellWithTooltip
            displayText={record.partNumber}
            fullText={record.partNumber}
            onClick={() => {
              if (record.partNumber) {
                openPartDetailsDrawer({
                  partNumber: record.partNumber,
                  partNumberSuffix: record.partNumberSuffix,
                });
              }
            }}
          />
        );
      },
      sorter: (a, b) => (a.partNumber || "").localeCompare(b.partNumber || ""),
    },
    {
      title: "Part Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Short Description",
      dataIndex: "shortDescription",
      key: "shortDescription",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.shortDescription || "";
        const valB = b.shortDescription || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip
            displayText={
              editingRowKey === record.key ? editingValue : record.quantity
            }
            fullText={record.quantity}
          />
        ),
      sorter: (a, b) => {
        const valA = a.quantity || 0;
        const valB = b.quantity || 0;
        return valA - valB;
      },
    },
    {
      title: "Part Type",
      dataIndex: "partTypeName",
      key: "partTypeName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.partTypeName || "";
        const valB = b.partTypeName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Category",
      dataIndex: "partTypeCategory",
      key: "partTypeCategory",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.partTypeCategory || "";
        const valB = b.partTypeCategory || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Make/Buy",
      dataIndex: "makeBuy",
      key: "makeBuy",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (makeBuy, record) =>
        hideForSubsystem(record) ?? (
          <RenderMakeBuyWithTooltip makeBuy={makeBuy} />
        ),
      sorter: (a, b) => {
        const valA = a.makeBuy ? "Buy" : "Make";
        const valB = b.makeBuy ? "Buy" : "Make";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Manufacturing Part Number",
      dataIndex: "manufacturingPartNumber",
      key: "manufacturingPartNumber",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.manufacturingPartNumber || "";
        const valB = b.manufacturingPartNumber || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Manufacturer Name",
      dataIndex: "manufacturerName",
      key: "manufacturerName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.manufacturerName || "";
        const valB = b.manufacturerName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "TRL #",
      dataIndex: "trl",
      key: "trl",
      width: 80,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.trl || 0;
        const valB = b.trl || 0;
        return valA - valB;
      },
    },
    {
      title: "Material",
      dataIndex: "material",
      key: "material",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.material || "";
        const valB = b.material || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Country of Origin",
      dataIndex: "countryOfOriginName",
      key: "countryOfOriginName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.countryOfOriginName || "";
        const valB = b.countryOfOriginName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Space Qualified",
      dataIndex: "spaceQualified",
      key: "spaceQualified",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (spaceQualified, record) =>
        hideForSubsystem(record) ?? (
          <RenderSpaceQualifiedWithTooltip spaceQualified={spaceQualified} />
        ),
      sorter: (a, b) => {
        const valA = a.spaceQualified ? "Yes" : "No";
        const valB = b.spaceQualified ? "Yes" : "No";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (status, record) =>
        hideForSubsystem(record) ?? <RenderStatusWithTooltip status={status} />,
      sorter: (a, b) => {
        const valA = a.status || "";
        const valB = b.status || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Weight (g)",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.weight || 0;
        const valB = b.weight || 0;
        return valA - valB;
      },
    },
    {
      title: "Location",
      dataIndex: "assemblyLocationName",
      key: "assemblyLocationName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.assemblyLocationName || "";
        const valB = b.assemblyLocationName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Is Serial Number Required?",
      dataIndex: "isSerialNumberRequired",
      key: "isSerialNumberRequired",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (isSerialNumberRequired, record) =>
        hideForSubsystem(record) ?? (
          <RenderIsSerialNumberRequiredWithTooltip
            isSerialNumberRequired={isSerialNumberRequired}
          />
        ),
      sorter: (a, b) => {
        const valA = a.isSerialNumberRequired ? "Yes" : "No";
        const valB = b.isSerialNumberRequired ? "Yes" : "No";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Old Part Number",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text, record) =>
        hideForSubsystem(record) ?? (
          <RenderCellWithTooltip displayText={text} fullText={text} />
        ),
      sorter: (a, b) => {
        const valA = a.referenceNumber || "";
        const valB = b.referenceNumber || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "",
      key: "action",
      width: 40,
      className: "single-line-cell-wrapper",
      render: (_, record) => {
        if (record.type === "SUBSYSTEM" || record.type === "LOCATION")
          return null;
        return (
          <ion-icon
            name="trash-outline"
            onClick={async () => {
              if (!hasPermission(PERMISSIONS.PARTS.BOM.DELETE)) {
                Alert("You don't have permission to delete BOMs.", "warning");
                return;
              }
              const confirmed = await showConfirmation(
                "Are you sure?",
                "This part will be deleted from the BOM."
              );

              if (confirmed) {
                try {
                  await handleDelete(record.ebomId);
                  showAlert("success", "Deleted", "Part Deleted Successfully");
                  Alert("Removed Child Part Successfully..!", "success");
                } catch (error) {
                  Alert("Couldn't Remove Part..!", "error");
                  console.error(error);
                }
              } else {
                console.warn("No valid EBOM ID found for record:", record);
              }
            }}
          ></ion-icon>
        );
      },
    },
  ];

  const TOTAL_COLUMNS = initialAntDesignColumns.length;

  const hideForSubsystem = (record) =>
    record?.type === "SUBSYSTEM" || record?.type === "LOCATION"
      ? { props: { colSpan: 0 } }
      : null;

  const [allAntDesignColumns, setAllAntDesignColumns] = useState(
    initialAntDesignColumns
  );

  useEffect(() => {
    if (!selectedId) return;
    fetchLocationViewBOMTreeData(selectedId);
  }, [selectedId]);

  const fetchLocationViewBOMTreeData = async (selectedId) => {
    if (!selectedId) {
      setBomTreeData([]);
      setLoadingBomTreeData(false);
      return;
    }

    setLoadingBomTreeData(true);

    try {
      const data = await fetchLocationView(selectedId);
      if (data) {
        const formattedData = formatLocationTreeData(data);
        setBomTreeData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching Location BOM Tree:", error);
      Alert("Failed to fetch Location BOM data.", "error");
      setBomTreeData([]);
    } finally {
      setLoadingBomTreeData(false);
    }
  };

  const handleRowEdit = (record) => {
    if (!canEdit) return;

    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
      Alert("You don't have permission to modify BOMs.", "warning");
      return;
    }

    setSelectedChildPartId(record.id);
    setSelectedEBomId(record.ebomId || record.id);
    setEditMode(true);
    setParentId(record?.parentId);

    setFormValues({
      childPartData: record,
      quantity: record.quantity,
      assemblyLocationId: record?.assemblyLocationId,
    });

    setEditingRowKey(record.key);
    setEditingValue(record.quantity);
  };

  const handleResize = useCallback(
    (key) =>
      (e, { size }) => {
        setAllAntDesignColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.key === key ? { ...col, width: Math.max(size.width, 50) } : col
          )
        );
      },
    []
  );

  const getResizableColumns = (columns) =>
    columns.map((col) => ({
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: handleResize(column.key),
      }),
    }));

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const handleColumnToggleAntD = (key) => {
    setVisibleColumnsAntD((prev) => {
      const newModel = { ...prev, [key]: !prev[key] };
      localStorage.setItem(
        "subsystemBomAntDColumnVisibility",
        JSON.stringify(newModel)
      );
      return newModel;
    });
  };

  const columnsDropdownMenu = (
    <div
      style={{
        padding: 8,
        maxHeight: 300,
        overflowY: "auto",
        backgroundColor: "#333",
        borderRadius: 4,
        border: "1px solid #555",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allAntDesignColumns.map((col) => (
        <div key={col.key} style={{ padding: "4px 8px" }}>
          <Checkbox
            checked={!!visibleColumnsAntD[col.key]}
            onChange={() => handleColumnToggleAntD(col.key)}
            style={{ color: "white" }}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  const getAllRowKeys = (data) => {
    let keys = [];
    data.forEach((item) => {
      keys.push(item.key);
      if (item.children) {
        keys = keys.concat(getAllRowKeys(item.children));
      }
    });
    return keys;
  };

  const getRowKeysByDepth = (nodes, maxDepth, depth = 0, keys = []) => {
    if (depth >= maxDepth) return keys;

    for (const node of nodes) {
      if (node.children?.length) {
        keys.push(node.key);
        getRowKeysByDepth(node.children, maxDepth, depth + 1, keys);
      }
    }
    return keys;
  };

  const handleExpandAll = () => {
    const keys = getRowKeysByDepth(bomTreeData, 2);
    setExpandedRowKeys(keys);
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

  const countVisibleNodes = (data, expandedKeys) => {
    let count = 0;
    data.forEach((item) => {
      count++;
      if (
        expandedKeys.includes(item.key) &&
        item.children &&
        item.children.length > 0
      ) {
        count += countVisibleNodes(item.children, expandedKeys);
      }
    });
    return count;
  };

  const filteredBomTreeData = useMemo(() => {
    if (!debouncedSearchTerm) return bomTreeData;
    return filterTreeData(bomTreeData, debouncedSearchTerm);
  }, [bomTreeData, debouncedSearchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setExpandedRowKeys([]);
      return;
    }

    const collectKeys = (nodes, keys = []) => {
      for (const node of nodes) {
        if (node.children?.length) {
          keys.push(node.key);
          collectKeys(node.children, keys);
        }
      }
      return keys;
    };

    setExpandedRowKeys(collectKeys(filteredBomTreeData));
  }, [debouncedSearchTerm]);

  const totalNodeCount = countVisibleNodes(
    filteredBomTreeData,
    expandedRowKeys
  );

  const visibleAntDesignColumns = allAntDesignColumns.filter(
    (col) => visibleColumnsAntD[col.key] || col.key === "partNumber"
  );

  const resizableColumns = getResizableColumns(visibleAntDesignColumns);

  return (
    <div className="PartBomHierarchyDataGridDiv">
      <div className="AntDesignDataGridHeader">
        <input
          type="text"
          placeholder="Search BOM..."
          className="AntDesignSearchBar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="WhereUsedButtons" onClick={handleExpandAll}>
            <ion-icon name="chevron-expand-outline"></ion-icon> Expand All
          </button>
          <button className="WhereUsedButtons" onClick={handleCollapseAll}>
            <ion-icon name="chevron-collapse-outline"></ion-icon> Collapse All
          </button>
          <Dropdown
            overlay={columnsDropdownMenu}
            trigger={["click"]}
            overlayStyle={{ zIndex: 2000 }}
          >
            <button
              className="WhereUsedButtons"
              onClick={(e) => e.preventDefault()}
            >
              <ion-icon name="eye-off-outline"></ion-icon> Hide Columns
            </button>
          </Dropdown>
        </div>
      </div>
      <Table
        columns={resizableColumns}
        dataSource={filteredBomTreeData}
        rowKey="key"
        loading={{ spinning: loadingBomTreeData, tip: "Loading Data" }}
        className="AntDesignDataGrid"
        showSorterTooltip={false}
        rowClassName={(record) => {
          if (record.type === "SUBSYSTEM") return "subsystem-row";
          if (record.makeBuy === 1) return "buy-part-row";
          if (record.makeBuy === 0) return "make-part-row";
          return "";
        }}
        pagination={{
          defaultPageSize: 100,
          showSizeChanger: true,
          pageSizeOptions: ["25", "50", "100"],
          total: totalNodeCount,
          position: ["bottomRight"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={setExpandedRowKeys}
        expandable={{
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!record.children || record.children.length === 0) {
              return <span className="AntD-Expand-Dot"></span>;
            }
            return (
              <ion-icon
                name={
                  expanded ? "chevron-down-outline" : "chevron-forward-outline"
                }
                class="AntD-Expand-Chevron"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
              />
            );
          },
          rowExpandable: (record) =>
            record.children && record.children.length > 0,
        }}
        onRow={(record) => ({
          onClick: () => {
            if (record.type === "SUBSYSTEM") return;
            handleRowEdit(record);
          },
        })}
        components={components}
        locale={{
          emptyText: (
            <div
              style={{
                height: "0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            ></div>
          ),
        }}
      />
    </div>
  );
};
export default LocationViewAntDTable;
