import React, { useEffect, useRef, useCallback, useState } from "react";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import { zoom, zoomIdentity } from "d3-zoom";
import { linkHorizontal, linkVertical } from "d3-shape";
import "./PartHierarchy.css";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  ebomParentsEntireHierarchy,
  fetchHasBomPartsLookUp,
} from "../../../services/partService";
import { ClipLoader } from "react-spinners";
import { usePartDetailsDrawer } from "./PartDetailsContext";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 160;
const NODE_PADDING = 10;
const NODE_GAP = 10;
const DURATION = 500;

const ORIENTATION_OPTIONS = ["Horizontal", "Vertical"];

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  let isGreyOrBlack = true;
  while (isGreyOrBlack) {
    color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);

    const sum = r + g + b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const range = max - min;

    isGreyOrBlack = sum < 200 || range < 40;
  }
  return color;
};

const WhereUsedHierarchy = ({ selectedPartId: propPartId }) => {
  const { part_id } = useParams();
  const navigate = useNavigate();

  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const svgRef = useRef();
  const lastRootRef = useRef(null);
  const entireHierarchyRef = useRef(null);
  const zoomRef = useRef(null);
  const partTypeColorMap = useRef({});
  const [loadingData, setLoadingData] = useState(false);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);
  const [partsLookUp, setPartsLookUp] = useState([]);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState(
    propPartId || part_id || null
  );
  const [selectedPart, setSelectedPart] = useState(null);
  const [expandAll, setExpandAll] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orientation, setOrientation] = useState("Horizontal");
  const [showPartTypeIndicators, setShowPartTypeIndicators] = useState(true);
  const [partTypes, setPartTypes] = useState([]);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const handleOrientationChange = (event, value) => {
    if (value) {
      setOrientation(value);
      lastRootRef.current = null;
    }
  };

  const addHierarchyKeys = useCallback((node, path = []) => {
    if (!node) return;

    const newPath = [...path, node.id];
    node.uniqueKey = newPath.join(">");
    node.usedSomewhere =
      Array.isArray(node.children) && node.children.length > 0;

    if (node.children) {
      node.children.forEach((child) => addHierarchyKeys(child, newPath));
    }
    if (node._children) {
      node._children.forEach((child) => addHierarchyKeys(child, newPath));
    }
  }, []);

  const checkAndMarkRecursiveNodes = useCallback((node, parentPath = []) => {
    if (!node) return;

    const newParentPath = [
      ...parentPath,
      {
        id: node.id,
        partNumber: node.partNumber,
        name: node.name,
        partTypeName: node.partTypeName,
        partNumberSuffix: node.partNumberSuffix,
        manufacturingPartNumber: node.manufacturingPartNumber,
      },
    ];

    if (node.children) {
      const nonRecursiveChildren = [];
      node.children.forEach((child) => {
        const ancestorMatch = newParentPath.find((p) => p.id === child.id);

        if (ancestorMatch) {
          child.isRecursive = true;
          child.usedSomewhere = false;
          child.children = null;
          child.recursiveAncestorInfo = {
            partNumber: ancestorMatch.partNumber,
            name: ancestorMatch.name,
            partTypeName: ancestorMatch.partTypeName,
          };

          child.partNumber = ancestorMatch.partNumber;
          child.name = ancestorMatch.name;
          child.partTypeName = ancestorMatch.partTypeName;
          child.partNumberSuffix = ancestorMatch.partNumberSuffix;
          child.manufacturingPartNumber = ancestorMatch.manufacturingPartNumber;

          nonRecursiveChildren.push(child);
        } else {
          child.isRecursive = false;
          checkAndMarkRecursiveNodes(child, newParentPath);
          nonRecursiveChildren.push(child);
        }
      });
      node.children = nonRecursiveChildren;
    }
  }, []);

  const getPartTypeColor = (partTypeName) => {
    if (!partTypeName) return "#9e9e9e";
    if (!partTypeColorMap.current[partTypeName]) {
      partTypeColorMap.current[partTypeName] = getRandomColor();
    }
    return partTypeColorMap.current[partTypeName];
  };

  const extractUniquePartTypes = (node) => {
    const types = new Set();
    if (!node) return types;

    const traverse = (n) => {
      if (n.partTypeName) {
        types.add(n.partTypeName);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
      if (n._children) {
        n._children.forEach(traverse);
      }
    };

    traverse(node);
    return Array.from(types).map((type) => ({
      name: type,
      color: getPartTypeColor(type),
    }));
  };

  const processHierarchyData = (data) => {
    if (!data) return null;

    const rootData = JSON.parse(JSON.stringify(data));
    addHierarchyKeys(rootData);
    checkAndMarkRecursiveNodes(rootData);
    return rootData;
  };

  const collapseChildrenRecursive = (node) => {
    if (node.children) {
      node._children = node.children;
      node.children = null;
      node._children.forEach(collapseChildrenRecursive);
    } else if (node._children) {
      node._children.forEach(collapseChildrenRecursive);
    }
  };

  const expandChildrenRecursive = (node) => {
    if (node._children) {
      node.children = node._children;
      node._children = null;
      node.children.forEach(expandChildrenRecursive);
    } else if (node.children) {
      node.children.forEach(expandChildrenRecursive);
    }
  };

  const handleExpandAll = () => {
    if (!entireHierarchyRef.current) return;
    setExpandAll(true);

    const newHierarchyData = JSON.parse(
      JSON.stringify(entireHierarchyRef.current)
    );
    expandChildrenRecursive(newHierarchyData);
    setHierarchyData(newHierarchyData);
  };

  const handleCollapseAll = () => {
    if (!entireHierarchyRef.current) return;
    setExpandAll(false);

    const newHierarchyData = JSON.parse(
      JSON.stringify(entireHierarchyRef.current)
    );
    if (newHierarchyData.children) {
      newHierarchyData.children.forEach(collapseChildrenRecursive);
    }
    setHierarchyData(newHierarchyData);
  };

  const handleBackToCenter = useCallback(() => {
    const svg = select(svgRef.current);
    const isHorizontal = orientation === "Horizontal";
    const width = 1200;
    const height = 800;

    const initialTranslationX = isHorizontal ? 100 : width / 2;
    const initialTranslationY = isHorizontal ? height / 2 : 50;
    const initialTransform = zoomIdentity.translate(
      initialTranslationX,
      initialTranslationY
    );

    svg
      .transition()
      .duration(DURATION)
      .call(zoomRef.current.transform, initialTransform);
  }, [orientation]);

  const setUsedSomewhereFlag = (node) => {
    if (!node) return;
    node.usedSomewhere =
      Array.isArray(node.children) && node.children.length > 0;
    if (node.children) {
      node.children.forEach(setUsedSomewhereFlag);
    }
    if (node._children) {
      node._children.forEach(setUsedSomewhereFlag);
    }
  };

  const fetchEntireHierarchyData = async (partId) => {
    if (!partId) return;
    setLoadingData(true);
    setHierarchyData(null);
    lastRootRef.current = null;
    entireHierarchyRef.current = null;
    setExpandAll(false);
    setPartTypes([]);

    try {
      const data = await ebomParentsEntireHierarchy(partId);
      const rootObject = data[0];

      if (rootObject) {
        setUsedSomewhereFlag(rootObject); // IMPLMENTATION HERE

        const processedData = processHierarchyData(rootObject);
        entireHierarchyRef.current = processedData;

        if (processedData) {
          const types = extractUniquePartTypes(processedData);
          setPartTypes(types);

          const initialData = JSON.parse(JSON.stringify(processedData));
          if (initialData.children) {
            initialData.children.forEach(collapseChildrenRecursive);
          }
          setHierarchyData(initialData);
        } else {
          setHierarchyData(null);
        }
      } else {
        setHierarchyData(null);
      }
    } catch (error) {
      console.error("Fetch entire hierarchy error:", error);
      setHierarchyData(null);
      entireHierarchyRef.current = null;
    } finally {
      setLoadingData(false);
    }
  };

  const findAndToggleNode = useCallback((node, targetUniqueKey) => {
    if (!node) return false;

    if (node.uniqueKey === targetUniqueKey) {
      if (node.children) {
        node._children = node.children;
        node.children = null;
      } else if (node._children) {
        node.children = node._children;
        node._children = null;
      }
      return true;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (findAndToggleNode(node.children[i], targetUniqueKey)) return true;
      }
    }
    if (node._children) {
      for (let i = 0; i < node._children.length; i++) {
        if (findAndToggleNode(node._children[i], targetUniqueKey)) return true;
      }
    }
    return false;
  }, []);

  const drawTree = useCallback(
    (data, showIndicators) => {
      if (!data) {
        select(svgRef.current).selectAll("*").remove();
        return;
      }

      const handleMouseOver = (event, d) => {
        if (!d.data.isRecursive) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const clientX = event.clientX - svgRect.left;
        const clientY = event.clientY - svgRect.top;

        const partNumber = d.data.partNumber || "This part";

        setTooltip({
          visible: true,
          x: clientX,
          y: clientY,
          content: `Recursive loop detected: Part ${partNumber} is already an ancestor.`,
        });
      };

      const handleMouseOut = () => {
        setTooltip({ visible: false, x: 0, y: 0, content: "" });
      };

      const renderLoadingSpinner = () => "";

      const isHorizontal = orientation === "Horizontal";
      const width = 1200;
      const height = 800;

      const root = hierarchy(data);

      root.descendants().forEach((d) => {
        d.uniqueKey = d.data.uniqueKey;
        d.canExpandApi = d.data.usedSomewhere;
        d.isRecursive = d.data.isRecursive || false;
      });

      const nodeSize = isHorizontal
        ? [NODE_HEIGHT + NODE_GAP, NODE_WIDTH + 80]
        : [NODE_WIDTH + NODE_GAP, NODE_HEIGHT + 80];

      const treeLayout = tree().nodeSize(nodeSize);

      const svgRoot = select(svgRef.current)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("class", "tree-svg-root");

      let gVis = svgRoot.select(".visualization-group");

      const initialTranslationX = isHorizontal ? 100 : width / 2;
      const initialTranslationY = isHorizontal ? height / 2 - 100 : 30;

      if (gVis.empty()) {
        svgRoot.selectAll("*").remove();
        gVis = svgRoot
          .append("g")
          .attr("class", "visualization-group")
          .attr(
            "transform",
            `translate(${initialTranslationX}, ${initialTranslationY}) scale(1.6)`
          );

        const zoomBehavior = zoom()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => gVis.attr("transform", event.transform));

        zoomRef.current = zoomBehavior;

        svgRoot.call(zoomBehavior);
      }

      const customLinkGenerator = (d) => {
        if (isHorizontal) {
          const source = { x: d.source.x, y: d.source.y + NODE_WIDTH / 2 };
          const target = { x: d.target.x, y: d.target.y - NODE_WIDTH / 2 };
          return linkHorizontal()
            .x((p) => p.y)
            .y((p) => p.x)({ source, target });
        } else {
          const source = { x: d.source.x, y: d.source.y + NODE_HEIGHT / 2 };
          const target = { x: d.target.x, y: d.target.y - NODE_HEIGHT / 2 };
          return linkVertical()
            .x((p) => p.x)
            .y((p) => p.y)({ source, target });
        }
      };

      const isToggleVisible = (d) =>
        d.data.usedSomewhere || d.children || d._children || d.isRecursive;

      const getToggleContent = (d) => {
        if (d.isRecursive) return "";
        return d.children ? "−" : "+";
      };

      const getToggleCircleFill = (d) => {
        if (d.isRecursive) return "var(--hierarchy-toggle-recursive)";
        return d.children
          ? "var(--hierarchy-toggle-collapse)"
          : "var(--hierarchy-toggle-expand)";
      };

      const getToggleTitle = (d) => {
        if (d.isRecursive) {
          return `Recursive link: Part ${d.data.partNumber} is already an ancestor in the hierarchy.`;
        }
        if (d.children) return "Collapse";
        if (d._children) return "Expand";
        return "";
      };

      const getToggleTextDisplay = (d) => (d.isRecursive ? "none" : "block");
      const getToggleIconDisplay = (d) => (d.isRecursive ? "block" : "none");

      const getToggleCircleX = () => (isHorizontal ? NODE_WIDTH / 2 - 10 : 0);
      const getToggleCircleY = () => (isHorizontal ? 0 : NODE_HEIGHT / 2 - 2);

      const getToggleX = () => (isHorizontal ? NODE_WIDTH / 2 - 10 : 0);
      const getToggleY = () =>
        isHorizontal ? "0.35em" : `${NODE_HEIGHT / 2 + 5}px`;
      const getToggleTextAnchor = () => (isHorizontal ? "middle" : "middle");

      const getForeignObjectX = () =>
        isHorizontal ? NODE_WIDTH / 2 - 20 : -10;
      const getForeignObjectY = () =>
        isHorizontal ? -10 : NODE_HEIGHT / 2 - 10;

      const getNodeContentHtml = (d) => {
        const data = d?.data ?? {};
        const isBuyPart = data.makeBuy == 1;
        return `
    <div class="node-content-inner">
      <div class="node-details">
        <div class="node-row">
          <span class="node-label">Part Number</span>
          <span class="node-value part-link" title="${
            data.partNumber ?? "---"
          }">
            ${data.partNumber ?? "---"}
          </span>
        </div>
        <div class="node-row"><span class="node-label">Name</span><span class="node-value">${
          data.name ?? "---"
        }</span></div>
        <div class="node-row"><span class="node-label">Make/Buy</span><span class="node-value">${
          isBuyPart ? "Buy" : "Make"
        }</span></div>
        <div class="node-row"><span class="node-label">Type</span><span class="node-value">${
          data.partTypeName ?? "---"
        }</span></div>
        ${
          isBuyPart
            ? `
              <div class="node-row"><span class="node-label">Manufacturing Part No</span><span class="node-value">${
                data.manufacturingPartNumber ?? "---"
              }</span></div>
              <div class="node-row"><span class="node-label">Manufacturer</span><span class="node-value">${
                data.manufacturerName ?? "---"
              }</span></div>
            `
            : ""
        }
      </div>
    </div>
  `;
      };

      const update = (source) => {
        const treeData = treeLayout(root);

        const link = gVis
          .selectAll(".link")
          .data(treeData.links(), (d) => d.target.uniqueKey);

        link
          .enter()
          .insert("path", "g")
          .attr("class", "link")
          .attr("d", () => {
            const tempSource = { x: source.x, y: source.y };
            const tempTarget = { x: source.x, y: source.y };
            return customLinkGenerator({
              source: tempSource,
              target: tempTarget,
            });
          })
          .attr("stroke", (d) =>
            showIndicators
              ? getPartTypeColor(d.target.data.partTypeName)
              : "var(--hierarchy-link-color)"
          )
          .merge(link)
          .transition()
          .duration(DURATION)
          .attr("d", customLinkGenerator)
          .attr("stroke", (d) =>
            showIndicators
              ? getPartTypeColor(d.target.data.partTypeName)
              : "var(--hierarchy-link-color)"
          );

        link
          .exit()
          .transition()
          .duration(DURATION)
          .attr("d", () => {
            const tempSource = { x: source.x, y: source.y };
            const tempTarget = { x: source.x, y: source.y };
            return customLinkGenerator({
              source: tempSource,
              target: tempTarget,
            });
          })
          .remove();

        const node = gVis
          .selectAll(".node")
          .data(treeData.descendants(), (d) => d.uniqueKey);

        const nodeEnter = node
          .enter()
          .append("g")
          .attr("class", "node")
          .attr(
            "transform",
            (d) =>
              `translate(${isHorizontal ? source.y0 || 0 : source.x0 || 0},${
                isHorizontal ? source.x0 || 0 : source.y0 || 0
              })`
          )
          .on("click", (event) => {
            event.stopPropagation();
          });

        nodeEnter
          .append("rect")
          .attr("class", "node-rect")
          .attr("width", NODE_WIDTH)
          .attr("height", NODE_HEIGHT)
          .attr("x", -NODE_WIDTH / 2)
          .attr("y", -NODE_HEIGHT / 2)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("stroke", (d) =>
            showIndicators
              ? getPartTypeColor(d.data.partTypeName)
              : "var(--hierarchy-node-border)"
          );

        const foreign = nodeEnter
          .append("foreignObject")
          .attr("width", NODE_WIDTH - 2 * NODE_PADDING)
          .attr("height", NODE_HEIGHT - 2 * NODE_PADDING)
          .attr("x", -NODE_WIDTH / 2 + NODE_PADDING)
          .attr("y", -NODE_HEIGHT / 2 + NODE_PADDING);

        const nodeContentBox = foreign
          .append("xhtml:div")
          .attr("class", "node-content-box");

        nodeContentBox.html(getNodeContentHtml);

        nodeContentBox.select(".part-link").on("click", (event, d) => {
          event.stopPropagation();
          openPartDetailsDrawer({
            partNumberSuffix: d.data?.partNumberSuffix,
          });
        });

        const toggleGroupEnter = nodeEnter.filter((d) => isToggleVisible(d));

        toggleGroupEnter
          .on("click", (event, d) => {
            event.stopPropagation();
            if (d.isRecursive) return;

            setHierarchyData((prevData) => {
              if (!prevData) return null;
              const newRoot = JSON.parse(JSON.stringify(prevData));

              findAndToggleNode(newRoot, d.data.uniqueKey);

              return newRoot;
            });
            lastRootRef.current = d;
          })
          .on("mouseover", (event, d) => {
            if (d.isRecursive) {
              handleMouseOver(event, d);
            }
          })
          .on("mouseout", handleMouseOut);

        toggleGroupEnter
          .append("circle")
          .attr("class", "toggle-circle")
          .attr("r", 10)
          .attr("cx", getToggleCircleX)
          .attr("cy", getToggleCircleY)
          .attr("fill", getToggleCircleFill)
          .attr("title", getToggleTitle);

        toggleGroupEnter
          .append("text")
          .attr("class", "toggle-text")
          .attr("x", getToggleX)
          .attr("dy", getToggleY)
          .attr("text-anchor", getToggleTextAnchor)
          .style("display", getToggleTextDisplay)
          .text(getToggleContent);

        toggleGroupEnter
          .append("foreignObject")
          .attr("class", "toggle-icon-fo")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", getForeignObjectX)
          .attr("y", getForeignObjectY)
          .html((d) =>
            d.isRecursive
              ? `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: white;"><ion-icon name="warning-outline" class="NodeIonIcon"></ion-icon></div>`
              : ""
          )
          .style("display", getToggleIconDisplay);

        const spinnerForeignObject = toggleGroupEnter
          .append("foreignObject")
          .attr("class", "loading-spinner-fo")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", getForeignObjectX)
          .attr("y", getForeignObjectY);

        node
          .merge(nodeEnter)
          .select(".loading-spinner-fo")
          .html((d) => renderLoadingSpinner(d));

        node
          .merge(nodeEnter)
          .transition()
          .duration(DURATION)
          .attr(
            "transform",
            (d) =>
              `translate(${isHorizontal ? d.y : d.x},${
                isHorizontal ? d.x : d.y
              })`
          );

        const mergedNode = node.merge(nodeEnter);

        mergedNode
          .select(".node-rect")
          .attr("stroke", (d) =>
            showIndicators
              ? getPartTypeColor(d.data.partTypeName)
              : "var(--hierarchy-node-border)"
          );

        mergedNode.select(".node-content-box").html(getNodeContentHtml);

        mergedNode.select(".part-link").on("click", (event, d) => {
          event.stopPropagation();
          openPartDetailsDrawer({
            partNumberSuffix: d.data?.partNumberSuffix,
          });
        });

        mergedNode
          .filter((d) => isToggleVisible(d))
          .on("mouseover", (event, d) => {
            if (d.isRecursive) {
              handleMouseOver(event, d);
            }
          })
          .on("mouseout", handleMouseOut);

        mergedNode
          .select(".toggle-circle")
          .attr("cx", getToggleCircleX)
          .attr("cy", getToggleCircleY)
          .attr("fill", getToggleCircleFill)
          .attr("title", getToggleTitle);

        mergedNode
          .select(".toggle-text")
          .attr("x", getToggleX)
          .attr("dy", getToggleY)
          .attr("text-anchor", getToggleTextAnchor)
          .text(getToggleContent)
          .style("display", getToggleTextDisplay);

        mergedNode
          .select(".toggle-icon-fo")
          .attr("x", getForeignObjectX)
          .attr("y", getForeignObjectY)
          .html((d) =>
            d.isRecursive
              ? `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: white;"><ion-icon name="warning-outline" class="NodeIonIcon"></ion-icon></div>`
              : ""
          )
          .style("display", getToggleIconDisplay);

        mergedNode
          .select(".loading-spinner-fo")
          .attr("x", getForeignObjectX)
          .attr("y", getForeignObjectY)
          .html((d) => renderLoadingSpinner(d));

        mergedNode.select(".part-type-indicator-circle").remove();
        mergedNode.select(".part-type-indicator-text").remove();

        node
          .exit()
          .transition()
          .duration(DURATION)
          .attr(
            "transform",
            (d) =>
              `translate(${isHorizontal ? source.y : source.x},${
                isHorizontal ? source.x : source.y
              })`
          )
          .remove();

        treeData.descendants().forEach((d) => {
          d.x0 = d.x;
          d.y0 = d.y;
        });

        lastRootRef.current = root;
      };

      const source = lastRootRef.current || root;

      update(source);
    },
    [
      orientation,
      findAndToggleNode,
      openPartDetailsDrawer,
      showPartTypeIndicators,
      getPartTypeColor,
    ]
  );

  const fetchPartData = async () => {
    setLoadingAutocomplete(true);
    try {
      const data = await fetchHasBomPartsLookUp();
      const parts = Array.isArray(data) ? data : [];
      setPartsLookUp(parts);

      if (part_id) {
        const initialPart = parts.find((p) => String(p.id) === part_id);
        if (initialPart) {
          setSelectedPart(initialPart);
          setSelectedPartId(initialPart.id);
        }
      }
    } finally {
      setLoadingAutocomplete(false);
    }
  };

  useEffect(() => {
    if (partsLookUp.length > 1) {
      return;
    }
    fetchPartData();
  }, [part_id]);
  useEffect(() => {
    if (propPartId || part_id) setSelectedPartId(propPartId || part_id || null);
  }, [propPartId, part_id]);

  useEffect(() => {
    if (selectedPartId) {
      fetchEntireHierarchyData(selectedPartId);
      if (!propPartId && part_id && String(selectedPartId) !== part_id) {
        navigate(`/plm/partWhereUsed/hierarchy/${selectedPartId}`, {
          replace: true,
        });
      }
    }
  }, [selectedPartId, part_id, propPartId, navigate]);

  useEffect(() => {
    drawTree(hierarchyData, showPartTypeIndicators);
  }, [hierarchyData, drawTree, showPartTypeIndicators]);

  return (
    <div
      className={`PartHierarchyMainDiv ${
        isDrawerOpen ? "drawer-open" : "drawer-closed"
      }`}
    >
      {tooltip.visible && (
        <div
          className="HierarchyTooltip"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          {tooltip.content}
        </div>
      )}
      <button className="HierarchyControlsBtn" onClick={toggleDrawer}>
        {isDrawerOpen ? (
          <ion-icon name="chevron-forward-outline"></ion-icon>
        ) : (
          <ion-icon name="chevron-back-outline"></ion-icon>
        )}
      </button>
      <div
        className={`PartHierarchyHeader ${
          isDrawerOpen ? "drawer-visible" : "drawer-hidden"
        }`}
      >
        <div className="PartHierarchyHeaderInner1">
          <Autocomplete
            options={ORIENTATION_OPTIONS}
            value={orientation}
            onChange={handleOrientationChange}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                label="Orientation"
                size="small"
                variant="outlined"
              />
            )}
          />
          <Autocomplete
            options={partsLookUp}
            loading={loadingAutocomplete && loadingData}
            disabled={loadingData}
            getOptionLabel={(o) => `${o.partNumber} - ${o.name}`}
            value={selectedPart}
            onChange={(e, v) => {
              setSelectedPart(v);
              setSelectedPartId(v ? v.id : null);
              setExpandAll(false);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a Part"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAutocomplete ? (
                        <CircularProgress size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <div>
                  <strong>{option.name}</strong>
                  <div style={{ fontSize: "0.85rem" }}>
                    Part No: {option.partNumber}
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    Manf. Part No: {option.manufacturingPartNumber}
                  </div>
                </div>
              </li>
            )}
          />
        </div>
        <div className="PartHierarchyHeaderInner2">
          <button
            onClick={handleExpandAll}
            className="WhereUsedButtons"
            disabled={!selectedPartId || !hierarchyData || loadingData}
          >
            <ion-icon name="chevron-expand-outline"></ion-icon>
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="WhereUsedButtons"
            disabled={!selectedPartId || !hierarchyData || loadingData}
          >
            <ion-icon name="chevron-collapse-outline"></ion-icon>
            Collapse All
          </button>
          <button
            onClick={handleBackToCenter}
            className="WhereUsedButtons"
            disabled={!selectedPartId || !hierarchyData || loadingData}
          >
            <ion-icon name="scan-circle-outline"></ion-icon>
            Recenter View
          </button>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={showPartTypeIndicators}
              size="small"
              onChange={(e) => setShowPartTypeIndicators(e.target.checked)}
              name="partTypeIndicators"
              color="primary"
            />
          }
          label="Part Type Indicators"
          style={{ margin: "0 10px", whiteSpace: "nowrap" }}
        />
        <div
          style={{
            display:
              showPartTypeIndicators && partTypes.length > 0 ? "flex" : "none",

            gap: "10px",
            marginTop: "10px",
            fontSize: "12px",
            padding: "5px 10px",
            border: "1px solid #404040ff",
            borderRadius: "4px",
          }}
          className="PartHierarchyHeaderInner1"
        >
          {partTypes.map((type) => (
            <div
              key={type.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <svg width="10" height="10">
                <circle cx="5" cy="5" r="5" fill={type.color} />
              </svg>
              <span style={{ fontWeight: 600, color: "#8c8c8cff" }}>
                {type.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="PartHierarchyPlaceArea">
        {loadingData ? (
          <div className="HierarchyLoading">
            <ClipLoader
              color={"#6366F1"}
              loading={loadingData}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p>Loading Hierarchy..</p>
          </div>
        ) : (
          <svg ref={svgRef}></svg>
        )}
      </div>
    </div>
  );
};

export default WhereUsedHierarchy;
