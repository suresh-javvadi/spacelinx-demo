import React, { useEffect, useState } from "react";
import { Add, Remove } from "@mui/icons-material";
import { fetchGetChildGuides } from "../../services/partService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { fetchGuideVersionsWithPartId } from "../../services/guideService";

const BillOfGuides = ({ partId, setAllDataIsFetched }) => {
  const [guideData, setGuideData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    if (partId) {
      fetchData();
    }
  }, [partId]);

  const fetchData = async () => {
    setAllDataIsFetched(true);
    setLoadingData(true);
    try {
      const data = await fetchGuideVersionsWithPartId(partId);
      if (data?.length) {
        const latestDraft = data.find((item) => item.status === "Draft");
        const latestPublished = data
          .filter((item) => item.status !== "Draft")
          .sort((a, b) => b.version - a.version);
        if (latestDraft) {
          setGuideData([latestDraft]);
        } else {
          setGuideData([latestPublished][0]);
        }
      }
    } catch (error) {
      console.error("Error fetching guide data:", error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };

  const handleExpandClick = async (index) => {
    setLoadingData(true);
    try {
      const childGuides = await fetchGetChildGuides(partId);
      let newExpandedRows = [...expandedRows];
      newExpandedRows[index] = childGuides;
      setExpandedRows(newExpandedRows);
    } catch (error) {
      console.error("Error fetching child guides:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleRow = async (index) => {
    if (expandedRows[index]) {
      setExpandedRows((prev) => {
        const newExpandedRows = [...prev];
        newExpandedRows[index] = !newExpandedRows[index];
        return newExpandedRows;
      });
    } else {
      await handleExpandClick(index);
    }
  };

  const renderChildGuides = (childGuides, parentIndex) => (
    <React.Fragment key={`child-${parentIndex}`}>
      {childGuides?.map((childGuide, index) => (
        <tr key={`${parentIndex}-${index}`} className="child-row">
          <td style={{ textAlign: "left" }}>
            <span
              className={`tabulator-data-tree-branch ${
                expandedRows.includes(index) ? "expanded" : "collapsed"
              }`}
            ></span>
          </td>
          <td>{childGuide?.name}</td>
          <td>
            <a href={`guides/${childGuide?.guideId}`}>{childGuide?.number}</a>
          </td>
          <td>{childGuide?.partNumber}</td>
          <td>{childGuide?.partName}</td>
          <td>{childGuide?.version}</td>
          <td>{childGuide?.status}</td>
          <td>{childGuide?.dateCreated}</td>
        </tr>
      ))}
    </React.Fragment>
  );

  return (
    <div className="BuildFlyoutBody">
      {loadingData ? (
        <Cliploader loading={loadingData} />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "0px" }}></th>
              <th>Name</th>
              <th>Number</th>
              <th>Part Number</th>
              <th>Part Name</th>
              <th>Version</th>
              <th>Status</th>
              <th>Date Created</th>
            </tr>
          </thead>
          <tbody>
            {guideData.map((row, index) => (
              <React.Fragment key={index}>
                <tr onClick={() => toggleRow(index)}>
                  <td>
                    <span style={{ marginRight: "0px" }}>
                      <button
                        style={{
                          minWidth: "1px",
                          color: "#9c9a95",
                          cursor: "pointer",
                        }}
                      >
                        {expandedRows[index] ? <Remove /> : <Add />}
                      </button>
                    </span>
                  </td>
                  <td>{row?.name}</td>
                  <td>
                    <a href={`guides/${row?.id}`}>{row?.number}</a>
                  </td>
                  <td>{row?.part?.number}</td>
                  <td>{row?.part?.name}</td>
                  <td>{row?.version}</td>
                  <td>{row?.status}</td>
                  <td>{row?.createdAt}</td>
                </tr>
                {expandedRows[index] &&
                  renderChildGuides(expandedRows[index], index)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillOfGuides;
