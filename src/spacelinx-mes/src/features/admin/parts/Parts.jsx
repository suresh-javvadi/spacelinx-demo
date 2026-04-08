import React, { useState, useEffect, useContext, useCallback } from "react";
import "../../../features/features.css";
import NewPart from "./NewPart";
import EditPart from "./EditPart";
import { Button, Divider } from "@mui/material";
import { Table, Spin, Dropdown, Menu, Checkbox, Tooltip } from "antd";
import {
  fetchUniqueParts,
  fetchEntirePartHierarchy,
  deletePartById,
} from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ImportComponent from "../ImportComponent";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../../userContext/UserContext";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { Add } from "@mui/icons-material";
import { useFeatureBitContext } from "../../adminuser/FeatureBit/FeatureBitContext";
import { LoadingOutlined } from "@ant-design/icons";
import { Resizable } from "react-resizable";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import "../admin.css";
import { formatAmount } from "../../../utils/numberFormatter";

const emptyValue = "---";
const sanitizeValue = (value) =>
  value === null || value === undefined || value === "" ? emptyValue : value;

const findAndMutatePart = (parts, partId, mutation) => {
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.id === partId) {
      mutation(part);
      return true;
    }
    if (part.children) {
      if (findAndMutatePart(part.children, partId, mutation)) {
        return true;
      }
    }
  }
  return false;
};

const findAndMutatePartByKey = (parts, partKey, mutation) => {
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.key === partKey) {
      mutation(part);
      return true;
    }
    if (part.children) {
      if (findAndMutatePartByKey(part.children, partKey, mutation)) {
        return true;
      }
    }
  }
  return false;
};

const matchesSearch = (part, term) => {
  if (!term) return true;
  const lowerCaseTerm = term.toLowerCase();

  const fields = [
    part.partNumber,
    part.name,
    part.status === "Draft" ? "" : part.status,
    part.manufacturingPartNumber,
    part.manufacturerName,
    part.weight,
    part.unitPrice,
    part.trl,
    part.referenceNumber,
    part.partType?.name || "",
    part.partType?.category || "",
    part.unitOfMeasure?.name || "",
    part.makeBuy ? "Buy" : "Make",
    part.hasBom ? "Yes" : "No",
    part.isSerialNumberRequired ? "Yes" : "No",
    part.spaceQualified ? "Yes" : "No",
  ];

  return fields.some((field) =>
    String(field).toLowerCase().includes(lowerCaseTerm),
  );
};

const filterTreeData = (data, term) => {
  if (!term) return data;
  const filteredData = [];

  for (const part of data) {
    if (matchesSearch(part, term)) {
      let partCopy = { ...part };
      partCopy.children = part.children;
      filteredData.push(partCopy);
    }
  }

  return filteredData;
};

const countAllNodes = (data) => {
  let count = 0;
  data.forEach((item) => {
    count++;
    if (item.children && item.children.length > 0) {
      count += countAllNodes(item.children);
    }
  });
  return count;
};

const assignKeysAndPrepareChildren = (part, parentKey) => {
  const newPart = {
    ...part,
    key: `${parentKey}-${part.id}`,
    children:
      part.hasBom && part.children
        ? part.children.map((child, index) =>
            assignKeysAndPrepareChildren(child, `${parentKey}-${part.id}`),
          )
        : part.hasBom
          ? []
          : undefined,
  };

  return newPart;
};

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

const RenderCellWithTooltip = ({ displayText, fullText }) => {
  const sanitizedText = sanitizeValue(displayText);
  const sanitizedFullText = sanitizeValue(fullText);

  if (sanitizedText === emptyValue) {
    return <span className="single-line-cell">{sanitizedText}</span>;
  }

  const MIN_LENGTH_FOR_TOOLTIP = 20;

  if (sanitizedFullText.length > MIN_LENGTH_FOR_TOOLTIP) {
    return (
      <Tooltip title={sanitizedFullText}>
        <span className="single-line-cell">{sanitizedText}</span>
      </Tooltip>
    );
  } else {
    return <span className="single-line-cell">{sanitizedText}</span>;
  }
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

const RenderPartTypeWithTooltip = ({ partType, record }) => {
  const text = partType?.name || record.partTypeName;
  return <RenderCellWithTooltip displayText={text} fullText={text} />;
};

const RenderCategoryWithTooltip = ({ partType }) => {
  const text = partType?.category;
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

const Parts = () => {
  const { featureBitData } = useFeatureBitContext();
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [bomViewOption, setBomViewOption] = useState(1);
  const [createPartDrawerStatus, setCreatePartDrawerStatus] = useState(false);
  const [editPartDrawerStatus, setEditPartDrawerStatus] = useState(false);
  const [partsData, setPartsData] = useState([]);
  const [loadingPartsData, setLoadingPartsData] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState({});
  const [selectedPartNumberSuffix, setSelectedPartNumberSuffix] =
    useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("partColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          weight: false,
          isSerialNumberRequired: false,
          referenceNumber: false,
          trl: false,
          spaceQualified: false,
          material: true,
          partNumber: true,
          name: true,
          shortDescription: true,
          status: true,
          partType: true,
          category: false,
          makeBuy: true,
          unitOfMeasure: false,
          manufacturingPartNumber: true,
          manufacturerName: true,
          countryOfOrigin: false,
          subsystem: false,
          partLevel: false,
          grade: false,
          qualification: false,
          specification: false,
          package: false,
          radiationTolerance: false,
          tempCoefficient: false,
          tempRange: false,
        };
  });

  const initialVisibleColumns = {
    partNumber: true,
    name: true,
    unitOfMeasure: true,
    partType: true,
    category: false,
    makeBuy: true,
    manufacturingPartNumber: true,
    manufacturerName: true,
    trl: true,
    material: true,
    spaceQualified: true,
    status: true,
    weight: false,
    isSerialNumberRequired: false,
    referenceNumber: false,
    countryOfOrigin: false,
  };

  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

  const navigate = useNavigate();
  const location = useLocation();

  const initialAntDesignColumns = [
    {
      title: "Part Number",
      dataIndex: "partNumber",
      key: "partNumber",
      fixed: "left",
      width: 100,
      className: "first-column",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.partNumber || "";
        const valB = b.partNumber || "";
        return valA.localeCompare(valB);
      },
    },

    {
      title: "Part Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.name || "";
        const valB = b.name || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (quantity) => (
        <RenderCellWithTooltip displayText={quantity} fullText={quantity} />
      ),
      sorter: (a, b) => {
        const valA = a.quantity || 0;
        const valB = b.quantity || 0;
        return valA - valB;
      },
    },
    {
      title: "Part Type",
      dataIndex: "partType",
      key: "partType",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (partType, record) => (
        <RenderPartTypeWithTooltip partType={partType} record={record} />
      ),
      sorter: (a, b) => {
        const valA = a.partType?.name || a.partTypeName || "";
        const valB = b.partType?.name || b.partTypeName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Category",
      dataIndex: "partType",
      key: "category",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (partType) => <RenderCategoryWithTooltip partType={partType} />,
      sorter: (a, b) => {
        const valA = a.partType?.category || "";
        const valB = b.partType?.category || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Make/Buy",
      dataIndex: "makeBuy",
      key: "makeBuy",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (makeBuy) => <RenderMakeBuyWithTooltip makeBuy={makeBuy} />,
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
      width: 200,
      className: "single-line-cell-wrapper",
      render: (text) => (
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
      width: 200,
      className: "single-line-cell-wrapper",
      render: (text) => (
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
      render: (text) => (
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
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.material || "";
        const valB = b.material || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Space Qualified?",
      dataIndex: "spaceQualified",
      key: "spaceQualified",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (spaceQualified) => (
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
      render: (status) => <RenderStatusWithTooltip status={status} />,
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
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.weight || 0;
        const valB = b.weight || 0;
        return valA - valB;
      },
    },
    {
      title: "Is Serial Number Required?",
      dataIndex: "isSerialNumberRequired",
      key: "isSerialNumberRequired",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (isSerialNumberRequired) => (
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
      width: 160,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.referenceNumber || "";
        const valB = b.referenceNumber || "";
        return valA.localeCompare(valB);
      },
    },
  ];

  const [antDesignColumns, setAntDesignColumns] = useState(
    initialAntDesignColumns,
  );

  const handleResize = useCallback(
    (key) =>
      (e, { size }) => {
        setAntDesignColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.key === key ? { ...col, width: Math.max(size.width, 50) } : col,
          ),
        );
      },
    [],
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

  const handleColumnToggle = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    >
      {antDesignColumns.map((col) => (
        <div key={col.key} style={{ padding: "4px 8px" }}>
          <Checkbox
            checked={visibleColumns[col.key]}
            onChange={() => handleColumnToggle(col.key)}
            style={{ color: "white" }}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (location.state?.part) {
      setSelectedPartNumberSuffix(location.state.part.partNumberSuffix);
      setEditPartDrawerStatus(true);
    }
  }, [location.state?.part]);

  const handleCloseClick = () => {
    setCreatePartDrawerStatus(false);
    setEditPartDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadingPartsData(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoadChildren = async (expanded, record) => {
    if (!expanded || !record.hasBom) {
      return;
    }

    if (record.children && record.children.length > 0) {
      return;
    }

    const partId = record.id;
    const partKey = record.key;

    setLoadingChildren((prev) => ({ ...prev, [partKey]: true }));

    try {
      const hierarchyData = await fetchEntirePartHierarchy(partId);

      if (hierarchyData && hierarchyData.children) {
        const newPartsData = JSON.parse(JSON.stringify(partsData));

        const newChildData = hierarchyData.children.map((child, index) => ({
          ...child,
          key: `${record.key}-${child.id}-${index}`,
          children:
            child.hasBom && child.children
              ? child.children.map((c) =>
                  assignKeysAndPrepareChildren(
                    c,
                    `${record.key}-${child.id}-${index}`,
                  ),
                )
              : child.hasBom
                ? []
                : undefined,
        }));

        findAndMutatePartByKey(newPartsData, partKey, (part) => {
          part.children = newChildData;
        });

        setPartsData(newPartsData);
      }
    } catch (error) {
      Alert("Error fetching Part Hierarchy data", "error");
    } finally {
      setLoadingChildren((prev) => ({ ...prev, [partKey]: false }));
    }
  };

  const fetchData = async () => {
    setLoadingPartsData(true);
    try {
      const partsData = await fetchUniqueParts();
      if (partsData) {
        partsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const initialTreeData = partsData.map((part) => ({
          ...part,
          key: String(part.id),
          children: part.hasBom ? [] : undefined,
        }));
        setPartsData(initialTreeData);
      }
    } catch (error) {
      Alert("Error fetching Parts data", "error");
    } finally {
      setLoadingPartsData(false);
    }
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "shortDescription",
      headerName: "Short Description",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) => (row.status === "Draft" ? "" : row.status),
    },
    {
      field: "partType",
      headerName: "Type",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.name,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.category,
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.3,
      renderCell: ({ row }) => {
        const makeBuy = row.makeBuy;
        const text = makeBuy === 1 ? "Buy" : "Make";
        return (
          <span className={`make-buy-cell ${makeBuy === 1 ? "buy" : "make"}`}>
            {text}
          </span>
        );
      },
      valueGetter: (_value, row) => (row.makeBuy === 1 ? "Buy" : "Make"),
    },
    {
      field: "grade",
      headerName: "Grade",
      flex: 1,
    },
    {
      field: "unitOfMeasure",
      headerName: "Unit of Measure",
      flex: 0.5,
      valueGetter: (_value, row) => row.unitOfMeasure?.name,
    },
    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 0.8,
    },
    {
      field: "manufacturerName",
      headerName: "Manufacturer",
      flex: 0.8,
    },
    {
      field: "weight",
      headerName: "Weight (g)",
      flex: 0.4,
      type: "number",
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 0.3,
      type: "number",
      valueFormatter: (value) => formatAmount(value, 4),
    },
    {
      field: "isSerialNumberRequired",
      headerName: "Is Serial Number Required?",
      flex: 0.3,
      valueGetter: (_value, row) => (row.isSerialNumberRequired ? "Yes" : "No"),
    },
    {
      field: "trl",
      headerName: "TRL",
      flex: 0.2,
    },
    {
      field: "material",
      headerName: "Material",
      flex: 0.5,
    },
    {
      field: "countryOfOrigin",
      headerName: "Country of Origin",
      flex: 0.5,
      valueGetter: (_value, row) => row.countryOfOrigin?.name,
    },
    {
      field: "subsystem",
      headerName: "Subsystem",
      flex: 0.5,
      valueGetter: (_value, row) => row.subsystem?.name,
    },
    {
      field: "partLevel",
      headerName: "Part Level",
      flex: 0.5,
      valueGetter: (_value, row) => row?.partType?.partLevel?.name,
    },
    {
      field: "spaceQualified",
      headerName: "Space Qualified",
      flex: 0.3,
      valueGetter: (_value, row) => (row.spaceQualified ? "Yes" : "No"),
    },
    {
      field: "qualification",
      headerName: "Qualification",
      flex: 0.5,
    },
    {
      field: "specification",
      headerName: "Specification",
      flex: 0.5,
    },
    { field: "package", headerName: "Package", flex: 0.5 },
    {
      field: "radiationTolerance",
      headerName: "Radiation Tolerance",
      flex: 0.5,
    },
    {
      field: "tempCoefficient",
      headerName: "Temperature Coefficient",
      flex: 0.5,
    },
    { field: "tempRange", headerName: "Temperature Range", flex: 0.5 },
    {
      field: "referenceNumber",
      headerName: "Old Part Number",
      flex: 0.4,
    },
    {
      field: "delete",
      headerName: " ",
      key: "delete",
      width: 50,
      sortable: false,
      filterable: false,
      hideable: false,
      headerClassName: "DataGridColumn",
      renderCell: (params) => {
        const handleDelete = async (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!hasPermission(PERMISSIONS.PARTS.DELETE)) {
            Alert("You don't have permission to delete a Part", "warning");
            return;
          }

          const isConfirmed = await showConfirmation(
            "Are you sure?",
            "This action cannot be undone!",
          );

          if (!isConfirmed) return;
          setLoadingPartsData(true);
          try {
            await deletePartById(params.row.id);
            showAlert("success", "Deleted!", "Part deleted successfully!");
            handleRefresh();
          } catch (error) {
            const apiError =
              error?.response?.data?.error ||
              "Couldn't delete part. Try again.";
            console.log("API Error:", error);
            setLoadingPartsData(false);
            await showConfirmation("Delete Error", apiError, "OK", false);
          } finally {
            setLoadingPartsData(false);
          }
        };

        return params.row.status === "Draft" ? (
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
        ) : null;
      },
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;

  const renderAntDesignTable = () => {
    const filteredPartsData = filterTreeData(partsData, searchTerm);
    const totalNodeCount = countAllNodes(filteredPartsData);
    const visibleAntDesignColumns = antDesignColumns.filter(
      (col) => visibleColumns[col.key] || col.key === "partNumber",
    );

    const resizableColumns = getResizableColumns(visibleAntDesignColumns);

    return (
      <Table
        columns={resizableColumns}
        dataSource={filteredPartsData}
        rowKey="key"
        loading={loadingPartsData}
        className="AntDesignDataGrid"
        showSorterTooltip={false}
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          total: totalNodeCount,
          position: ["bottomRight"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedPartNumberSuffix(record?.partNumberSuffix);
            setEditPartDrawerStatus(true);
          },
          className: "AntD-custom-row",
        })}
        rowClassName={(record) => {
          if (record.makeBuy === 1) return "buy-part-row";
          if (record.makeBuy === 0) return "make-part-row";
          return "";
        }}
        expandable={{
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!record.hasBom) {
              return <span className="AntD-Expand-Dot"></span>;
            }

            if (loadingChildren[record.key]) {
              return <Spin indicator={antIcon} size={5} />;
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
          onExpand: handleLoadChildren,
          rowExpandable: (record) => record.hasBom,
        }}
        components={components}
      />
    );
  };

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Parts</p>
          </div>
          <div className="AdminChildrenHeaderButtons">
            <Button
              onClick={() => {
                if (!hasPermission(PERMISSIONS.ECO.MODIFY)) {
                  Alert(
                    "You don't have permission to create an ECO",
                    "warning",
                  );
                  return;
                }
                navigate("/plm/eco", {
                  state: { createEcoDrawerStatus: true },
                });
              }}
              startIcon={<Add />}
            >
              Create ECO
            </Button>
            <ImportComponent
              entityName="Part"
              uploadKey="part"
              setCreateDrawerStatus={setCreatePartDrawerStatus}
              handleRefresh={handleRefresh}
            />
          </div>
        </div>
        <div className="MasterDataDataGridDiv">
          <div className="PartBomHierarchyHeaderDiv">
            {featureBitData.find((item) => item.featureName === "BomHierarchy")
              ?.isActive ? (
              <button
                className="AddOrUpdateButton"
                onClick={() => {
                  const url = `/plm/parts/hierarchy`;
                  window.open(url, "_blank");
                }}
              >
                {" "}
                <ion-icon name="git-network-outline"></ion-icon> BOM Hierarchal
                View
              </button>
            ) : (
              <p></p>
            )}
            {/* <div className="PartBomHierarchyHeaderDivInner">
              <button
                className={
                  bomViewOption === 1 ? "AddOrUpdateButton" : "DimButton"
                }
                onClick={() => {
                  setBomViewOption(1);
                }}
              >
                <TableChartIcon sx={{ fontSize: "16px" }} />
              </button>
              <Divider orientation="vertical" flexItem />
              <button
                className={
                  bomViewOption === 2 ? "AddOrUpdateButton" : "DimButton"
                }
                onClick={() => {
                  setBomViewOption(2);
                }}
              >
                <AccountTreeIcon sx={{ fontSize: "16px" }} />
              </button>
            </div> */}
          </div>
          <div className="PartBomHierarchyDataGridDiv">
            {bomViewOption === 1 ? (
              <StyledDataGrid
                rows={partsData}
                columns={columns}
                getRowClassName={(params) => {
                  if (params.row.makeBuy === 1) return "buy-part-row";
                  if (params.row.makeBuy === 0) return "make-part-row";
                  return "";
                }}
                loading={loadingPartsData}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => {
                  setColumnVisibilityModel(newModel);
                  localStorage.setItem(
                    "partColumnVisibility",
                    JSON.stringify(newModel),
                  );
                }}
                onRowClick={(params) => {
                  setSelectedPartNumberSuffix(params.row?.partNumberSuffix);
                  setEditPartDrawerStatus(true);
                }}
                isRowSelectable={(params) => params.row.status !== "Obsolete"}
                keepNonExistentRowsSelected
                onRowSelectionModelChange={(newSelection) => {
                  const selectedIDs = new Set(newSelection);
                  const selectedRows = partsData.filter((row) =>
                    selectedIDs.has(row.id),
                  );
                  setSelectedParts(selectedRows);
                }}
                pageSize={5}
                className="DataGrid"
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaderTitle": {
                    whiteSpace: "normal",
                    lineHeight: "1.2rem",
                  },
                }}
              />
            ) : (
              <>
                <Divider
                  orientation="horizontal"
                  flexItem
                  sx={{ marginBottom: "10px" }}
                />
                <div className="AntDesignDataGridHeader">
                  <input
                    type="text"
                    placeholder="Search.."
                    className="AntDesignSearchBar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  ></input>
                  <Dropdown
                    overlay={columnsDropdownMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                    overlayStyle={{ zIndex: 1050 }}
                  >
                    <button
                      className="DimButton"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ion-icon name="eye-off-outline"></ion-icon> Hide Columns
                    </button>
                  </Dropdown>
                </div>
                {renderAntDesignTable()}
              </>
            )}
          </div>
        </div>
        <ResizableDrawer
          anchor="right"
          open={createPartDrawerStatus}
          onClose={handleCloseClick}
          defaultWidth={60}
        >
          <NewPart
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editPartDrawerStatus}
          onClose={handleCloseClick}
          defaultWidth={75}
        >
          <EditPart
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedPartNumberSuffix={selectedPartNumberSuffix}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Parts;
