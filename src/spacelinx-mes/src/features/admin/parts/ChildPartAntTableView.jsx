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
    part.trl,
    part.referenceNumber,
    part.partTypeName || "",
    part?.partTypeCategory || "",
    part.unitOfMeasure?.name || "",
    part.makeBuy ? "Buy" : "Make",
    part.isSerialNumberRequired ? "Required" : "Not Required",
    part.spaceQualified ? "Yes" : "No",
  ];

  return fields.some((field) =>
    String(field).toLowerCase().includes(lowerCaseTerm)
  );
};

const filterTreeData = (data, term) => {
  if (!term) return data;

  return data
    .map((node) => {
      const children = filterTreeData(node.children || [], term);

      if (matchesSearch(node, term) || children.length > 0) {
        return {
          ...node,
          children: children.length > 0 ? children : undefined,
        };
      }

      return null;
    })
    .filter(Boolean);
};

const ChildPartAntTableView = ({
  bomTreeData,
  loadingBomTreeData,
  canEdit,
  setSelectedChildPartId,
  setEditMode,
  setSelectedEBomId,
  handleDelete,
  setFormValues,
  setParentId,
}) => {
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRowKey, setEditingRowKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

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
    partLevelName: false,
    subsystemName: false,
    grade: false,
  };

  const [visibleColumnsAntD, setVisibleColumnsAntD] = useState(() => {
    const saved = localStorage.getItem("bomAntDColumnVisibility");
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
      render: (text, record) => (
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
      width: 150,
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
      title: "Short Description",
      dataIndex: "shortDescription",
      key: "shortDescription",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text) => (
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
      render: (text, record) => (
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
      render: (text) => (
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
      render: (text) => (
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
      width: 150,
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
      width: 150,
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
      title: "Country of Origin",
      dataIndex: "countryOfOriginName",
      key: "countryOfOriginName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.countryOfOriginName || "";
        const valB = b.countryOfOriginName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Part Level",
      dataIndex: "partLevelName",
      key: "partLevelName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.partLevelName || "";
        const valB = b.partLevelName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Subsystem",
      dataIndex: "subsystemName",
      key: "subsystemName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.subsystemName || "";
        const valB = b.subsystemName || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 100,
      className: "single-line-cell-wrapper",
      render: (text) => (
        <RenderCellWithTooltip displayText={text} fullText={text} />
      ),
      sorter: (a, b) => {
        const valA = a.grade || "";
        const valB = b.grade || "";
        return valA.localeCompare(valB);
      },
    },
    {
      title: "Space Qualified",
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
      title: "Location",
      dataIndex: "assemblyLocationName",
      key: "assemblyLocationName",
      width: 150,
      className: "single-line-cell-wrapper",
      render: (text) => (
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
      width: 150,
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
    {
      title: "",
      key: "action",
      width: 40,
      className: "single-line-cell-wrapper",
      render: (_, record) => (
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
      ),
    },
  ];

  const [allAntDesignColumns, setAllAntDesignColumns] = useState(
    initialAntDesignColumns
  );

  const handleRowEdit = (record) => {
    if (!canEdit) return;

    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
      Alert("You don't have permission to modify BOMs.", "warning");
      return;
    }

    setSelectedChildPartId(record.id);
    setSelectedEBomId(record.ebomId);
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
      localStorage.setItem("bomAntDColumnVisibility", JSON.stringify(newModel));
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

  const filteredBomTreeData = useMemo(
    () => filterTreeData(bomTreeData, searchTerm),
    [bomTreeData, searchTerm]
  );

  const totalNodeCount = countVisibleNodes(
    filteredBomTreeData,
    expandedRowKeys
  );

  useEffect(() => {
    setExpandedRowKeys((prev) =>
      prev.filter((key) => getAllRowKeys(filteredBomTreeData).includes(key))
    );
  }, [filteredBomTreeData]);

  const allExpandedKeys = useMemo(
    () => getAllRowKeys(filteredBomTreeData),
    [filteredBomTreeData]
  );

  const handleExpandAll = () => {
    setExpandedRowKeys(allExpandedKeys);
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

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
          onChange={(e) => setSearchTerm(e.target.value)}
        ></input>
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
          onClick: () => handleRowEdit(record),
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
export default ChildPartAntTableView;
