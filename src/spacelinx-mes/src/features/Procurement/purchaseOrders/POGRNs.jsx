import React, { useContext, useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchGRNsByPOId } from "../../../services/goodReceiptNoteService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const POGRNs = ({ selectedRowId, canView = true }) => {
  const { Alert } = useContext(AlertsContext);
  const [grnData, setGRNData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchPOGRNsData = async () => {
      if (!canView) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      try {
        const data = await fetchGRNsByPOId(selectedRowId);
        setGRNData(data || []);
      } catch (error) {
        console.error("Failed to fetch GRNs:", error);
        Alert("Error fetching GRN data.", "error");
        setGRNData([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (selectedRowId) {
      fetchPOGRNsData();
    }
  }, [selectedRowId, canView, Alert]);

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "receivedQuantity",
      headerName: "Received Qty",
      flex: 0.5,
    },
  ];

  return (
    <div className="pogrnd-container">
      <div className="pogrns-header">
        <h2>Goods Receipt Logs</h2>
      </div>{" "}
      {canView ? (
        loadingData ? (
          <div className="loading-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : grnData.length === 0 ? (
          <p className="pogrns-empty-message">No GRNs available...</p>
        ) : (
          <div className="pogrns-body">
            {grnData.map((grn) => {
              let lineItems = [];
              try {
                lineItems = JSON.parse(grn.grnLineItems || "[]").map(
                  (item) => ({
                    id: item.grn_line_item_id,
                    partName: item.part_name,
                    partNumber: item.part_number,
                    receivedQuantity: item.received_quantity,
                  })
                );
              } catch (err) {
                console.error("Invalid grnLineItems JSON", err);
              }

              return (
                <Accordion key={grn.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className="pogrns-accordion-header">
                      <p>{grn.grnNumber}</p>
                      <div className="pogrns-accordion-field">
                        <p>
                          <span className="pogrns-accordion-span">
                            Received on:{" "}
                          </span>
                          {grn.receivedDate}
                        </p>
                        <p className="pogrns-truncate-line">
                          <span className="pogrns-accordion-span">By: </span>
                          <span className="pogrns-truncate-fixed">
                            {grn.receivedByFullName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="pogrns-datagrid">
                      <StyledDataGrid
                        rows={lineItems}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                      />
                    </div>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
        )
      ) : (
        <p>You do not have permission to view this content.</p>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default POGRNs;
