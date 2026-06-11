import React, { forwardRef } from "react";
import DOMPurify from "dompurify";
import { Divider } from "@mui/material";
import VideoFilePng from "../../Assest/Images/videoFileLogo.png";
import NoImagePlaceholder from "../../Assest/Images/NoImage.jpg";
import XDwatermark from "../../Assest/Images/XDwatermark.png";
import {
  FaHammer,
  FaFileAlt,
  FaClipboardCheck,
  FaCamera,
  FaBriefcase,
} from "react-icons/fa";
import {
  IoConstructOutline,
  IoBuildOutline,
  IoCogOutline,
} from "react-icons/io5";
import { MdStarOutline } from "react-icons/md";
import "./PrintGuide.css";

const PrintGuide = forwardRef(({ guideData }, ref) => {
  const currentYear = new Date().getFullYear();
  const equipmentTypeIcons = {
    part: <IoConstructOutline />,
    tool: <IoBuildOutline />,
    machine: <IoCogOutline />,
  };

  const processEquipmentData = (equipments, steps) => {
    return steps.map((step) => {
      const stepEquipments = equipments.filter(
        (equipment) => equipment.guideStepId === step.id
      );
      const parts = stepEquipments.filter(
        (equipment) => equipment.equipmentType === "part"
      );
      const equipmentParts = parts.map((part) => ({
        id: part.id,
        name: part.part?.name,
        number: part.part?.partNumber,
        type: part.part?.partType?.name,
        quantity: part.quantity,
        equipmentType: part.equipmentType,
      }));

      const tools = stepEquipments.filter(
        (equipment) => equipment.equipmentType === "tool"
      );
      const equipmentTools = tools.map((tool) => ({
        id: tool.id,
        name: tool.tool?.name,
        number: tool.tool?.number,
        type: tool.tool?.toolType?.name,
        quantity: tool.quantity,
        equipmentType: tool.equipmentType,
      }));

      const machines = stepEquipments.filter(
        (equipment) => equipment.equipmentType === "machine"
      );
      const equipmentMachines = machines.map((machine) => ({
        id: machine.id,
        name: machine.machine?.name,
        number: machine.machine?.number,
        type: machine.machine?.machineType?.name,
        quantity: machine.quantity,
        equipmentType: machine.equipmentType,
      }));

      return {
        stepId: step.id,
        stepNumber: step.sequence,
        equipmentList: [
          ...equipmentParts,
          ...equipmentTools,
          ...equipmentMachines,
        ],
      };
    });
  };

  const getEquipmentForStep = (stepId) => {
    const equipmentEntry = processedEquipmentData.find(
      (equipment) => equipment.stepId === stepId
    );
    return equipmentEntry ? equipmentEntry.equipmentList : [];
  };

  const processedEquipmentData = processEquipmentData(
    guideData?.guideStepEquipments || [],
    guideData?.guideSteps || []
  );

  const columns = [
    {
      field: "equipmentType",
      headerName: "",
    },
    {
      field: "number",
      headerName: "Number",
    },
    {
      field: "name",
      headerName: "Name",
    },
    {
      field: "type",
      headerName: "Type",
    },
    {
      field: "quantity",
      headerName: "Quantity",
    },
  ];

  const PageHeader = ({ guideData }) => (
    <div className="printPageHeader">
      <div>
        <span className="printHeaderlabel">Guide:</span>
        <span className="printHeaderValue">
          {guideData?.name}/{guideData?.number}
        </span>
      </div>
      <div>
        <span className="printHeaderlabel">Part:</span>
        <span className="printHeaderValue">
          {guideData?.part?.name}/{guideData?.part?.partNumber}
        </span>
      </div>
      <div>
        <span className="printHeaderlabel">Version:</span>
        <span className="printHeaderValue">{guideData?.version}</span>
      </div>
    </div>
  );

  const PageFooter = ({ currentPage, totalPages }) => (
    <div className="printPageFooter">
      <div>
        Copyright &copy;{currentYear} XDLINX Space Labs Pvt Ltd Confidential and
        Proprietary
      </div>
    </div>
  );

  const CoverPage = ({ guideData }) => (
    <div className="printPage printCoverPage">
      <div className="coverPageContent">
        <div className="coverPageTitle">
          <h1>{guideData?.name}</h1>
          <h2>Guide Number: {guideData?.number}</h2>
        </div>
        <div className="coverPageDetails">
          <p>
            Part: {guideData?.part?.name} / {guideData?.part?.partNumber}
          </p>
          <p>Version: {guideData?.version}</p>
          <p>Total Steps: {guideData?.guideSteps?.length || 0}</p>
        </div>
        <div className="coverPageFooter">
          <p>Copyright &copy;{currentYear} XDLINX Space Labs Pvt Ltd</p>
          <p>Confidential and Proprietary</p>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="printContainer">
      <img src={XDwatermark} alt="Watermark" className="printWatermark" />
      <CoverPage guideData={guideData} />
      {guideData?.guideSteps
        ?.sort((a, b) => a.sequence - b.sequence)
        .map((step, stepIndex) => {
          const filteredEquipmentData = getEquipmentForStep(step.id);
          const totalPages = guideData.guideSteps.length;
          const isLastStep = stepIndex === totalPages - 1;

          return (
            <div
              key={stepIndex}
              className="printPage"
              style={{ pageBreakAfter: isLastStep ? "auto" : "always" }}
            >
              <PageHeader guideData={guideData} />

              <div className="printStepContainer">
                <div className="printStep">
                  <div className="printImageSection">
                    <div className="printStepTitle">
                      <h2>
                        {step.sequence}. {step.title}
                      </h2>
                    </div>
                    <div className="printStepImageContainer">
                      {step.image?.filePath ? (
                        <img
                          src={step.image.filePath}
                          alt={`Step ${step.sequence}`}
                          className="printStepImage"
                        />
                      ) : step?.videoId ? (
                        <img
                          src={VideoFilePng}
                          alt={`Video for Step ${step.sequence}`}
                          className="printStepImage"
                        />
                      ) : (
                        <img
                          src={NoImagePlaceholder}
                          alt="No image available"
                          className="printStepImage"
                        />
                      )}
                    </div>
                  </div>
                  <div className="printTasksSection">
                    <div className="printTaskContainer">
                      {guideData?.guideStepTasks.filter(
                        (task) => task.guideStepId === step.id
                      ).length > 0 ? (
                        guideData?.guideStepTasks
                          .filter((task) => task.guideStepId === step.id)
                          .sort((a, b) => a.sequence - b.sequence)
                          .map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="printStepTask borderedTask"
                            >
                              <div className="taskContent">
                                {task.taskdetails && (
                                  <p className="printTaskType">
                                    {(() => {
                                      if (task.type === "Data") {
                                        return <FaFileAlt />;
                                      } else if (task?.type === "Assembly") {
                                        return <FaHammer />;
                                      } else if (task?.type === "Test") {
                                        return <FaClipboardCheck />;
                                      } else if (task?.type === "Picture") {
                                        return <FaCamera />;
                                      } else if (task?.type === "Genealogy") {
                                        return <FaBriefcase />;
                                      }
                                      return null;
                                    })()}
                                  </p>
                                )}
                                <Divider orientation="vertical" flexItem />
                                <p
                                  className="printTaskDescription"
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }}
                                />
                              </div>
                              {task.ismandatory === 1 && (
                                <p className="printTaskBehaviour">
                                  <MdStarOutline />
                                </p>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="printNotAvailableMsg">
                          No Tasks Available
                        </p>
                      )}
                    </div>
                    <div className="printDatagrid">
                      {filteredEquipmentData.length > 0 ? (
                        <table className="printEquipmentTable">
                          <thead>
                            <tr>
                              {columns.map((col, index) => (
                                <th key={index}>{col.headerName}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEquipmentData.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                  <td key={colIndex}>
                                    {col.field === "equipmentType" ? (
                                      <>{equipmentTypeIcons[row[col.field]]}</>
                                    ) : (
                                      row[col.field]
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="printNotAvailableMsg">
                          No Equipment Available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <PageFooter currentPage={stepIndex + 1} totalPages={totalPages} />
            </div>
          );
        })}
    </div>
  );
});

export default PrintGuide;
