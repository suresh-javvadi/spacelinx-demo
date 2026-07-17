import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Divider,
  MenuItem,
} from "@mui/material";
import { Popper, ClickAwayListener } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Info from "@mui/icons-material/Info";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { fetchVendors } from "../../../services/companyService";
import { fetchProject } from "../../../services/projectService";
import { fetchPaymentTerms } from "../../../services/paymentTermService";
import {
  fetchRequisitionLookup,
  fetchRequisitionById,
  updateRequisition,
} from "../../../services/requisitionService";
import { createPO } from "../../../services/purchaseOrders";
import { fetchCompanyAddressById } from "../../../services/companyAddressService";
import { fetchCompanyContactByVendorId } from "../../../services/companyContactService";
import { fetchAllOrganizationWithAddresses } from "../../../services/organizationService";
import { fetchCurrencyLookup } from "../../../services/currencyService";
import { resolveConversionRateToInr } from "../../../utils/currencyConversion";
import LineItems from "./LineItems";
import PODocuments from "./PODocuments";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditAddress from "../../ContactHub/Company/EditAddress";
import EditContacts from "../../ContactHub/Company/EditContacts";
import EditOrganizationAddress from "../../ContactHub/Organization/EditOrganizationAddress";
import Cliploader from "../../../Components/Loaders/Cliploader";
import "../procurement.css";
import "../../features.css";
import "../../ContactHub/Staff/Staff.css";
import "../../ContactHub/Company/Company.css";

const NewPurchaseOrder = () => {
  const { Alert } = useContext(AlertsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lineItemsRef = useRef([]);
  const [pageDrawer, setPageDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(null);
  const [drawerEntityId, setDrawerEntityId] = useState(null);
  const [drawerEntityType, setDrawerEntityType] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [vendorDetailsLoading, setVendorDetailsLoading] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [vendorAddresses, setVendorAddresses] = useState([]);
  const [vendorContacts, setVendorContacts] = useState([]);
  const [poData, setPoData] = useState({
    purchaseOrderType: "Direct",
    requisition: null,
    vendor: null,
    project: null,
    paymentTerm: null,
    orderDate: "",
    deliveryDate: null,
    vendorBillingAddress: null,
    vendorBillingContact: null,
    shippingAddress: null,
    billingAddress: null,
    poTerms: "",
    discount: null,
    currencyId: "",
    discountType: null,
    taxOption: "SGST/CGST",
    quotationReference: "",
    shipmentReference: "",
    roundOff: 0,
    description: "",
    customerInstructions: "",
    deliveryTerms: "",
    termsAndConditions: "",
  });
  const [poLineItems, setPoLineItems] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [pageTabValue, setPageTabValue] = useState("overview");
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperType, setPopperType] = useState(null);
  const [shippingAddressesData, setShippingAddressesData] = useState([]);
  const [billingAddressesData, setBillingAddressesData] = useState([]);
  const [selectedShippingOrganization, setSelectedShippingOrganization] =
    useState(null);
  const [selectedDeliveryTerms, setSelectedDeliveryTerms] = useState(null);
  const [selectedBillingOrganization, setSelectedBillingOrganization] =
    useState(null);
  const selectedParts = location.state?.selectedParts || [];

  useEffect(() => {
    if (selectedParts.length > 0) {
      const poLineItems = selectedParts.map((part) => {
        const orderedQty = part.qtyAvailable || 0;
        const unitPrice = part.inventoryUnitPrice || 0;

        const partObj = {
          id: part.partId,
          name: part.partName,
          partNumber: part.partNumber,
          manufacturingPartNumber: part.manufacturingPartNumber,
        };

        return {
          part: partObj,
          orderedQuantity: 1,
          description: part.partName || "",
          hsn: part.hsn || "",
          unitPrice: unitPrice,
          totalPrice: orderedQty * unitPrice,
          tax: 0,
          taxType: "SGST/CGST",
          discount: 0,
          discountType: null,
        };
      });

      lineItemsRef.current = poLineItems;
      setPoLineItems(poLineItems);
    }
  }, [selectedParts]);

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
        fetchCurrencyLookup(),
      ]);

      setCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
      setPaymentTerms(Array.isArray(paymentTermsData) ? paymentTermsData : []);
      setVendors(
        Array.isArray(vendorsData)
          ? vendorsData.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          : [],
      );
      setOrganizations(
        Array.isArray(organizationsData)
          ? organizationsData.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          : [],
      );
      setProjects(Array.isArray(projectData) ? projectData : []);
      setRequisitions(Array.isArray(requisitionData) ? requisitionData : []);
    } catch (error) {
      Alert("Error fetching initial data for new purchase order.", "error");
      console.error("Error fetching initial data:", error);
      setPaymentTerms([]);
      setVendors([]);
      setProjects([]);
      setRequisitions([]);
      setOrganizations([]);
      setCurrencies([]);
    } finally {
      setLoadingData(false);
    }
  }, [Alert]);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAutocompleteChange = (name, value) => {
    setPoData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!poData.vendor) newErrors.vendor = "Vendor is required.";
    if (!poData.paymentTerm)
      newErrors.paymentTerm = "Payment term is required.";
    if (!poData.orderDate) newErrors.orderDate = "Order date is required.";

    if (poData.orderDate && poData.deliveryDate) {
      const order = new Date(poData.orderDate);
      const delivery = new Date(poData.deliveryDate);
      order.setHours(0, 0, 0, 0);
      delivery.setHours(0, 0, 0, 0);

      if (delivery < order) {
        newErrors.deliveryDate = "Delivery date cannot be before order date.";
      }
    }

    if (!selectedBillingOrganization) {
      newErrors.billingAddress = "Billing organization is required.";
    } else {
      const billingAddresses =
        selectedBillingOrganization.organizationAddresses?.filter(
          (addr) => addr.addressType?.toLowerCase() === "billing",
        ) || [];

      if (billingAddresses.length === 0) {
        newErrors.billingAddress =
          "Selected organization has no billing addresses attached.";
      } else if (!poData.billingAddress) {
        newErrors.billingAddress = "Billing address is required.";
      }
    }
    if (!poData.deliveryTerms || poData.deliveryTerms.trim() === "") {
      newErrors.deliveryTerms = "Delivery terms are required.";
    }

    if (
      poData.purchaseOrderType === "From Requisition" &&
      !poData.requisition
    ) {
      newErrors.requisition = "Requisition is required for this PO type.";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    poData,
    selectedBillingOrganization,
    selectedShippingOrganization,
    selectedDeliveryTerms,
  ]);

  const handleCreatePO = async () => {
    const currentLineItems = lineItemsRef.current;
    if (currentLineItems.length === 0) {
      Alert("Please add at least one Line Item.", "warning");
      return;
    }

    if (!validate()) {
      Alert(
        "Please fill all the mandatory fields before proceeding with the PO.",
        "error",
      );
      return;
    }

    const formData = new FormData();
    formData.append("CompanyId", poData.vendor?.id || "");
    if (poData.project?.id) {
      formData.append("ProjectId", poData.project.id);
    }
    if (
      poData.purchaseOrderType === "From Requisition" &&
      poData.requisition?.id
    ) {
      formData.append("RequisitionId", poData.requisition.id);
    }
    formData.append("PaymentTermId", poData.paymentTerm?.id || "");
    formData.append("OrderDate", poData.orderDate ?? "");
    if (poData.deliveryDate) {
      formData.append("ExpectedDeliveryDate", poData.deliveryDate);
    }

    formData.append("TaxOption", poData.taxOption);
    formData.append("CurrencyId", poData.currencyId);
    formData.append("TotalAmount", poData.totalAmount.toFixed(4));
    formData.append("BillingAddressId", poData.billingAddress?.addressId || "");
    formData.append(
      "ShippingAddressId",
      poData.shippingAddress?.addressId || "",
    );
    formData.append(
      "VendorBillingAddressId",
      poData.vendorBillingAddress?.addressId || "",
    );
    formData.append(
      "VendorBillingContactId",
      poData.vendorBillingContact?.contactId || "",
    );
    formData.append(
      "QuotationReferenceNumber",
      poData.quotationReference || "",
    );
    formData.append("ShipmentReferenceNumber", poData.shipmentReference || "");
    formData.append("poTerms", poData.poTerms || "");
    formData.append("DeliveryStatus", "Pending");
    formData.append("PurchaseOrderType", poData.purchaseOrderType);
    formData.append("Discount", poData.discount || 0);
    formData.append("DiscountType", poData.discountType || null);
    formData.append("RoundOff", Number(poData.roundOff).toFixed(4));
    formData.append("Description", poData.description || "");
    formData.append("CustomerInstructions", poData.customerInstructions || "");
    formData.append("DeliveryTerms", poData.deliveryTerms || "");
    formData.append("TermsAndConditions", poData.termsAndConditions || "");

    const poCurrencyCode = currencies.find(
      (c) => c.id === poData.currencyId,
    )?.code;
    const conversionRate = await resolveConversionRateToInr(poCurrencyCode);

    currentLineItems.forEach((detail, index) => {
      formData.append(`PoLineItems[${index}].partId`, detail.part.id || "");
      formData.append(
        `PoLineItems[${index}].orderedQuantity`,
        detail.orderedQuantity || 0,
      );
      formData.append(
        `PoLineItems[${index}].pendingQuantity`,
        detail.orderedQuantity || 0,
      );
      formData.append(`PoLineItems[${index}].hsn`, detail.hsn || "");
      formData.append(
        `PoLineItems[${index}].description`,
        detail.description || "",
      );
      formData.append(`PoLineItems[${index}].unitPrice`, detail.unitPrice || 0);
      formData.append(
        `PoLineItems[${index}].totalPrice`,
        detail.totalPrice || 0,
      );
      formData.append(
        `PoLineItems[${index}].currencyId`,
        poData.currencyId || "",
      );
      formData.append(`PoLineItems[${index}].conversionRate`, conversionRate);
      formData.append(`PoLineItems[${index}].Tax`, detail.tax || 0);
      formData.append(`PoLineItems[${index}].TaxType`, detail.taxType || 0);
      formData.append(`PoLineItems[${index}].Discount`, detail.discount || 0);
      formData.append(
        `PoLineItems[${index}].DiscountType`,
        detail.discountType || 0,
      );
      formData.append(
        `PoLineItems[${index}].ExpectedDeliveryDate`,
        detail.ExpectedDeliveryDate || "",
      );
    });

    documentFiles.forEach((doc, index) => {
      formData.append(`DocumentFiles[${index}].documentType`, doc.documentType);
      if (doc.externalUrl) {
        formData.append(`DocumentFiles[${index}].externalUrl`, doc.externalUrl);
        formData.append(`DocumentFiles[${index}].fileName`, doc.fileName);
      }

      if (doc.documentFile) {
        formData.append(
          `DocumentFiles[${index}].documentFile`,
          doc.documentFile,
        );
      }
    });

    try {
      setLoadingData(true);
      await createPO(formData);
      Alert("PO Created Successfully!", "success");

      // Update requisition status to PoCreated if PO was created from requisition
      if (
        poData.purchaseOrderType === "From Requisition" &&
        poData.requisition?.id
      ) {
        try {
          const requisitionResponse = await fetchRequisitionById(
            poData.requisition.id,
          );
          const requisition = requisitionResponse.requisition;

          await updateRequisition(poData.requisition.id, {
            requestedById: requisition.requestedById,
            requiredByDate: requisition.requiredByDate,
            priority: requisition.priority,
            title: requisition.title,
            projectId: requisition.projectId,
            justification: requisition.justification,
            lineItems: requisition.requisitionLineItems || [],
            approvals: requisition.approvals || [],
            status: "PoCreated",
          });
        } catch (updateError) {
          console.error("Failed to update requisition status:", updateError);
        }
      }
    } catch (error) {
      Alert("Error creating PO.", "error");
      console.error("Error creating PO:", error);
    } finally {
      setLoadingData(false);
      navigate("/procurement/purchaseorders");
    }
  };

  const handleDrawerClose = async () => {
    setPageDrawer(false);

    if (
      drawerType === "address" &&
      drawerEntityType === "vendor" &&
      poData.vendor?.id
    ) {
      try {
        const addresses = await fetchCompanyAddressById(poData.vendor.id);
        setVendorAddresses(Array.isArray(addresses) ? addresses : []);

        if (addresses.length > 0) {
          handleAutocompleteChange("vendorBillingAddress", addresses[0]);
        } else {
          handleAutocompleteChange("vendorBillingAddress", null);
        }
      } catch (error) {
        console.error("Error refreshing vendor addresses:", error);
      }
    } else if (
      drawerType === "contact" &&
      drawerEntityType === "vendor" &&
      poData.vendor?.id
    ) {
      try {
        const contacts = await fetchCompanyContactByVendorId(poData.vendor.id);
        setVendorContacts(Array.isArray(contacts) ? contacts : []);

        if (contacts.length > 0) {
          handleAutocompleteChange("vendorBillingContact", contacts[0]);
        } else {
          handleAutocompleteChange("vendorBillingContact", null);
        }
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
            handleAutocompleteChange(
              "billingAddress",
              updatedOrg?.organizationAddresses[0],
            );
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
            handleAutocompleteChange(
              "shippingAddress",
              updatedOrg?.organizationAddresses[0],
            );
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
      return ` ${poData.vendor?.name || "Vendor"} Address's`;
    } else if (drawerType === "contact" && drawerEntityType === "vendor") {
      return ` ${poData.vendor?.name || "Vendor"} Contact's`;
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle requisitionId query parameter to auto-populate line items
  useEffect(() => {
    const requisitionId = searchParams.get("requisitionId");
    if (requisitionId) {
      const loadRequisitionLineItems = async () => {
        try {
          const response = await fetchRequisitionById(requisitionId);
          const requisitionData = response.requisition;
          const lineItems = requisitionData?.requisitionLineItems || [];

          if (lineItems.length > 0) {
            const poLineItems = lineItems.map((item) => ({
              part: item.part || null,
              orderedQuantity: item.quantity,
              description: item.description || "",
              hsn: "",
              unitPrice: item.unitPrice ?? 0,
              totalPrice: item.totalPrice ?? 0,
              tax: item.tax ?? 0,
              taxType: item.taxType ?? "SGST/CGST",
              discount: item.discount ?? 0,
              discountType: "Percentage",
            }));

            lineItemsRef.current = poLineItems;
            setPoLineItems(poLineItems);

            const matchedRequisition = requisitions.find(
              (r) => r.id === requisitionId,
            );
            if (matchedRequisition) {
              setPoData((prev) => ({
                ...prev,
                requisition: matchedRequisition,
                purchaseOrderType: "From Requisition",
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch requisition line items:", error);
          Alert(
            "Failed to load requisition line items. Please add items manually.",
            "warning",
          );
        }
      };

      loadRequisitionLineItems();
    }
  }, [searchParams, requisitions, Alert]);

  useEffect(() => {
    if (!poData.orderDate) {
      setPoData((prev) => ({ ...prev, orderDate: getTodayDate() }));
    }
  }, [poData.orderDate]);

  useEffect(() => {
    const fetchVendorRelatedData = async () => {
      if (poData.vendor?.id) {
        setVendorDetailsLoading(true);
        try {
          const [addresses, contacts] = await Promise.all([
            fetchCompanyAddressById(poData.vendor.id),
            fetchCompanyContactByVendorId(poData.vendor.id),
          ]);
          setVendorAddresses(Array.isArray(addresses) ? addresses : []);
          handleAutocompleteChange(
            "vendorBillingAddress",
            Array.isArray(addresses) ? addresses[0] : [],
          );
          setVendorContacts(Array.isArray(contacts) ? contacts : []);
          handleAutocompleteChange(
            "vendorBillingContact",
            Array.isArray(contacts) ? contacts[0] : [],
          );
        } catch (error) {
          Alert("Error fetching vendor details.", "error");
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

    fetchVendorRelatedData();
  }, [poData.vendor?.id, Alert]);

  useEffect(() => {
    if (
      poData.paymentTerm?.paymentTerms &&
      poData.poTerms !== poData.paymentTerm.paymentTerms
    ) {
      setPoData((prev) => ({
        ...prev,
        poTerms: poData.paymentTerm.paymentTerms,
      }));
    }
  }, [poData.paymentTerm?.paymentTerms]);

  useEffect(() => {
    if (
      organizations.length > 0 &&
      !selectedBillingOrganization &&
      !selectedShippingOrganization
    ) {
      let defaultOrg = organizations.find((org) =>
        org.name?.toLowerCase().includes("xdlinx"),
      );

      if (defaultOrg) {
        const shippingAddrs = defaultOrg.organizationAddresses;
        const billingAddrs = defaultOrg.organizationAddresses;

        if (shippingAddrs.length > 0) {
          setSelectedShippingOrganization(defaultOrg || null);
          setShippingAddressesData(shippingAddrs);
          setPoData((prev) => ({
            ...prev,
            shippingAddress: shippingAddrs[0],
          }));
        }

        if (billingAddrs.length > 0) {
          setSelectedBillingOrganization(defaultOrg || null);
          setBillingAddressesData(billingAddrs);

          setPoData((prev) => ({
            ...prev,
            billingAddress: billingAddrs[0],
          }));
        }
      }
    }
  }, [
    organizations,
    selectedBillingOrganization,
    selectedShippingOrganization,
  ]);

  return (
    <div className="PODetailsMainDiv">
      <div className="PODetailsPageHeader">
        <h3>Create Purchase Order</h3>
        <div className="PODetailsPageHeaderDetails">
          <button
            className="DimButton"
            onClick={() => {
              navigate("/procurement/purchaseorders");
            }}
          >
            Cancel
          </button>
          <button className="AddOrUpdateButton" onClick={handleCreatePO}>
            Create
          </button>
        </div>
      </div>
      <div className="PageTabs">
        <button
          className={`TabButton ${
            pageTabValue === "overview" ? "Selected" : ""
          }`}
          onClick={() => setPageTabValue("overview")}
        >
          Overview
        </button>
        <button
          className={`TabButton ${
            pageTabValue === "documents" ? "Selected" : ""
          }`}
          onClick={() => setPageTabValue("documents")}
        >
          Documents
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="PODetailsContent">
            {pageTabValue === "overview" &&
              (loadingData ? (
                <div
                  className="LoaderContainer"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                  }}
                >
                  <ClipLoader
                    size={30}
                    color={"#009cbb"}
                    loading={loadingData}
                  />
                </div>
              ) : (
                <div className="PurchaseOrdersDetailsTab">
                  <div className="CreateFlyoutBodyTwoColumns">
                    <Autocomplete
                      options={vendors}
                      getOptionLabel={(option) =>
                        option && (option.vendorCode || option.name)
                          ? `${option.vendorCode || ""} - ${
                              option.name || ""
                            }`.trim()
                          : ""
                      }
                      value={poData.vendor}
                      onChange={(event, newValue) => {
                        handleAutocompleteChange("vendor", newValue);
                        if (newValue?.currencyId) {
                          setPoData((prevPoData) => ({
                            ...prevPoData,
                            currencyId: newValue.currencyId,
                          }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vendor"
                          className="AdminTextFeilds POTextFileds"
                          error={!!formErrors.vendor}
                          helperText={formErrors.vendor}
                          required
                        />
                      )}
                    />
                    <Autocomplete
                      options={paymentTerms}
                      getOptionLabel={(option) => option.name || ""}
                      value={poData.paymentTerm}
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("paymentTerm", newValue)
                      }
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
                    {!poData.vendor && (
                      <div className="VendorSelectHint">
                        <div className="VendorDetailsCardHeader">
                          <PersonIcon fontSize="small" />
                          <strong>Vendor Details</strong>
                        </div>
                      </div>
                    )}
                    {poData.vendor ? (
                      <div className="VendorDetails">
                        {vendorDetailsLoading ? (
                          <ClipLoader
                            size={30}
                            color={"#009cbb"}
                            loading={true}
                          />
                        ) : (
                          <div className="VendorDetailsCard">
                            <div className="VendorDetailsCardHeader">
                              <PersonIcon fontSize="small" />
                              <strong>Vendor Details</strong>
                            </div>
                            <div className="VendorDetailsDiv">
                              {(() => {
                                const billing = poData?.vendorBillingAddress;
                                if (!billing || !billing.address)
                                  return (
                                    <div>
                                      No Address's available for this vendor{" "}
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("address");
                                          setDrawerEntityId(poData.vendor?.id);
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Address <AddIcon fontSize="small" />
                                      </p>
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
                                    {postalCode && <p>{postalCode}.</p>}{" "}
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
                                        setDrawerEntityId(poData.vendor?.id);
                                        setDrawerEntityType("vendor");
                                        setPageDrawer(true);
                                      }}
                                    >
                                      New Address <AddIcon fontSize="small" />
                                    </p>
                                  </div>
                                );
                              })()}
                              <Divider orientation="vertical" flexItem />
                              {(() => {
                                const vendorContact =
                                  poData?.vendorBillingContact;
                                if (!vendorContact || !vendorContact.contact)
                                  return (
                                    <div>
                                      No Contacts available for this vendor{" "}
                                      <p
                                        className="VendorAddressesEditBtn"
                                        onClick={() => {
                                          setDrawerType("contact");
                                          setDrawerEntityId(poData.vendor?.id);
                                          setDrawerEntityType("vendor");
                                          setPageDrawer(true);
                                        }}
                                      >
                                        New Contact <AddIcon fontSize="small" />
                                      </p>
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
                                    <p
                                      className="VendorAddressesEditBtn"
                                      onClick={(e) => {
                                        setAnchorEl(e.currentTarget);
                                        setPopperType("vendorBillingContact");
                                      }}
                                    >
                                      Change Contact{" "}
                                      <EditIcon fontSize="small" />
                                    </p>{" "}
                                    <p
                                      className="VendorAddressesEditBtn"
                                      onClick={() => {
                                        setDrawerType("contact");
                                        setDrawerEntityId(poData.vendor?.id);
                                        setDrawerEntityType("vendor");
                                        setPageDrawer(true);
                                      }}
                                    >
                                      New Contact <AddIcon fontSize="small" />
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                            <h3>
                              GSTIN: {"   "}
                              {poData?.vendor?.taxId}
                            </h3>
                          </div>
                        )}
                      </div>
                    ) : null}{" "}
                    <div className="RightColumnStack">
                      <TextField
                        label="Subject"
                        name="description"
                        value={poData.description || ""}
                        onChange={handleInputChange}
                        className="AdminTextFeilds POTextFileds"
                        multiline
                        rows={4}
                        fullWidth
                      />

                      <Autocomplete
                        options={projects}
                        getOptionLabel={(option) =>
                          option && (option.projectCode || option.name)
                            ? `${option.projectCode || ""} - ${option.name || ""}`.trim()
                            : ""
                        }
                        value={poData.project}
                        onChange={(event, newValue) =>
                          handleAutocompleteChange("project", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Project"
                            className="AdminTextFeilds POTextFileds"
                            error={!!formErrors.project}
                            helperText={formErrors.project}
                            fullWidth
                          />
                        )}
                      />
                    </div>
                    <Autocomplete
                      options={organizations}
                      getOptionLabel={(option) => option.name || ""}
                      value={selectedBillingOrganization}
                      onChange={(event, newValue) => {
                        const billingAddresses =
                          newValue?.organizationAddresses;

                        const defaultBillingAddress =
                          billingAddresses?.length > 0
                            ? billingAddresses[0]
                            : null;

                        setBillingAddressesData(billingAddresses || []);
                        setSelectedBillingOrganization(newValue);
                        handleAutocompleteChange(
                          "billingAddress",
                          defaultBillingAddress,
                        );
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      disableClearable={true}
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
                        const shippingAddresses =
                          newValue?.organizationAddresses;

                        const defaultShippingAddress =
                          shippingAddresses?.length > 0
                            ? shippingAddresses[0]
                            : null;

                        setShippingAddressesData(shippingAddresses || []);
                        setSelectedShippingOrganization(newValue);
                        handleAutocompleteChange(
                          "shippingAddress",
                          defaultShippingAddress,
                        );
                        if (shippingAddresses?.length > 0) {
                          setFormErrors((prev) => ({
                            ...prev,
                            shippingAddress: undefined,
                          }));
                        } else {
                          setFormErrors((prev) => ({
                            ...prev,
                            shippingAddress:
                              "Selected organization has no shipping address attached.",
                          }));
                        }
                      }}
                      disableClearable={true}
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
                        <div
                          key={
                            poData.billingAddress?.addressId ||
                            "no-billing-address"
                          }
                        >
                          {(() => {
                            const billing = poData.billingAddress;
                            if (!billing || !billing.address)
                              return (
                                <div>
                                  No Address's available for this Organization
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
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setPopperType("billing");
                                  }}
                                >
                                  Change Address <EditIcon fontSize="small" />
                                </p>{" "}
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
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}{" "}
                    {selectedShippingOrganization && (
                      <div className="VendorDetailsCard">
                        <div className="VendorDetailsCardHeader">
                          <LocationOnIcon fontSize="small" />
                          <strong>Shipping Address</strong>
                        </div>
                        <div
                          key={
                            poData.shippingAddress?.addressId ||
                            "no-shipping-address"
                          }
                        >
                          {(() => {
                            const shipping = poData.shippingAddress;
                            if (!shipping || !shipping.address)
                              return (
                                <div>
                                  No Address's available for this Organization
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
                                <p
                                  className="VendorAddressesEditBtn"
                                  onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setPopperType("shipping");
                                  }}
                                >
                                  Change Address <EditIcon fontSize="small" />
                                </p>{" "}
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
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}{" "}
                    <TextField
                      label="Order Date"
                      type="date"
                      name="orderDate"
                      value={poData.orderDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      className="AdminTextFeilds POTextFileds"
                      error={!!formErrors.orderDate}
                      helperText={formErrors.orderDate}
                      required
                    />
                    <TextField
                      label="Delivery Date"
                      type="date"
                      name="deliveryDate"
                      value={poData.deliveryDate || ""}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      className={`AdminTextFeilds POTextFileds ${
                        !poData.deliveryDate ? "grey-date-text" : ""
                      }`}
                      error={!!formErrors.deliveryDate}
                      helperText={formErrors.deliveryDate}
                      inputProps={{ min: poData.orderDate }}
                    />
                    <TextField
                      label="Quotation Refrence"
                      name="quotationReference"
                      value={poData.quotationReference}
                      onChange={handleInputChange}
                      className="AdminTextFeilds POTextFileds"
                    />{" "}
                    <TextField
                      label="Shipment Reference"
                      name="shipmentReference"
                      value={poData.shipmentReference}
                      onChange={handleInputChange}
                      className="AdminTextFeilds POTextFileds"
                    />
                    <div className="FullWidthField">
                      <TextField
                        label="Delivery Terms"
                        name="deliveryTerms"
                        value={poData.deliveryTerms || ""}
                        onChange={handleInputChange}
                        className="AdminTextFeilds POTextFileds"
                        multiline
                        rows={3}
                        helperText={formErrors.deliveryTerms}
                        error={!!formErrors.deliveryTerms}
                        required
                      />
                    </div>
                    <div className="FullWidthField">
                      <TextField
                        label="Customer Instructions"
                        name="customerInstructions"
                        value={poData.customerInstructions || ""}
                        onChange={handleInputChange}
                        className="AdminTextFeilds POTextFileds"
                        multiline
                        rows={3}
                      />
                    </div>
                  </div>
                  <Divider orientation="horizontal" flexItem />
                  <LineItems
                    lineItems={poLineItems}
                    setPoLineItems={setPoLineItems}
                    setPoData={setPoData}
                    poData={poData}
                    lineItemsRef={lineItemsRef}
                  />
                  <TextField
                    label="Terms and Conditions"
                    name="poTerms"
                    multiline
                    rows={5}
                    value={poData.poTerms || ""}
                    onChange={handleInputChange}
                    className="AdminTextFeilds POTextFileds"
                  />
                </div>
              ))}

            {pageTabValue === "documents" && (
              <PODocuments
                onDocumentsChange={setDocumentFiles}
                showExistingDocuments={false}
                canUpload={true}
                canDelete={true}
              />
            )}
          </div>
        </>
      )}
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
                  : `${addr?.addressLine1 || ""},${addr?.addressLine2 || ""}, ${
                      addr?.city || ""
                    }, ${addr?.state || ""}, ${addr?.postalCode || ""}`;
              }}
              disableClearable={true}
              value={
                popperType === "billing"
                  ? poData.billingAddress
                  : popperType === "shipping"
                    ? poData.shippingAddress
                    : popperType === "vendorBillingAddress"
                      ? poData.vendorBillingAddress
                      : poData.vendorBillingContact
              }
              onChange={(event, newValue) => {
                if (popperType === "billing") {
                  handleAutocompleteChange("billingAddress", newValue);
                } else if (popperType === "shipping") {
                  handleAutocompleteChange("shippingAddress", newValue);
                } else if (popperType === "vendorBillingAddress") {
                  handleAutocompleteChange("vendorBillingAddress", newValue);
                } else {
                  handleAutocompleteChange("vendorBillingContact", newValue);
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
        onClose={handleDrawerClose}
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
        onClose={handleDrawerClose}
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
        onClose={handleDrawerClose}
        defaultWidth={70}
      >
        <div className="PoAddDetailsDrawerHeaderDiv">
          <p className="PoAddDetailsDrawerHeader">{getDrawerHeaderText()}</p>
          <ion-icon name="close-outline" onClick={handleDrawerClose}></ion-icon>
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

export default NewPurchaseOrder;
