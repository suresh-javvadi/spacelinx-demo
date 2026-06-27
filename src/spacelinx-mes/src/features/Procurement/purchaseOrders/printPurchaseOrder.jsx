import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import tarunSignature from "../../../Assest/Images/signatures/tarun-signature.png";
import sudheerSignature from "../../../Assest/Images/signatures/sudheer-signature.png";
import NotoSansRegular from "../../../Assest/Fonts/NotoSans-Regular.ttf";
import NotoSansBold from "../../../Assest/Fonts/NotoSans-Bold.ttf";
import { formatAmount } from "../../../utils/numberFormatter";

Font.register({
  family: "NotoSans",
  fonts: [
    { src: NotoSansRegular, fontWeight: "normal" },
    { src: NotoSansBold, fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
    fontFamily: "NotoSans",
  },
  boldText: {
    fontSize: 10,
    marginBottom: 3,
    fontWeight: "bold",
    color: "black",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: "black",
    marginBottom: 5,
    fontWeight: "bold",
  },
  headerPoNumber: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    borderRadius: 8,
  },
  addressBlock: {
    width: "30%",
  },
  addressTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  poDetails: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  poDetailsRow: {
    flexDirection: "column",
    width: "50%",
  },
  poDetailsRowInner: {
    flexDirection: "row",
    width: "100%",
  },
  poDetailsLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  poDetailsValue: {
    width: "35%",
    fontSize: 10,
  },
  lineItemsSection: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
  },
  table: {
    display: "table",
    width: "100%",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    width: "100%",
  },
  tableColHeaderFlex: {
    borderStyle: "solid",
    borderColor: "#ddd",
    color: "#fff",
    borderWidth: 1,
    backgroundColor: "#333333",
    padding: 5,
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
    flexGrow: 1,
  },
  tableColFlex: {
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 5,
    fontSize: 8,
    textAlign: "center",
    flexGrow: 1,
  },
  flexSerial: { flex: 0.3 },
  flexHsn: { flex: 0.6 },
  flexItem: { flex: 1.2, textAlign: "left", wordWrap: "break-word" },
  flexDescription: { flex: 1.5, textAlign: "left", wordWrap: "break-word" },
  flexQty: { flex: 0.5 },
  flexUnitPrice: { flex: 0.7 },
  flexTaxType: { flex: 0.7 },
  flexTaxValue: { flex: 0.5 },
  flexTaxAmount: { flex: 0.7 },
  flexAmount: { flex: 0.8 },
  flexDelivery: { flex: 0.8 },
  summarySection: {
    marginBottom: 20,
    width: "40%",
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  summaryLabel: {
    width: "50%",
    fontWeight: "bold",
    fontSize: 10,
  },
  summaryValue: {
    width: "50%",
    textAlign: "right",
    fontSize: 10,
    fontFamily: "NotoSans",
  },
  termsConditions: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbbbbb",
    padding: 10,
    borderRadius: 8,
  },
  termsTitle: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: "bold",
  },
  termsItem: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
    marginLeft: 10,
  },
  approvalsSection: {
    textAlign: "center",
  },
  approvalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  approvalStageColumn: {
    width: "48%",
    marginBottom: 12,
    padding: 8,
  },
  approvalStageTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "black",
  },
  approvalCard: {
    marginBottom: 12,
    minHeight: 92,
    justifyContent: "flex-end",
  },
  approvalSignatureImageWrap: {
    height: 78,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
  },
  approvalSignatureImage: {
    width: 130,
    height: 60,
    objectFit: "contain",
  },
  approvalSignatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
    width: "78%",
    alignSelf: "center",
  },
  approvalText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  signature: {
    marginTop: 30,
    textAlign: "right",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    width: "78%",
    textAlign: "center",
    fontSize: 10,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
});

const PrintPurchaseOrder = ({
  printOptions,
  poData,
  lineItems,
  approvals,
  vendors,
  vendorAddresses,
  vendorContacts,
  shippingAddress,
  selectedShippingOrganization,
  billingAddress,
  selectedBillingOrganization,
  currency,
  standardTermsAndConditions,
}) => {
  const roundAmount = (num) => {
    return formatAmount(num);
  };

  const isPercentageTax = (item) => {
    return (
      item?.taxOperator === "%" ||
      item?.taxType === "Percentage" ||
      (typeof item?.taxType === "string" && item.taxType.includes("%"))
    );
  };

  const isFixedTax = (item) => {
    return item?.taxType === "Fixed";
  };

  const calculateLineAmount = (item) => {
    const qty = parseFloat(item.orderedQuantity || 0);
    const price = parseFloat(item.unitPrice || 0);
    return qty * price;
  };

  const calculateLineTaxAmount = (item) => {
    const base = calculateLineAmount(item);
    let discount = 0;

    if (item.discountType === "Percentage") {
      discount = (base * (item.discount || 0)) / 100;
    } else if (item.discountType === "Fixed") {
      discount = item.discount || 0;
    }

    const afterDiscount = base - discount;
    let taxAmount = 0;

    if (isPercentageTax(item)) {
      taxAmount = (afterDiscount * (item.tax || 0)) / 100;
    } else if (isFixedTax(item)) {
      taxAmount = item.tax || 0;
    }
    return Math.round(taxAmount * 10000) / 10000;
  };

  const getCurrencySymbol = () => {
    if (currency && currency.symbol) {
      return currency.symbol;
    }
    return "₹";
  };
  const currencySymbol = getCurrencySymbol();

  const vendorContact =
    vendorContacts?.find(
      (contact) => contact.contactId === poData.vendorBillingContact,
    ) || vendorContacts?.[0];

  const vendorBillingAddress =
    vendorAddresses?.find(
      (addr) => addr.addressId === poData.vendorBillingAddress,
    ) || vendorAddresses?.[0];

  const subtotal =
    lineItems?.reduce(
      (sum, item) => sum + (item.orderedQuantity || 0) * (item.unitPrice || 0),
      0,
    ) || 0;

  const itemLevelDiscount =
    lineItems?.reduce((sum, item) => {
      const lineTotal = (item.orderedQuantity || 0) * (item.unitPrice || 0);
      if (item.discountType === "Percentage") {
        return sum + (lineTotal * (item.discount || 0)) / 100;
      } else if (item.discountType === "Fixed") {
        return sum + (item.discount || 0);
      }
      return sum;
    }, 0) || 0;

  let totalDiscount = itemLevelDiscount;
  if (poData?.discountType === "Percentage" && poData?.discount) {
    totalDiscount = subtotal * (Number(poData.discount) / 100);
  } else if (poData?.discount) {
    totalDiscount = Number(poData.discount) || 0;
  }

  const totalTaxAmount =
    lineItems?.reduce((sum, item) => {
      return sum + calculateLineTaxAmount(item);
    }, 0) || 0;

  const grandTotal = subtotal - totalDiscount + totalTaxAmount;

  const formatPoDate = (date) => {
    if (date && typeof date === "object" && date.$isDayjsObject) {
      return date.format("DD-MM-YYYY");
    }
    if (date && typeof date === "string") {
      return date;
    }
    if (date instanceof Date) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return "N/A";
  };

  const splitTermsIntoPoints = (text) => {
    if (!text) return [];

    return text
      .split(/(?:^|\s)(?=\d+\.)/)
      .map((point) => point.trim())
      .filter(Boolean);
  };

  const formatApprovalDateTime = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    const dd = String(parsedDate.getDate()).padStart(2, "0");
    const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = parsedDate.getFullYear();
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${dd}-${mm}-${yyyy} ${hours}:${minutes}`;
  };

  const approvedApprovals =
    approvals?.filter((approval) => approval?.status === "Approved") || [];

  const signatureByEmail = {
    "tarun@xdlinx.space": tarunSignature,
    "sudheer@xdlinx.space": sudheerSignature,
  };

  const approvedApprovalsByStage = approvedApprovals.reduce(
    (stageMap, approval) => {
      const stageNumber = approval?.stageNumber || "N/A";

      if (!stageMap[stageNumber]) {
        stageMap[stageNumber] = [];
      }

      stageMap[stageNumber].push(approval);
      return stageMap;
    },
    {},
  );

  const sortedApprovalStages = Object.entries(approvedApprovalsByStage).sort(
    ([stageA], [stageB]) => Number(stageA) - Number(stageB),
  );

  const {
    hsn,
    mfgPartNumber,
    showTaxType,
    showTaxValue,
    showTaxAmount,
    showPartNumber,
  } = printOptions || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 20,
                letterSpacing: 2,
                color: "#4F46E5",
              }}
            >
              SARSPACE
            </Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>PURCHASE ORDER</Text>
            <Text style={styles.headerPoNumber}>
              #{poData?.number || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Bill to</Text>
            <Text style={styles.addressText}>
              <Text style={styles.boldText}>
                {selectedBillingOrganization?.name || "N/A"}
              </Text>
              {"\n"}
              {billingAddress?.address?.addressLine1 || ""}
              {billingAddress?.address?.addressLine2
                ? `\n${billingAddress.address.addressLine2}`
                : ""}
              {"\n"}
              {billingAddress?.address?.city || ""}
              {"\n"}
              {billingAddress?.address?.state || ""}
              {"\n"}
              {billingAddress?.address?.postalCode || ""}
              {"\n"}
              Tax ID: {selectedBillingOrganization?.taxNumber || "N/A"}
            </Text>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Vendor Details</Text>
            <Text style={styles.addressText}>
              <Text style={styles.boldText}>{vendors?.name || "N/A"}</Text>
              {"\n"}
              {vendorContact?.contact && (
                <>
                  Contact:
                  {"\n"}
                  {vendorContact.contact.firstName || ""}{" "}
                  {vendorContact.contact.lastName || ""}
                  {"\n"}
                  {vendorContact.contact.phoneNumber || ""}
                  {"\n"}
                  {vendorContact.contact.email || ""}
                  {"\n"}
                </>
              )}
              Address:
              {"\n"}
              {vendorBillingAddress?.address?.addressLine1 || ""}
              {vendorBillingAddress?.address?.addressLine2
                ? `\n${vendorBillingAddress.address.addressLine2}`
                : ""}
              {"\n"}
              {vendorBillingAddress?.address?.city || ""}
              {"\n"}
              {vendorBillingAddress?.address?.state || ""}
              {"\n"}
              {vendorBillingAddress?.address?.postalCode || ""}
            </Text>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Deliver To</Text>
            <Text style={styles.addressText}>
              <Text style={styles.boldText}>
                {selectedShippingOrganization?.name || "N/A"}
              </Text>
              {"\n"}
              {shippingAddress?.address?.addressLine1 || ""}
              {shippingAddress?.address?.addressLine2
                ? `\n${shippingAddress.address.addressLine2}`
                : ""}
              {"\n"}
              {shippingAddress?.address?.city || ""}
              {"\n"}
              {shippingAddress?.address?.state || ""}
              {"\n"}
              {shippingAddress?.address?.postalCode || ""}
              {"\n"}
              Tax ID: {selectedShippingOrganization?.taxNumber || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.poDetails}>
          <View style={styles.poDetailsRow}>
            <View style={styles.poDetailsRowInner}>
              <Text style={styles.poDetailsLabel}>Date: </Text>
              <Text style={styles.poDetailsValue}>
                {formatPoDate(poData?.orderDate)}
              </Text>
            </View>
            <View style={styles.poDetailsRowInner}>
              <Text style={styles.poDetailsLabel}>Exp. Delivery Date: </Text>
              <Text style={styles.poDetailsValue}>
                {poData?.expectedDeliveryDate || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.poDetailsRow}>
            {poData?.quotationReference && (
              <View style={styles.poDetailsRowInner}>
                <Text style={styles.poDetailsLabel}>Quotation Ref: </Text>
                <Text style={styles.poDetailsValue}>
                  {poData.quotationReference}
                </Text>
              </View>
            )}
            {poData?.shipmentReference && (
              <View style={styles.poDetailsRowInner}>
                <Text style={styles.poDetailsLabel}>Shipment Ref: </Text>
                <Text style={styles.poDetailsValue}>
                  {poData.shipmentReference}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.lineItemsSection}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColHeaderFlex, styles.flexSerial]}>
                Item No.
              </Text>
              <Text style={[styles.tableColHeaderFlex, styles.flexItem]}>
                Item
              </Text>
              <Text style={[styles.tableColHeaderFlex, styles.flexDescription]}>
                Description
              </Text>
              {hsn && (
                <Text style={[styles.tableColHeaderFlex, styles.flexHsn]}>
                  HSN
                </Text>
              )}
              <Text style={[styles.tableColHeaderFlex, styles.flexQty]}>
                Qty
              </Text>
              <Text style={[styles.tableColHeaderFlex, styles.flexUnitPrice]}>
                Unit Price
              </Text>
              {showTaxType && (
                <Text style={[styles.tableColHeaderFlex, styles.flexTaxType]}>
                  Tax Type
                </Text>
              )}
              {showTaxValue && (
                <Text style={[styles.tableColHeaderFlex, styles.flexTaxValue]}>
                  Tax %
                </Text>
              )}
              {showTaxAmount && (
                <Text style={[styles.tableColHeaderFlex, styles.flexTaxAmount]}>
                  Tax Amt
                </Text>
              )}{" "}
              <Text style={[styles.tableColHeaderFlex, styles.flexDelivery]}>
                Exp. Delivery
              </Text>
              <Text style={[styles.tableColHeaderFlex, styles.flexAmount]}>
                Amount
              </Text>
            </View>

            {Array.isArray(lineItems) && lineItems.length > 0 ? (
              lineItems.map((item, index) => {
                const taxAmount = calculateLineTaxAmount(item);
                const isItemPercentageTax = isPercentageTax(item);
                const isItemFixedTax = isFixedTax(item);
                const partNumberStr = showPartNumber
                  ? item?.part?.partNumber || ""
                  : "";
                const nameStr = item?.part?.name
                  ? (partNumberStr ? " - " : "") + item.part.name
                  : "";
                const mfgStr =
                  mfgPartNumber && item?.part?.manufacturingPartNumber
                    ? ` (${item.part.manufacturingPartNumber})`
                    : "";

                const itemDisplay = partNumberStr + nameStr + mfgStr || "NA";

                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableColFlex, styles.flexSerial]}>
                      {(index + 1) * 10}
                    </Text>
                    <Text style={[styles.tableColFlex, styles.flexItem]}>
                      {itemDisplay}
                    </Text>
                    <Text style={[styles.tableColFlex, styles.flexDescription]}>
                      {item?.description || "-"}
                    </Text>
                    {hsn && (
                      <Text style={[styles.tableColFlex, styles.flexHsn]}>
                        {item?.hsn || "N/A"}
                      </Text>
                    )}
                    <Text style={[styles.tableColFlex, styles.flexQty]}>
                      {item?.orderedQuantity || "0"}
                    </Text>
                    <Text style={[styles.tableColFlex, styles.flexUnitPrice]}>
                      {`${currencySymbol} ${roundAmount(item?.unitPrice || 0)}`}
                    </Text>
                    {showTaxType && (
                      <Text style={[styles.tableColFlex, styles.flexTaxType]}>
                        {item?.taxType || "None"}
                      </Text>
                    )}
                    {showTaxValue && (
                      <Text style={[styles.tableColFlex, styles.flexTaxValue]}>
                        {isItemPercentageTax
                          ? `${item.tax || 0}%`
                          : isItemFixedTax
                            ? `${currencySymbol} ${formatAmount(item.tax || 0)}`
                            : "-"}
                      </Text>
                    )}
                    {showTaxAmount && (
                      <Text style={[styles.tableColFlex, styles.flexTaxAmount]}>
                        {`${currencySymbol} ${roundAmount(taxAmount)}`}
                      </Text>
                    )}{" "}
                    <Text style={[styles.tableColFlex, styles.flexDelivery]}>
                      {item?.expectedDeliveryDate || "N/A"}
                    </Text>
                    <Text style={[styles.tableColFlex, styles.flexAmount]}>
                      {`${currencySymbol} ${roundAmount(
                        calculateLineAmount(item),
                      )}`}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableColFlex,
                    { textAlign: "center", flex: 1 },
                  ]}
                >
                  No line items available
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal (Excl. Tax)</Text>
            <Text style={styles.summaryValue}>
              {`${currencySymbol} ${roundAmount(subtotal)}`}
            </Text>
          </View>
          {totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Discount</Text>
              <Text style={styles.summaryValue}>
                {`-${currencySymbol} ${roundAmount(totalDiscount)}`}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tax</Text>
            <Text style={styles.summaryValue}>
              {`${currencySymbol} ${roundAmount(totalTaxAmount)}`}
            </Text>
          </View>
          {poData?.roundOff != null && poData?.roundOff !== 0 && (
            <View style={[styles.summaryRow]}>
              <Text style={[styles.summaryLabel]}>Round off</Text>
              <Text style={[styles.summaryValue]}>
                {`${currencySymbol} ${roundAmount(poData?.roundOff || 0)}`}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, { marginTop: 5 }]}>
            <Text style={[styles.summaryLabel, { fontWeight: "800" }]}>
              Grand Total
            </Text>
            <Text style={[styles.summaryValue, { fontWeight: "800" }]}>
              {`${currencySymbol} ${roundAmount(poData?.totalAmount)}`}
            </Text>
          </View>
        </View>

        <View style={styles.termsConditions}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          {poData?.poTerms ? (
            <Text style={styles.termsItem}>{poData.poTerms}</Text>
          ) : (
            <Text style={styles.termsItem}>
              Standard terms and conditions apply.
            </Text>
          )}
        </View>

        <View style={styles.termsConditions} break>
          <Text style={styles.termsTitle}>Standard Terms & Conditions</Text>

          {standardTermsAndConditions.flatMap((term, i) =>
            splitTermsIntoPoints(term).map((point, index) => (
              <Text key={`${i}-${index}`} style={styles.termsItem}>
                {point}
              </Text>
            )),
          )}
        </View>

        {approvedApprovals.length > 0 && (
          <View style={styles.approvalsSection}>
            <View style={styles.approvalsGrid}>
              {sortedApprovalStages.map(([stageNumber, stageApprovals]) => (
                <View key={stageNumber} style={styles.approvalStageColumn}>
                  {stageApprovals.map((approval, index) => {
                    const approverName = `${
                      approval?.approver?.firstName || ""
                    } ${approval?.approver?.lastName || ""}`.trim();
                    const approverEmail =
                      approval?.approver?.email?.toLowerCase() || "";
                    const signatureImage = signatureByEmail[approverEmail];

                    return (
                      <View
                        key={`${approval?.id || approval?.approverId || index}`}
                        style={styles.approvalCard}
                      >
                        <View style={styles.approvalSignatureImageWrap}>
                          {signatureImage && (
                            <Image
                              src={signatureImage}
                              style={styles.approvalSignatureImage}
                            />
                          )}
                        </View>
                        <View style={styles.approvalSignatureLine}>
                          <Text style={styles.approvalText}>
                            {approverName || "N/A"}
                          </Text>
                          <Text style={styles.approvalText}>
                            {formatApprovalDateTime(approval?.actedAt)}
                          </Text>
                          <Text style={styles.approvalText}>
                            {`Authorized Signature ${stageNumber}`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.signatureRow}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.signatureLine}>Vendor Acknowledgement</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PrintPurchaseOrder;
