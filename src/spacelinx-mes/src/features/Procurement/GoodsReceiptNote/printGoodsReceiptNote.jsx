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
import logo from "../../../Assest/Images/logos/xdlinxlogolightmode.png";
import NotoSansRegular from "../../../Assest/Fonts/NotoSans-Regular.ttf";
import NotoSansBold from "../../../Assest/Fonts/NotoSans-Bold.ttf";

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
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  headerGrnNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
    marginTop: 4,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
  },
  metaColumn: {
    flexDirection: "column",
    width: "48%",
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  metaLabel: {
    fontWeight: "bold",
    fontSize: 10,
    width: "45%",
  },
  metaValue: {
    fontSize: 10,
    width: "55%",
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: "row",
    width: "100%",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#333333",
    color: "#fff",
    padding: 5,
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
  },
  tableCol: {
    borderStyle: "solid",
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 5,
    fontSize: 8,
    textAlign: "center",
  },
  flexPartNo: { flex: 1.1 },
  flexMfgPartNo: { flex: 1.6, wordBreak: "break-all" },
  flexDescription: { flex: 1.6, textAlign: "left" },
  flexTrackingId: { flex: 0.8 },
  flexOrderQty: { flex: 0.7 },
  flexReceivedQty: { flex: 0.8 },
  flexHsn: { flex: 0.7 },
  flexStatus: { flex: 0.7 },
  authSection: {
    marginTop: 40,
    flexDirection: "column",
  },
  authTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 24,
    color: "black",
  },
  authGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  authColumn: {
    width: "45%",
    flexDirection: "column",
    marginBottom: 32,
  },
  authRole: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 16,
  },
  authRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  authLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  authLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    flex: 1,
  },
  remarksSection: {
    marginTop: 30,
    flexDirection: "column",
  },
  remarksTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  remarksBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    minHeight: 60,
    padding: 8,
  },
  remarksText: {
    fontSize: 10,
    color: "#333",
    lineHeight: 1.5,
  },
});

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const PrintGoodsReceiptNote = ({ grnData, lineItems, poApprovals = [] }) => {
  const poApprovedPersons = [...poApprovals]
    .filter((a) => a.status === "Approved")
    .sort((a, b) => (a.stageNumber || 0) - (b.stageNumber || 0));

  const preparedByName = grnData?.receivedByFullName || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Image src={logo} style={{ height: 40 }} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.headerTitle}>GOODS RECEIPT NOTE</Text>
            <Text style={styles.headerGrnNumber}>
              #{grnData?.grnNumber || "N/A"}
            </Text>
          </View>
        </View>

        {/* Meta details — two columns */}
        <View style={styles.metaSection}>
          {/* Left column */}
          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>
                {formatDate(grnData?.createdAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Date:</Text>
              <Text style={styles.metaValue}>
                {formatDate(grnData?.invoiceDate)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>PO Date:</Text>
              <Text style={styles.metaValue}>
                {formatDate(grnData?.orderDate)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Supplier Name:</Text>
              <Text style={styles.metaValue}>
                {grnData?.companyName || grnData?.vendorName || "N/A"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Material Received Date:</Text>
              <Text style={styles.metaValue}>
                {formatDate(grnData?.receivedDate)}
              </Text>
            </View>
          </View>

          {/* Right column */}
          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>GRN NO:</Text>
              <Text style={styles.metaValue}>
                {grnData?.grnNumber || "N/A"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice NO:</Text>
              <Text style={styles.metaValue}>
                {grnData?.invoiceNumber || "N/A"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>PO NO:</Text>
              <Text style={styles.metaValue}>{grnData?.poNumber || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.flexPartNo]}>
              XDLinx Part NO
            </Text>
            <Text style={[styles.tableColHeader, styles.flexMfgPartNo]}>
              Manufacturing Part No
            </Text>
            <Text style={[styles.tableColHeader, styles.flexDescription]}>
              Description
            </Text>
            <Text style={[styles.tableColHeader, styles.flexTrackingId]}>
              Tracking ID
            </Text>
            <Text style={[styles.tableColHeader, styles.flexOrderQty]}>
              {"Order Qty\nOR\nPO Qty"}
            </Text>
            <Text style={[styles.tableColHeader, styles.flexReceivedQty]}>
              Received Quantity
            </Text>
            <Text style={[styles.tableColHeader, styles.flexHsn]}>
              HSN Code
            </Text>
            <Text style={[styles.tableColHeader, styles.flexStatus]}>
              Status
            </Text>
          </View>

          {/* Table rows */}
          {Array.isArray(lineItems) && lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCol, styles.flexPartNo]}>
                  {item?.part?.partNumber || item?.partNumber || "N/A"}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    styles.flexMfgPartNo,
                    { wordBreak: "break-all" },
                  ]}
                >
                  {item?.part?.manufacturingPartNumber || "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.flexDescription]}>
                  {item?.part?.name || item?.description || "-"}
                </Text>
                <Text style={[styles.tableCol, styles.flexTrackingId]}>
                  {item?.trackingId || "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.flexOrderQty]}>
                  {item?.orderedQuantity ?? "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.flexReceivedQty]}>
                  {item?.receivedQuantity ?? "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.flexHsn]}>
                  {item?.hsnCode || item?.part?.hsnCode || "N/A"}
                </Text>
                <Text style={[styles.tableCol, styles.flexStatus]}>
                  {item?.qcStatus || "N/A"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 1, textAlign: "center" }]}>
                No line items available
              </Text>
            </View>
          )}
        </View>
        {/* Authorization section */}
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Authorization</Text>
          <View style={styles.authGrid}>
            {/* Prepared By (Stores) — GRN created by */}
            <View style={styles.authColumn}>
              <Text style={styles.authRole}>Prepared By (Stores)</Text>
              <View style={styles.authRow}>
                <Text style={styles.authLabel}>Name:</Text>
                <View style={[styles.authLine, { position: "relative" }]}>
                  {preparedByName ? (
                    <Text
                      style={{
                        fontSize: 9,
                        position: "absolute",
                        bottom: 2,
                        left: 2,
                      }}
                    >
                      {preparedByName}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.authRow}>
                <Text style={styles.authLabel}>Signature:</Text>
                <View style={styles.authLine} />
              </View>
              <View style={styles.authRow}>
                <Text style={styles.authLabel}>Date:</Text>
                <View style={[styles.authLine, { position: "relative" }]}>
                  {grnData?.createdAt ? (
                    <Text
                      style={{
                        fontSize: 9,
                        position: "absolute",
                        bottom: 2,
                        left: 2,
                      }}
                    >
                      {formatDate(grnData.createdAt)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Checked By (Quality) — blank */}
            <View style={styles.authColumn}>
              <Text style={styles.authRole}>Checked By (Quality)</Text>
              {["Name", "Signature", "Date"].map((field) => (
                <View key={field} style={styles.authRow}>
                  <Text style={styles.authLabel}>{field}:</Text>
                  <View style={styles.authLine} />
                </View>
              ))}
            </View>

            {/* Approved By — PO approved persons */}
            <View style={styles.authColumn}>
              <Text style={styles.authRole}>Approved By</Text>
              {poApprovedPersons.length > 0
                ? poApprovedPersons.map((approval, idx) => {
                    const name =
                      `${approval.approver?.firstName || ""} ${approval.approver?.lastName || ""}`.trim();
                    const date = approval.actedAt
                      ? formatDate(approval.actedAt)
                      : "";
                    return (
                      <View
                        key={idx}
                        style={{
                          marginBottom:
                            idx < poApprovedPersons.length - 1 ? 8 : 0,
                        }}
                      >
                        <View style={styles.authRow}>
                          <Text style={styles.authLabel}>Name:</Text>
                          <View
                            style={[styles.authLine, { position: "relative" }]}
                          >
                            {name ? (
                              <Text
                                style={{
                                  fontSize: 9,
                                  position: "absolute",
                                  bottom: 2,
                                  left: 2,
                                }}
                              >
                                {name}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <View style={styles.authRow}>
                          <Text style={styles.authLabel}>Signature:</Text>
                          <View style={styles.authLine} />
                        </View>
                        <View style={styles.authRow}>
                          <Text style={styles.authLabel}>Date:</Text>
                          <View
                            style={[styles.authLine, { position: "relative" }]}
                          >
                            {date ? (
                              <Text
                                style={{
                                  fontSize: 9,
                                  position: "absolute",
                                  bottom: 2,
                                  left: 2,
                                }}
                              >
                                {date}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    );
                  })
                : ["Name", "Signature", "Date"].map((field) => (
                    <View key={field} style={styles.authRow}>
                      <Text style={styles.authLabel}>{field}:</Text>
                      <View style={styles.authLine} />
                    </View>
                  ))}
            </View>
          </View>
        </View>
        {/* Remarks section */}
        <View style={styles.remarksSection} wrap={false}>
          <Text style={styles.remarksTitle}>
            Remarks(Excess/Shortage/Damage)
          </Text>
          <View style={styles.remarksBox}>
            <Text style={styles.remarksText}>{grnData?.description || ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PrintGoodsReceiptNote;
