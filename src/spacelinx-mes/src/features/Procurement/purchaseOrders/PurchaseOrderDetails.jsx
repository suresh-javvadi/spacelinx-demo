import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { TextField, Autocomplete, Divider, MenuItem } from "@mui/material";
import { Popper, ClickAwayListener } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import dayjs from "dayjs";
import {
  approvePurchaseOrder,
  closePurchaseOrder,
  fetchPurchaseOrderwithId,
  rejectPurchaseOrder,
  submitPurchaseOrder,
  updatePurchaseOrder,
  fetchZohoCsv,
} from "../../../services/purchaseOrders";
import { fetchRequisitionLookup } from "../../../services/requisitionService";
import { fetchVendors } from "../../../services/companyService";
import { fetchProject } from "../../../services/projectService";
import { fetchPaymentTerms } from "../../../services/paymentTermService";
import { fetchCurrencies } from "../../../services/currencyService";
import LineItems from "./EditLineItems";
import PODocuments from "./PODocuments";
import { fetchCompanyAddressById } from "../../../services/companyAddressService";
import { fetchCompanyContactByVendorId } from "../../../services/companyContactService";
import { useUserContext } from "../../userContext/UserContext";
import PrintPurchaseOrder from "./printPurchaseOrder";
import { pdf } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import { fetchAllOrganizationWithAddresses } from "../../../services/organizationService";
import POGRNs from "./POGRNs";
import { showPrintOptionsDialog } from "../../../Components/PrintOptionsDialog/PrintOptionsDialog";
import { ClipLoader } from "react-spinners";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditAddress from "../../ContactHub/Company/EditAddress";
import EditContacts from "../../ContactHub/Company/EditContacts";
import EditOrganizationAddress from "../../ContactHub/Organization/EditOrganizationAddress";
import Documents from "../../../Components/Documents/Documents";
import POApprovals from "./POApprovals";
import POApprovalTracker from "./POApprovalTracker";
import "../procurement.css";
import "../../features.css";
import "../../ContactHub/Staff/Staff.css";
import "../../ContactHub/Company/Company.css";
import { fetchOptionSetByName } from "../../../services/optionSetService";

const PurchaseOrderDetails = () => {
  const { po_id } = useParams();
  const { hasPermission, isSuperAdmin } = useUserContext();
  const { activeRole, userData } = useUserContext();
  const currentUserId = userData?.id;
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [lineItems, setLineItems] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [vendorDetailsLoading, setVendorDetailsLoading] = useState(false);
  const [vendorAddresses, setVendorAddresses] = useState([]);
  const [vendorContacts, setVendorContacts] = useState([]);
  const [pageTabValue, setPageTabValue] = useState("overview");
  const [selectedShippingOrganization, setSelectedShippingOrganization] =
    useState(null);
  const [selectedBillingOrganization, setSelectedBillingOrganization] =
    useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperType, setPopperType] = useState(null);
  const [pageDrawer, setPageDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(null);
  const [drawerEntityId, setDrawerEntityId] = useState(null);
  const [drawerEntityType, setDrawerEntityType] = useState(null);
  const [editPoData, setEditPoData] = useState({
    purchaseOrderType: "",
    requisition: null,
    vendor: null,
    companyId: null,
    project: null,
    paymentTerm: null,
    orderDate: "",
    expectedDeliveryDate: "",
    totalAmount: 0.0,
    shippingAddress: null,
    billingAddress: null,
    vendorBillingAddress: null,
    vendorBillingContact: null,
    documentUrl: [],
    discount: 0,
    discountType: null,
    currencyId: "",
    number: "",
    poTerms: "",
    status: "Draft",
    taxOption: "",
    quotationReference: "",
    shipmentReference: "",
    description: "",
    customerInstructions: "",
    deliveryTerms: "",
    termsAndConditions: "",
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [shippingAddressesData, setShippingAddressesData] = useState([]);
  const [billingAddressesData, setBillingAddressesData] = useState([]);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const lineItemsRef = useRef();
  const [approvals, setApprovals] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [standardTermsAndConditions, setStandardTermsAndConditions] = useState(
    [],
  );

  const fetchStandardTermsandconditions = async () => {
    try {
      const data = await fetchOptionSetByName("standard_terms_and_conditions");
      const parsedData = JSON.parse(data.values);

      const descriptions = parsedData
        .map((item) => item.description)
        .filter(Boolean);

      setStandardTermsAndConditions(descriptions);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStandardTermsandconditions();
  }, []);

  const activeStage = useMemo(() => {
    if (!approvals?.length) return null;

    const pendingStages = approvals
      .filter((a) => a.status === "Pending")
      .map((a) => a.stageNumber);

    return pendingStages.length ? Math.min(...pendingStages) : null;
  }, [approvals]);

  const canCurrentUserApprove = useMemo(() => {
    if (!activeStage || !currentUserId) return false;

    return approvals.some(
      (a) =>
        a.stageNumber === activeStage &&
        a.approverId === currentUserId &&
        a.status === "Pending",
    );
  }, [approvals, activeStage, currentUserId]);

  const handleViewPdfInNewWindow = async (
    editPoData,
    lineItems,
    vendors,
    vendorAddresses,
    selectedShippingOrganization,
    selectedBillingOrganization,
    shippingAddressesData,
    billingAddressesData,
    currency,
    printOptions = { xdlPartNumber: true, hsn: true },
  ) => {
    const poDataForPdf = {
      ...editPoData,
      orderDate:
        editPoData.orderDate &&
        typeof editPoData.orderDate === "object" &&
        editPoData.orderDate.$isDayjsObject
          ? editPoData.orderDate.format("YYYY-MM-DD")
          : editPoData.orderDate,
      expectedDeliveryDate:
        editPoData.expectedDeliveryDate &&
        typeof editPoData.expectedDeliveryDate === "object" &&
        editPoData.expectedDeliveryDate.$isDayjsObject
          ? editPoData.expectedDeliveryDate.format("YYYY-MM-DD")
          : editPoData.expectedDeliveryDate,
    };

    const lineItemsForPdf = lineItems.map((item) => ({
      ...item,
      expectedDeliveryDate:
        item.expectedDeliveryDate &&
        typeof item.expectedDeliveryDate === "object" &&
        item.expectedDeliveryDate.$isDayjsObject
          ? item.expectedDeliveryDate.format("YYYY-MM-DD")
          : item.expectedDeliveryDate,
    }));

    const doc = (
      <PrintPurchaseOrder
        printOptions={printOptions}
        poData={poDataForPdf}
        lineItems={lineItemsForPdf}
        vendors={vendors.find((s) => s.id === editPoData?.companyId) || null}
        vendorAddresses={vendorAddresses}
        vendorContacts={vendorContacts}
        project={projects.find((p) => p.id === editPoData.project)}
        paymentTerm={paymentTerms.find(
          (pt) => pt.id === editPoData.paymentTerm,
        )}
        selectedShippingOrganization={selectedShippingOrganization}
        selectedBillingOrganization={selectedBillingOrganization}
        shippingAddress={
          shippingAddressesData?.find(
            (addr) => addr.addressId === editPoData.shippingAddress,
          ) || null
        }
        billingAddress={
          billingAddressesData?.find(
            (opt) => opt.addressId === editPoData.billingAddress,
          ) || null
        }
        currency={currency}
        standardTermsAndConditions={standardTermsAndConditions}
        approvals={approvals}
      />
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);

    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      console.error("Failed to open new window. Pop-ups might be blocked.");
    }
  };

  const handleDownloadZohoCsv = async () => {
    setLoadingData(true);
    try {
      const csvData = await fetchZohoCsv(po_id);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `PurchaseOrder_${editPoData?.number}_Zoho.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Zoho CSV:", error);
      Alert("Failed to download Zoho CSV", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [
        paymentTermsData,
        vendorsData,
        projectData,
        requisitionData,
        organizationsData,
        currenciesData,
      ] = await Promise.all([
        fetchPaymentTerms(),
        fetchVendors(),
        fetchProject(),
        fetchRequisitionLookup(),
        fetchAllOrganizationWithAddresses(),
        fetchCurrencies(),
      ]);

      setPaymentTerms(Array.isArray(paymentTermsData) ? paymentTermsData : []);
      setVendors(
        Array.isArray(vendorsData)
          ? vendorsData.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          : [],
      );

      setOrganizations(
        organizationsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ) || [],
      );
      setProjects(Array.isArray(projectData) ? projectData : []);
      setRequisitions(Array.isArray(requisitionData) ? requisitionData : []);
      setCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
    } catch (error) {
      Alert("Error fetching data for new purchase order", "error");
      setPaymentTerms([]);
      setVendors([]);
      setProjects([]);
      setRequisitions([]);
      setCurrencies([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!po_id) return;
    const fetchPO = async () => {
      setLoadingData(true);
      try {
        const po = await fetchPurchaseOrderwithId(po_id);
        setApprovals(po?.approvals);
        if (po) {
          const shippingOrg =
            organizations.find((org) =>
              org?.organizationAddresses?.some(
                (addr) => addr?.addressId === po.shippingAddressId,
              ),
            ) || null;

          const billingOrg =
            organizations.find((org) =>
              org?.organizationAddresses?.some(
                (addr) => addr?.addressId === po.billingAddressId,
              ),
            ) || null;

          setSelectedShippingOrganization(shippingOrg);
          setSelectedBillingOrganization(billingOrg);

          setShippingAddressesData(shippingOrg?.organizationAddresses || []);
          setBillingAddressesData(billingOrg?.organizationAddresses || []);

          const derivedPurchaseOrderType = po.requisitionId
            ? "From Requisition"
            : "Direct";

          const newPoData = {
            purchaseOrderType: derivedPurchaseOrderType,
            requisition: po.requisitionId || null,
            vendor: vendors.find((item) => item.id === po.companyId) || null,
            companyId: po.companyId || null,
            project: po.projectId || "",
            paymentTerm: po.paymentTermId || null,
            orderDate: po.orderDate,
            shippingAddress: po.shippingAddressId || null,
            billingAddress: po.billingAddressId || null,
            vendorBillingAddress: po.vendorBillingAddressId || null,
            vendorBillingContact: po.vendorBillingContactId || null,
            number: po.number,
            currencyId: po?.currencyId,
            expectedDeliveryDate: po.expectedDeliveryDate || "",
            poTerms: po.poTerms,
            status: po.status,
            totalAmount: po.totalAmount || 0.0,
            discount: po.discount,
            discountType: po.discountType,
            taxOption: po.taxOption,
            createdBy: po.createdBy,
            quotationReference: po.quotationReferenceNumber || "",
            shipmentReference: po.shipmentReferenceNumber || "",
            roundOff: po.roundOff || "",
            description: po.description || "",
            customerInstructions: po.customerInstructions || "",
            deliveryTerms: po.deliveryTerms || "",
            termsAndConditions: po.termsAndConditions || "",
          };
          setEditPoData(newPoData);
          const sortedLineItems = (po.poLineItems || [])
            .map((item) => ({
              ...item,
              expectedDeliveryDate: item.expectedDeliveryDate
                ? dayjs(item.expectedDeliveryDate)
                : null,
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setLineItems(sortedLineItems);
        }
      } catch (error) {
        Alert("Error fetching purchase order details", "error");
        console.error("Fetch PO Error:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPO();
  }, [po_id, organizations, vendors]);

  const handleEditPO = async (approvers) => {
    if (!validate()) {
      Alert("Please fix the errors before updating the PO", "error");
      return;
    }

    setLoadingData(true);

    const latestLineItems =
      lineItemsRef.current?.getCurrentLineItems() || lineItems;
    const formData = new FormData();

    formData.append("CompanyId", editPoData.companyId || "");
    formData.append("ProjectId", editPoData.project?.id || editPoData.project);
    formData.append("TaxOption", editPoData.taxOption);

    if (
      editPoData.purchaseOrderType === "From Requisition" &&
      editPoData.requisition
    ) {
      formData.append(
        "RequisitionId",
        editPoData.requisition.id || editPoData.requisition,
      );
    }

    formData.append(
      "PaymentTermId",
      editPoData.paymentTerm?.id || editPoData.paymentTerm,
    );
    formData.append("currencyId", editPoData?.currencyId || "");
    formData.append("OrderDate", editPoData.orderDate);
    formData.append("poTerms", editPoData.poTerms);
    formData.append("ExpectedDeliveryDate", editPoData.expectedDeliveryDate);
    formData.append("TotalAmount", editPoData.totalAmount ?? 0);
    formData.append("Status", "Draft");
    formData.append(
      "BillingAddressId",
      editPoData.billingAddress?.id || editPoData.billingAddress,
    );
    formData.append(
      "ShippingAddressId",
      editPoData.shippingAddress?.id || editPoData.shippingAddress,
    );
    formData.append(
      "VendorBillingAddressId",
      editPoData.vendorBillingAddress?.addressId ||
        editPoData.vendorBillingAddress ||
        "",
    );
    formData.append(
      "VendorBillingContactId",
      editPoData.vendorBillingContact?.contactId ||
        editPoData.vendorBillingContact ||
        "",
    );
    formData.append(
      "QuotationReferenceNumber",
      editPoData.quotationReference || "",
    );
    formData.append(
      "ShipmentReferenceNumber",
      editPoData.shipmentReference || "",
    );
    formData.append("DeliveryStatus", "Pending");
    formData.append("Discount", editPoData.discount || 0);
    formData.append("DiscountType", editPoData.discountType || "");
    formData.append("RoundOff", Number(editPoData.roundOff || 0).toFixed(2));
    formData.append("Description", editPoData.description || "");
    formData.append(
      "CustomerInstructions",
      editPoData.customerInstructions || "",
    );
    formData.append("DeliveryTerms", editPoData.deliveryTerms || "");
    formData.append("TermsAndConditions", editPoData.termsAndConditions || "");

    latestLineItems.forEach((detail, index) => {
      if (detail.id && isValidUUID(detail.id)) {
        formData.append(`PoLineItems[${index}].id`, detail.id);
      }

      formData.append(`PoLineItems[${index}].partId`, detail?.part?.id);
      formData.append(
        `PoLineItems[${index}].orderedQuantity`,
        detail.orderedQuantity || "",
      );
      formData.append(
        `PoLineItems[${index}].description`,
        detail.description || "",
      );
      formData.append(
        `PoLineItems[${index}].pendingQuantity`,
        detail.orderedQuantity || "",
      );
      formData.append(
        `PoLineItems[${index}].unitPrice`,
        detail.unitPrice || "",
      );
      formData.append(
        `PoLineItems[${index}].totalPrice`,
        detail.totalPrice || "",
      );
      formData.append(`PoLineItems[${index}].HSN`, detail.hsn || "");
      formData.append(`PoLineItems[${index}].Tax`, detail.tax ?? 0);
      formData.append(
        `PoLineItems[${index}].TaxType`,
        detail.taxType || "None",
      );
      formData.append(`PoLineItems[${index}].Discount`, detail.discount || 0);
      formData.append(
        `PoLineItems[${index}].DiscountType`,
        detail.discountType || null,
      );
      formData.append(
        `PoLineItems[${index}].ExpectedDeliveryDate`,
        detail.expectedDeliveryDate
          ? dayjs(detail.expectedDeliveryDate).format("YYYY-MM-DD")
          : "",
      );
    });

    const approvalPayload = approvers.flatMap((stageItem) =>
      stageItem.users.map((user) => ({
        stageNumber: stageItem.stage,
        approverId: user.id,
      })),
    );

    approvalPayload.forEach((approval, index) => {
      formData.append(`Approvals[${index}].stageNumber`, approval.stageNumber);
      formData.append(`Approvals[${index}].approverId`, approval.approverId);
    });

    documentFiles.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      await updatePurchaseOrder(po_id, formData);
      Alert("PO Updated Successfully!", "success");
    } catch (error) {
      Alert(
        error?.response?.data?.message || "Failed to update Purchase Order",
        "error",
      );
      console.error("Error updating PO:", error);
    } finally {
      setLoadingData(false);
      fetchData();
      setReadOnlyMode(true);
    }
  };

  const isValidUUID = (uuid) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === "string" && uuidRegex.test(uuid);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditPoData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    setEditPoData((prev) => ({
      ...prev,
      orderDate: prev.orderDate || getTodayDate(),
    }));
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!editPoData.companyId) {
      newErrors.companyId = "Vendor is required.";
    }

    if (!editPoData.paymentTerm) {
      newErrors.paymentTerm = "Payment term is required.";
    }

    if (!editPoData.orderDate) {
      newErrors.orderDate = "Order date is required.";
    }
    if (!editPoData.deliveryTerms) {
      newErrors.deliveryTerms = "Delivery terms is required.";
    }

    if (editPoData.orderDate && editPoData.expectedDeliveryDate) {
      const order = new Date(editPoData.orderDate);
      const delivery = new Date(editPoData.expectedDeliveryDate);
      order.setHours(0, 0, 0, 0);
      delivery.setHours(0, 0, 0, 0);

      if (delivery < order) {
        newErrors.expectedDeliveryDate =
          "Delivery date cannot be before order date.";
      }
    }

    if (!selectedBillingOrganization) {
      newErrors.billingAddress = "Billing organization is required.";
    } else if (!editPoData.billingAddress) {
      const billingAddresses =
        selectedBillingOrganization.organizationAddresses?.filter(
          (addr) => addr.addressType?.toLowerCase() === "billing",
        ) || [];

      if (billingAddresses.length === 0) {
        newErrors.billingAddress =
          "Selected organization has no billing addresses attached.";
      } else {
        newErrors.billingAddress = "Billing address is required.";
      }
    }

    if (
      editPoData.purchaseOrderType === "From Requisition" &&
      !editPoData.requisition
    ) {
      newErrors.requisition = "Requisition is required for this PO type.";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAutocompleteChange = (field, value) => {
    setEditPoData((prev) => ({
      ...prev,
      [field]: value?.id || "",
    }));

    if (field === "paymentTerm" && value?.paymentTerms) {
      setEditPoData((prev) => ({
        ...prev,
        poTerms: value.paymentTerms,
      }));
    }

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const fetchVendorRelatedData = async () => {
    if (editPoData.companyId) {
      setVendorDetailsLoading(true);
      try {
        const [addresses, contacts] = await Promise.all([
          fetchCompanyAddressById(editPoData.companyId),
          fetchCompanyContactByVendorId(editPoData.companyId),
        ]);
        setVendorAddresses(Array.isArray(addresses) ? addresses : []);
        setVendorContacts(Array.isArray(contacts) ? contacts : []);

        if (!editPoData.vendorBillingAddress && addresses?.length > 0) {
          setEditPoData((prev) => ({
            ...prev,
            vendorBillingAddress: addresses[0].addressId,
          }));
        }

        if (!editPoData.vendorBillingContact && contacts?.length > 0) {
          setEditPoData((prev) => ({
            ...prev,
            vendorBillingContact: contacts[0].contactId,
          }));
        }
      } catch (error) {
        console.error("Error fetching vendor details:", error);
        setVendorAddresses([]);
        setVendorContacts([]);
      } finally {
        setVendorDetailsLoading(false);
      }
    } else {
      setVendorAddresses([]);
      setVendorContacts([]);
    }
  };

  useEffect(() => {
    fetchVendorRelatedData();
  }, [editPoData.companyId]);

  const handleSubmitPurchaseOrder = async () => {
    const hasEmptyApprovals = !approvals?.length;

    if (hasEmptyApprovals) {
      Alert("All approval stages must have at least one approver.", "error");
      return;
    }
    // Ensure unit price is provided for all line items before submission
    const latestLineItems =
      lineItemsRef.current?.getCurrentLineItems() || lineItems;
    const hasEmptyUnitPrices = latestLineItems.some(
      (item) =>
        item.unitPrice === null ||
        item.unitPrice === undefined ||
        item.unitPrice === "",
    );

    if (hasEmptyUnitPrices) {
      // build field-level errors for line items and send to child component
      const fieldErrors = {};
      latestLineItems.forEach((item) => {
        if (
          item.unitPrice === null ||
          item.unitPrice === undefined ||
          item.unitPrice === ""
        ) {
          fieldErrors[item.id] = {
            unitPrice: "Please fill the unit price.",
          };
        }
      });

      try {
        lineItemsRef.current?.setValidationErrors(fieldErrors);
      } catch (e) {
        // ignore if child doesn't support it
      }

      Alert("Please fill the unit price.", "error");
      return;
    }
    setLoadingData(true);
    try {
      await submitPurchaseOrder(po_id);
      Alert("Purchase Order Submitted Successfully!", "success");
      fetchData();
    } catch (error) {
      console.error(error);
      Alert("Failed to submit the Purchase Order", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprovePurchaseOrder = async () => {
    setLoadingData(true);
    try {
      await approvePurchaseOrder(po_id);
      Alert("Purchase Order Approved Successfully!", "success");
    } catch (error) {
      console.log(error);
      Alert("Failed to approve the Purchase Order", "error");
    } finally {
      setLoadingData(false);
      fetchData();
    }
  };

  const handleRejectPurchaseOrder = async () => {
    setLoadingData(true);
    try {
      await rejectPurchaseOrder(po_id);
      Alert("Purchase Order Rejected Successfully!", "success");
    } catch (error) {
      console.log(error);
      Alert("Failed to reject the Purchase Order", "error");
    } finally {
      setLoadingData(false);
      fetchData();
    }
  };

  const handleClosePurchaseOrder = async () => {
    setLoadingData(true);
    try {
      await closePurchaseOrder(po_id);
      Alert("Purchase Order Closed Successfully!", "success");
    } catch (error) {
      console.log(error);
      Alert("Failed to close the Purchase Order", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDrawerClose = async () => {
    setPageDrawer(false);

    if (
      drawerType === "address" &&
      drawerEntityType === "vendor" &&
      editPoData.companyId
    ) {
      try {
        const addresses = await fetchCompanyAddressById(editPoData.companyId);
        setVendorAddresses(Array.isArray(addresses) ? addresses : []);
      } catch (error) {
        console.error("Error refreshing vendor addresses:", error);
      }
    } else if (
      drawerType === "contact" &&
      drawerEntityType === "vendor" &&
      editPoData.companyId
    ) {
      try {
        const contacts = await fetchCompanyContactByVendorId(
          editPoData.companyId,
        );
        setVendorContacts(Array.isArray(contacts) ? contacts : []);
      } catch (error) {
        console.error("Error refreshing vendor contacts:", error);
      }
    } else if (
      drawerType === "address" &&
      (drawerEntityType === "billing" || drawerEntityType === "shipping")
    ) {
      try {
        const organizationsData = await fetchAllOrganizationWithAddresses();
        setOrganizations(
          Array.isArray(organizationsData)
            ? organizationsData.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              )
            : [],
        );

        if (drawerEntityType === "billing" && selectedBillingOrganization) {
          const updatedOrg = organizationsData.find(
            (org) => org.id === selectedBillingOrganization.id,
          );
          if (updatedOrg) {
            setSelectedBillingOrganization(updatedOrg);
            setBillingAddressesData(updatedOrg.organizationAddresses || []);
          }
        } else if (
          drawerEntityType === "shipping" &&
          selectedShippingOrganization
        ) {
          const updatedOrg = organizationsData.find(
            (org) => org.id === selectedShippingOrganization.id,
          );
          if (updatedOrg) {
            setSelectedShippingOrganization(updatedOrg);
            setShippingAddressesData(updatedOrg.organizationAddresses || []);
          }
        }
      } catch (error) {
        console.error("Error refreshing organizations:", error);
      }
    }

    setDrawerType(null);
    setDrawerEntityId(null);
    setDrawerEntityType(null);
  };

  const getDrawerHeaderText = () => {
    if (drawerType === "address" && drawerEntityType === "vendor") {
      return ` ${editPoData.vendor?.name || "Vendor"} Address's`;
    } else if (drawerType === "contact" && drawerEntityType === "vendor") {
      return ` ${editPoData.vendor?.name || "Vendor"} Contact's`;
    } else if (drawerType === "address" && drawerEntityType === "billing") {
      return `${
        selectedBillingOrganization?.name || "Billing Organization"
      } Address's`;
    } else if (drawerType === "address" && drawerEntityType === "shipping") {
      return ` ${
        selectedShippingOrganization?.name || "Shipping Organization"
      } Address's`;
    }
    return "Adding Details";
  };

  const selectedCurrency = currencies.find(
    (c) => c.id === editPoData.currencyId,
  );

  return (
    <div className="EditFlyout">
      <div className="PODetailsMainDiv">
        <div className="PODetailsPageHeader">
          <h3>{editPoData?.number} Details</h3>
          <div className="PODetailsPageHeaderDetails">
            <p>Status: {editPoData?.status}</p>{" "}
            <Divider orientation="vertical" flexItem />{" "}
            {editPoData?.status !== "Closed" &&
            editPoData?.status !== "Cancelled" &&
            readOnlyMode ? (
              <>
                <button
                  onClick={() => {
                    if (
                      isSuperAdmin ||
                      hasPermission(PERMISSIONS.PURCHASEORDERS.MODIFY)
                    ) {
                      setReadOnlyMode(false);
                    } else {
                      Alert(
                        "You do not have access to edit any details..! ",
                        "warning",
                      );
                    }
                  }}
                  className="DimButton"
                >
                  <ion-icon name="create-outline"></ion-icon>
                  Edit P.O
                </button>

                <Divider orientation="vertical" flexItem />
              </>
            ) : null}
            {editPoData.status === "Delivered" &&
            hasPermission(PERMISSIONS.PURCHASEORDERS.APPROVER) ? (
              <>
                <button
                  onClick={() => {
                    if (
                      isSuperAdmin ||
                      (userData.email === editPoData.createdBy &&
                        hasPermission(PERMISSIONS.PURCHASEORDERS.APPROVER))
                    ) {
                      handleClosePurchaseOrder();
                    } else {
                      Alert(
                        "You do not have access to Close the P.O ..! ",
                        "warning",
                      );
                    }
                  }}
                  className="AddOrUpdateButton"
                >
                  Close P.O
                </button>
                <Divider orientation="vertical" flexItem />
              </>
            ) : null}
            {editPoData?.status === "Draft" && readOnlyMode && (
              <>
                <button
                  onClick={() => {
                    if (hasPermission(PERMISSIONS.PURCHASEORDERS.MODIFY)) {
                      handleSubmitPurchaseOrder();
                    } else {
                      Alert(
                        "You do not have access to Submit the P.O ..! ",
                        "warning",
                      );
                    }
                  }}
                  className="AddOrUpdateButton"
                >
                  Submit P.O
                </button>
                <Divider orientation="vertical" flexItem />
              </>
            )}
            {editPoData.status === "Submitted" &&
            hasPermission(PERMISSIONS.PURCHASEORDERS.APPROVER) &&
            canCurrentUserApprove &&
            readOnlyMode ? (
              <>
                <button
                  onClick={() => {
                    if (hasPermission(PERMISSIONS.PURCHASEORDERS.APPROVER)) {
                      handleApprovePurchaseOrder();
                    } else {
                      Alert(
                        "You do not have access to Approve the P.O ..! ",
                        "warning",
                      );
                    }
                  }}
                  className="AddOrUpdateButton"
                >
                  Approve P.O
                </button>
                <Divider orientation="vertical" flexItem />
                <button
                  onClick={() => {
                    if (hasPermission(PERMISSIONS.PURCHASEORDERS.MODIFY)) {
                      handleRejectPurchaseOrder();
                    } else {
                      Alert(
                        "You do not have access to Reject the P.O ..! ",
                        "warning",
                      );
                    }
                  }}
                  className="RejectBtn"
                >
                  Reject P.O
                </button>
                <Divider orientation="vertical" flexItem />
              </>
            ) : null}
            {!readOnlyMode && (
              <>
                <button
                  className="AddOrUpdateButton"
                  onClick={() => handleEditPO(approvers)}
                >
                  Update P.O
                </button>
                <Divider orientation="vertical" flexItem />
              </>
            )}
            <button
              onClick={async () => {
                if (hasPermission(PERMISSIONS.PURCHASEORDERS.PRINT)) {
                  const printOptions = await showPrintOptionsDialog();
                  if (printOptions) {
                    handleViewPdfInNewWindow(
                      editPoData,
                      lineItems,
                      vendors,
                      vendorAddresses,
                      selectedShippingOrganization,
                      selectedBillingOrganization,
                      shippingAddressesData,
                      billingAddressesData,
                      selectedCurrency,
                      printOptions,
                    );
                  }
                } else {
                  Alert(
                    "You do not have access to Print the P.O ..! ",
                    "warning",
                  );
                }
              }}
              className="DimButton"
            >
              <ion-icon name="print-outline"></ion-icon> Print
            </button>
            <button
              className="DimButton"
              onClick={() => handleDownloadZohoCsv()}
            >
              Export PO (Zoho)
            </button>
          </div>
        </div>
        <POApprovalTracker approvers={approvals} loadingData={loadingData} />{" "}
        <div className="PageTabs">
          <button
            className={`TabButton ${
              pageTabValue === "overview" ? "Selected" : ""
            }`}
            onClick={() => setPageTabValue("overview")}
          >
            Overview
          </button>
          {hasPermission(PERMISSIONS.PURCHASEORDERS.DOCUMENTS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "documents" ? "Selected" : ""
              }`}
              onClick={() => setPageTabValue("documents")}
            >
              Documents
            </button>
          )}
          {hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "grn" ? "Selected" : ""
              }`}
              onClick={() => setPageTabValue("grn")}
            >
              GRN
            </button>
          )}
          {hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "approvals" ? "Selected" : ""
              }`}
              onClick={() => setPageTabValue("approvals")}
            >
              Approvals
            </button>
          )}
        </div>
        <div className="PODetailsContent">
          {pageTabValue === "overview" &&
            (loadingData ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 300,
                }}
              >
                <ClipLoader size={30} color="#009cbb" loading={true} />
              </div>
            ) : (
              <div className="PurchaseOrdersDetailsTab">
                <div className="CreateFlyoutBodyTwoColumns">
                  <Autocomplete
                    options={vendors}
                    disableClearable={true}
                    getOptionLabel={(option) =>
                      option && (option.vendorCode || option.name)
                        ? `${option.vendorCode || ""} - ${
                            option.name || ""
                          }`.trim()
                        : ""
                    }
                    value={
                      vendors.find((s) => s.id === editPoData?.companyId) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setEditPoData((prev) => ({
                        ...prev,
                        companyId: newValue?.id || null,
                        vendor: newValue,
                        currencyId: newValue?.currencyId || prev.currencyId,
                      }));
                    }}
                    disabled={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vendor"
                        className="AdminTextFeilds POTextFileds"
                        error={!!formErrors.companyId}
                        helperText={formErrors.companyId}
                        required
                      />
                    )}
                  />

                  <Autocomplete
                    options={paymentTerms}
                    getOptionLabel={(option) => option.name || ""}
                    value={
                      paymentTerms.find(
                        (s) => s.id === editPoData.paymentTerm,
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      handleAutocompleteChange("paymentTerm", newValue)
                    }
                    disabled={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Payment Terms"
                        className="AdminTextFeilds POTextFileds"
                        error={!!formErrors.paymentTerm}
                        helperText={formErrors.paymentTerm}
                        required
                      />
                    )}
                  />
                  {editPoData.companyId ? (
                    <div className="VendorDetails">
                      {vendorDetailsLoading ? (
                        <ClipLoader
                          size={30}
                          color={"#009cbb"}
                          loading={vendorDetailsLoading}
                        />
                      ) : (
                        <div className="VendorDetailsCard">
                          <div className="VendorDetailsCardHeader">
                            <PersonIcon fontSize="small" />
                            <strong>Vendor Details</strong>
                          </div>
                          <div className="VendorDetailsDiv">
                            {(() => {
                              const billing =
                                vendorAddresses?.find(
                                  (addr) =>
                                    addr.addressId ===
                                    editPoData.vendorBillingAddress,
                                ) || vendorAddresses?.[0];
                              if (!billing || !billing.address)
                                return (
                                  <div>
                                    No Address's available for this vendor{" "}
                                    {!readOnlyMode && (
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("address");
                                          setDrawerEntityId(
                                            editPoData.companyId,
                                          );
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Address <AddIcon fontSize="small" />
                                      </p>
                                    )}
                                  </div>
                                );

                              const {
                                addressLine1,
                                addressLine2,
                                city,
                                state,
                                postalCode,
                              } = billing.address;
                              return (
                                <div className="VendorDetailsCardDetails">
                                  {addressLine1 && <p>{addressLine1},</p>}
                                  {addressLine2 && <p>{addressLine2},</p>}
                                  {city && <p>{city},</p>}
                                  {state && <p>{state},</p>}
                                  {postalCode && <p>{postalCode}.</p>}
                                  {!readOnlyMode && (
                                    <>
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={(e) => {
                                          setAnchorEl(e.currentTarget);
                                          setPopperType("vendorBillingAddress");
                                        }}
                                      >
                                        Change Address{" "}
                                        <EditIcon fontSize="small" />
                                      </p>
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("address");
                                          setDrawerEntityId(
                                            editPoData.companyId,
                                          );
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Address <AddIcon fontSize="small" />
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                            <Divider orientation="vertical" flexItem />
                            {(() => {
                              const vendorContact =
                                vendorContacts?.find(
                                  (contact) =>
                                    contact.contactId ===
                                    editPoData.vendorBillingContact,
                                ) || vendorContacts?.[0];
                              if (!vendorContact || !vendorContact.contact)
                                return (
                                  <div>
                                    No Contacts available for this vendor{" "}
                                    {!readOnlyMode && (
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("contact");
                                          setDrawerEntityId(
                                            editPoData.companyId,
                                          );
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Contact <AddIcon fontSize="small" />
                                      </p>
                                    )}
                                  </div>
                                );

                              const {
                                firstName,
                                lastName,
                                email,
                                phoneNumber,
                              } = vendorContact.contact;
                              const fullName =
                                `${firstName || ""} ${lastName || ""}`.trim();
                              return (
                                <div className="VendorDetailsCardDetails">
                                  {fullName && <p>{fullName}</p>}
                                  {phoneNumber && <p>{phoneNumber}</p>}
                                  {email && <p>{email}</p>}
                                  {!readOnlyMode && (
                                    <>
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={(e) => {
                                          setAnchorEl(e.currentTarget);
                                          setPopperType("vendorBillingContact");
                                        }}
                                      >
                                        Change Contact{" "}
                                        <EditIcon fontSize="small" />
                                      </p>
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("contact");
                                          setDrawerEntityId(
                                            editPoData.companyId,
                                          );
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Contact <AddIcon fontSize="small" />
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <h3>
                            GSTIN: {"   "}
                            {editPoData.vendor?.taxId ||
                              vendors.find(
                                (s) => s.id === editPoData?.companyId,
                              )?.taxId}
                          </h3>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="RightColumnStack">
                    <TextField
                      label="Subject"
                      name="description"
                      value={editPoData.description || ""}
                      onChange={handleInputChange}
                      className="AdminTextFeilds POTextFileds"
                      multiline
                      rows={4}
                      disabled={readOnlyMode}
                    />
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) =>
                        option && (option.projectCode || option.name)
                          ? `${option.projectCode || ""} - ${
                              option.name || ""
                            }`.trim()
                          : ""
                      }
                      value={
                        projects.find((s) => s.id === editPoData.project) ||
                        null
                      }
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("project", newValue)
                      }
                      disabled={readOnlyMode}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Project"
                          className="AdminTextFeilds POTextFileds"
                          error={!!formErrors.project}
                          helperText={formErrors.project}
                        />
                      )}
                    />
                  </div>

                  <Autocomplete
                    options={organizations}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedBillingOrganization}
                    onChange={(event, newValue) => {
                      const billingAddresses = newValue?.organizationAddresses;

                      const defaultBillingAddress =
                        billingAddresses?.length > 0
                          ? billingAddresses[0]
                          : null;

                      setBillingAddressesData(billingAddresses || []);
                      setSelectedBillingOrganization(newValue);
                      setEditPoData((prev) => ({
                        ...prev,
                        billingAddress:
                          defaultBillingAddress?.addressId || null,
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    disableClearable={true}
                    disabled={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Billing Organization"
                        className="AdminTextFeilds"
                        error={!!formErrors.billingAddress}
                        helperText={formErrors.billingAddress}
                        required
                      />
                    )}
                  />
                  <Autocomplete
                    options={organizations}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedShippingOrganization}
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    onChange={(event, newValue) => {
                      const shippingAddresses = newValue?.organizationAddresses;

                      const defaultShippingAddress =
                        shippingAddresses?.length > 0
                          ? shippingAddresses[0]
                          : null;

                      setShippingAddressesData(shippingAddresses || []);
                      setSelectedShippingOrganization(newValue);
                      setEditPoData((prev) => ({
                        ...prev,
                        shippingAddress:
                          defaultShippingAddress?.addressId || null,
                      }));
                    }}
                    disableClearable={true}
                    disabled={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Shipping Organization"
                        className="AdminTextFeilds"
                      />
                    )}
                  />

                  {selectedBillingOrganization && (
                    <div className="VendorDetailsCard">
                      <div className="VendorDetailsCardHeader">
                        <LocationOnIcon fontSize="small" />
                        <strong>Billing Address</strong>
                      </div>
                      {(() => {
                        const billing =
                          selectedBillingOrganization.organizationAddresses?.find(
                            (item) =>
                              item.addressId === editPoData.billingAddress,
                          );

                        if (!billing || !billing.address)
                          return (
                            <div>
                              No Address's available for this Organization
                              {!readOnlyMode && (
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={() => {
                                    setDrawerType("address");
                                    setDrawerEntityId(
                                      selectedBillingOrganization?.id,
                                    );
                                    setDrawerEntityType("billing");
                                    setPageDrawer(true);
                                  }}
                                >
                                  New Address <AddIcon fontSize="small" />
                                </p>
                              )}
                            </div>
                          );

                        const {
                          addressLine1,
                          addressLine2,
                          city,
                          state,
                          postalCode,
                        } = billing.address;
                        return (
                          <div className="VendorDetailsCardDetails">
                            {addressLine1 && <p>{addressLine1}</p>}
                            {addressLine2 && <p>{addressLine2}</p>}
                            {city && <p>{city}</p>}
                            {state && <p>{state}</p>}
                            {postalCode && <p>{postalCode}</p>}
                            {!readOnlyMode && (
                              <>
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setPopperType("billing");
                                  }}
                                >
                                  Change Address <EditIcon fontSize="small" />
                                </p>
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={() => {
                                    setDrawerType("address");
                                    setDrawerEntityId(
                                      selectedBillingOrganization?.id,
                                    );
                                    setDrawerEntityType("billing");
                                    setPageDrawer(true);
                                  }}
                                >
                                  New Address <AddIcon fontSize="small" />
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {selectedShippingOrganization && (
                    <div className="VendorDetailsCard">
                      <div className="VendorDetailsCardHeader">
                        <LocationOnIcon fontSize="small" />
                        <strong>Shipping Address</strong>
                      </div>
                      {(() => {
                        const shipping =
                          selectedShippingOrganization.organizationAddresses?.find(
                            (item) =>
                              item.addressId === editPoData.shippingAddress,
                          );

                        if (!shipping || !shipping.address)
                          return (
                            <div>
                              No Address's available for this Organization
                              {!readOnlyMode && (
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={() => {
                                    setDrawerType("address");
                                    setDrawerEntityId(
                                      selectedShippingOrganization?.id,
                                    );
                                    setDrawerEntityType("shipping");
                                    setPageDrawer(true);
                                  }}
                                >
                                  New Address <AddIcon fontSize="small" />
                                </p>
                              )}
                            </div>
                          );

                        const {
                          addressLine1,
                          addressLine2,
                          city,
                          state,
                          postalCode,
                        } = shipping.address;
                        return (
                          <div className="VendorDetailsCardDetails">
                            {addressLine1 && <p>{addressLine1}</p>}
                            {addressLine2 && <p>{addressLine2}</p>}
                            {city && <p>{city}</p>}
                            {state && <p>{state}</p>}
                            {postalCode && <p>{postalCode}</p>}
                            {!readOnlyMode && (
                              <>
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setPopperType("shipping");
                                  }}
                                >
                                  Change Address <EditIcon fontSize="small" />
                                </p>
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={() => {
                                    setDrawerType("address");
                                    setDrawerEntityId(
                                      selectedShippingOrganization?.id,
                                    );
                                    setDrawerEntityType("shipping");
                                    setPageDrawer(true);
                                  }}
                                >
                                  New Address <AddIcon fontSize="small" />
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <TextField
                    label="Order Date"
                    type="date"
                    name="orderDate"
                    value={editPoData.orderDate || ""}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    className="AdminTextFeilds POTextFileds"
                    disabled={readOnlyMode}
                    error={!!formErrors.orderDate}
                    helperText={formErrors.orderDate}
                    required
                  />
                  <TextField
                    label="Delivery Date"
                    type="date"
                    name="expectedDeliveryDate"
                    value={editPoData.expectedDeliveryDate || ""}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    className={`AdminTextFeilds POTextFileds ${
                      !editPoData.expectedDeliveryDate ? "grey-date-text" : ""
                    }`}
                    error={!!formErrors.expectedDeliveryDate}
                    helperText={formErrors.expectedDeliveryDate}
                    inputProps={{ min: editPoData.orderDate }}
                    disabled={readOnlyMode}
                  />

                  <TextField
                    label="Quotation Reference"
                    name="quotationReference"
                    value={editPoData.quotationReference}
                    onChange={handleInputChange}
                    className="AdminTextFeilds POTextFileds"
                    disabled={readOnlyMode}
                  />
                  <TextField
                    label="Shipment Reference"
                    name="shipmentReference"
                    value={editPoData.shipmentReference}
                    onChange={handleInputChange}
                    className="AdminTextFeilds POTextFileds"
                    disabled={readOnlyMode}
                  />
                  <div className="FullWidthField">
                    <TextField
                      label="Delivery Terms"
                      name="deliveryTerms"
                      value={editPoData.deliveryTerms || ""}
                      onChange={handleInputChange}
                      className="AdminTextFeilds POTextFileds"
                      multiline
                      rows={3}
                      disabled={readOnlyMode}
                      error={!!formErrors.deliveryTerms}
                      helperText={formErrors.deliveryTerms}
                      required
                    />
                  </div>
                  <div className="FullWidthField">
                    <TextField
                      label="Customer Instructions"
                      name="customerInstructions"
                      value={editPoData.customerInstructions || ""}
                      onChange={handleInputChange}
                      className="AdminTextFeilds POTextFileds"
                      multiline
                      disabled={readOnlyMode}
                      rows={3}
                    />
                  </div>
                </div>
                <Divider orientation="horizontal" />
                <div className="PODetailsContentInner">
                  <LineItems
                    ref={lineItemsRef}
                    lineItems={lineItems}
                    editPoData={editPoData}
                    readOnlyMode={readOnlyMode}
                    setEditPoData={setEditPoData}
                  />
                </div>
                <TextField
                  label="Terms and Conditions"
                  name="poTerms"
                  multiline
                  rows={5}
                  value={editPoData.poTerms || ""}
                  onChange={handleInputChange}
                  className="AdminTextFeilds POTextFileds"
                  disabled={readOnlyMode}
                />
              </div>
            ))}
          {pageTabValue === "documents" && (
            <div className="PODetailsContentInner">
              <Documents
                entityId={po_id}
                entityType="Purchase Orders"
                entityNumber={editPoData?.number}
                canDelete={
                  hasPermission(PERMISSIONS.PURCHASEORDERS.DOCUMENTS.DELETE) &&
                  editPoData?.status === "Draft"
                }
                canEdit={hasPermission(
                  PERMISSIONS.PURCHASEORDERS.DOCUMENTS.MODIFY,
                )}
                isDraft={editPoData?.status === "Draft"}
                tittle="Line Items Documents"
              />
            </div>
          )}
          {pageTabValue === "grn" && (
            <div className="PODetailsContentInner">
              <POGRNs
                selectedRowId={po_id}
                canView={hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW)}
              />
            </div>
          )}
          {pageTabValue === "approvals" && (
            <div className="PODetailsContentInner">
              <POApprovals
                approvals={approvals}
                approvers={approvers}
                setApprovers={setApprovers}
                readOnlyMode={readOnlyMode || editPoData?.status !== "Draft"}
                loadingData={loadingData}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
      <Popper
        open={!!popperType}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setPopperType(null)}>
          <div
            style={{
              background: "#202020",
              padding: 8,
              borderRadius: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              minWidth: 300,
            }}
          >
            <Autocomplete
              options={
                popperType === "billing"
                  ? billingAddressesData
                  : popperType === "shipping"
                    ? shippingAddressesData
                    : popperType === "vendorBillingAddress"
                      ? vendorAddresses
                      : vendorContacts
              }
              getOptionLabel={(option) => {
                const addr = option?.address;
                const contact = option?.contact;
                return popperType === "vendorBillingContact"
                  ? `${contact?.firstName || ""} ${contact?.lastName || ""}, ${
                      contact?.email || ""
                    }, ${contact?.phoneNumber || ""}`
                  : `${addr?.addressLine1 || ""}, ${addr?.city || ""}, ${
                      addr?.state || ""
                    }, ${addr?.postalCode || ""}`;
              }}
              value={
                popperType === "billing"
                  ? billingAddressesData.find(
                      (a) => a.addressId === editPoData.billingAddress,
                    )
                  : popperType === "shipping"
                    ? shippingAddressesData.find(
                        (a) => a.addressId === editPoData.shippingAddress,
                      )
                    : popperType === "vendorBillingAddress"
                      ? vendorAddresses.find(
                          (a) =>
                            a.addressId === editPoData.vendorBillingAddress,
                        )
                      : vendorContacts.find(
                          (c) =>
                            c.contactId === editPoData.vendorBillingContact,
                        )
              }
              onChange={(event, newValue) => {
                if (popperType === "billing") {
                  setEditPoData((prev) => ({
                    ...prev,
                    billingAddress: newValue?.addressId || "",
                  }));
                } else if (popperType === "shipping") {
                  setEditPoData((prev) => ({
                    ...prev,
                    shippingAddress: newValue?.addressId || "",
                  }));
                } else if (popperType === "vendorBillingAddress") {
                  setEditPoData((prev) => ({
                    ...prev,
                    vendorBillingAddress: newValue?.addressId || "",
                  }));
                } else {
                  setEditPoData((prev) => ({
                    ...prev,
                    vendorBillingContact: newValue?.contactId || "",
                  }));
                }
                setPopperType(null);
              }}
              isOptionEqualToValue={(option, value) =>
                option?.addressId === value?.addressId ||
                option?.contactId === value?.contactId
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Select ${
                    popperType === "billing"
                      ? "Billing Address"
                      : popperType === "vendorBillingAddress"
                        ? "Vendor Address"
                        : popperType === "shipping"
                          ? "Shipping Address"
                          : "Contact"
                  }`}
                  className="AdminTextFeilds"
                />
              )}
            />
          </div>
        </ClickAwayListener>
      </Popper>
      <ResizableDrawer
        anchor="right"
        open={
          pageDrawer &&
          drawerType === "address" &&
          drawerEntityType === "vendor"
        }
        onClose={() => {
          setDrawerType(null);
          setDrawerEntityId(null);
          setDrawerEntityType(null);
        }}
        defaultWidth={70}
      >
        <div className="PoAddDetailsDrawerHeaderDiv">
          <p className="PoAddDetailsDrawerHeader">{getDrawerHeaderText()}</p>
          <ion-icon name="close-outline" onClick={handleDrawerClose}></ion-icon>
        </div>{" "}
        <div style={{ padding: "15px" }}>
          <EditAddress
            selectedCompanyId={drawerEntityId}
            onSuccess={handleDrawerClose}
          />
        </div>
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={
          pageDrawer &&
          drawerType === "contact" &&
          drawerEntityType === "vendor"
        }
        onClose={() => {
          setDrawerType(null);
          setDrawerEntityId(null);
          setDrawerEntityType(null);
        }}
        defaultWidth={70}
      >
        <div className="PoAddDetailsDrawerHeaderDiv">
          <p className="PoAddDetailsDrawerHeader">{getDrawerHeaderText()}</p>
          <ion-icon name="close-outline" onClick={handleDrawerClose}></ion-icon>
        </div>{" "}
        <div style={{ padding: "15px" }}>
          <EditContacts
            selectedCompanyId={drawerEntityId}
            onSuccess={handleDrawerClose}
          />
        </div>
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={
          pageDrawer &&
          drawerType === "address" &&
          (drawerEntityType === "billing" || drawerEntityType === "shipping")
        }
        onClose={() => {
          setDrawerType(null);
          setDrawerEntityId(null);
          setDrawerEntityType(null);
        }}
        defaultWidth={70}
      >
        <div className="PoAddDetailsDrawerHeaderDiv">
          <p className="PoAddDetailsDrawerHeader">{getDrawerHeaderText()}</p>
          <ion-icon
            name="close-outline"
            onClick={() => {
              setDrawerType(null);
              setDrawerEntityId(null);
              setDrawerEntityType(null);
            }}
          ></ion-icon>
        </div>
        <div style={{ padding: "15px" }}>
          <EditOrganizationAddress
            selectedOrganizationData={drawerEntityId}
            handleRefresh={handleDrawerClose}
          />
        </div>
      </ResizableDrawer>
    </div>
  );
};

export default PurchaseOrderDetails;
