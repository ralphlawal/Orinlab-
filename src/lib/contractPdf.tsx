import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CONTRACT_CLAUSES } from "./contractTerms";

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.5,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#007bff",
    paddingBottom: 14,
    marginBottom: 24,
  },
  companyName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#050505",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 8,
    color: "#666666",
  },
  docTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#050505",
    textAlign: "center",
    marginBottom: 4,
  },
  docDate: {
    fontSize: 9,
    color: "#888888",
    textAlign: "center",
    marginBottom: 28,
  },
  partiesBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 24,
    backgroundColor: "#f9f9f9",
  },
  partiesTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#007bff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  partyRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  partyLabel: {
    fontSize: 9,
    color: "#666666",
    width: 72,
  },
  partyValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    flex: 1,
  },
  section: {
    marginBottom: 14,
  },
  clauseTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#050505",
    marginBottom: 5,
  },
  clauseBody: {
    fontSize: 9.5,
    color: "#333333",
    lineHeight: 1.65,
  },
  sigArea: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 18,
  },
  sigHeader: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#050505",
    marginBottom: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sigRow: {
    flexDirection: "row",
    gap: 32,
  },
  sigBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#111111",
    paddingTop: 8,
  },
  sigName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#050505",
    marginBottom: 3,
  },
  sigMeta: {
    fontSize: 8,
    color: "#888888",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: "#aaaaaa",
  },
});

export type ContractData = {
  artistName: string;
  legalName: string;
  email: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  signatureName: string;
  signedAt: string;
};

export function ContractDocument({ data }: { data: ContractData }) {
  const date = new Date(data.signedAt);
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const ref = `${data.songTitle.substring(0, 16).toUpperCase().replace(/[^A-Z0-9]/g, "-")}-${date.getFullYear()}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerBar} fixed>
          <Text style={s.companyName}>ORINLABÍ</Text>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Digital Music Distribution Agreement</Text>
            <Text style={s.headerLabel}>Ref: {ref}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={s.docTitle}>DIGITAL MUSIC DISTRIBUTION AGREEMENT</Text>
        <Text style={s.docDate}>Effective Date: {dateStr}</Text>

        {/* Parties */}
        <View style={s.partiesBox}>
          <Text style={s.partiesTitle}>PARTIES</Text>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Distributor:</Text>
            <Text style={s.partyValue}>
              OrinlabÍ Records Distribution Ltd ("OrinlabÍ Records" or "Distributor")
            </Text>
          </View>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Artist:</Text>
            <Text style={s.partyValue}>
              {data.legalName} (professionally known as "{data.artistName}")
            </Text>
          </View>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Email:</Text>
            <Text style={s.partyValue}>{data.email}</Text>
          </View>
          <View style={s.partyRow}>
            <Text style={s.partyLabel}>Release:</Text>
            <Text style={s.partyValue}>
              "{data.songTitle}" ({data.releaseType} · {data.genre})
            </Text>
          </View>
        </View>

        {/* Clauses */}
        {CONTRACT_CLAUSES.map((clause) => (
          <View key={clause.number} style={s.section}>
            <Text style={s.clauseTitle}>
              {clause.number}. {clause.title}
            </Text>
            <Text style={s.clauseBody}>{clause.body}</Text>
          </View>
        ))}

        {/* Signature block */}
        <View style={s.sigArea}>
          <Text style={s.sigHeader}>
            By signing below, the parties agree to all terms of this agreement.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigBox}>
              <Text style={s.sigName}>{data.signatureName}</Text>
              <Text style={s.sigMeta}>Artist — Electronic Signature</Text>
              <Text style={s.sigMeta}>Legal Name: {data.legalName}</Text>
              <Text style={s.sigMeta}>Date: {dateStr}</Text>
            </View>
            <View style={s.sigBox}>
              <Text style={s.sigName}>OrinlabÍ Records Distribution Ltd</Text>
              <Text style={s.sigMeta}>Distributor — Authorised Representative</Text>
              <Text style={s.sigMeta}>Date: {dateStr}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            OrinlabÍ Records Distribution Ltd · orinlabi.com · info@orinlabi.com
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
