import { Quote, Customer, CompanyProfile } from "../types";
import { formatCurrency } from "./utils";
import { formatDate } from "./dateUtils";

// jsPDF is loaded on demand so it stays out of the main bundle.
async function buildQuoteDoc(
  quote: Quote,
  customer: Customer | undefined,
  profile: CompanyProfile
) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFont("helvetica");

  // Header
  doc.setFontSize(24);
  doc.text("QUOTE", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Quote #: ${quote.quoteNumber}`, 14, 30);
  if (quote.title) {
    doc.text(`Title: ${quote.title}`, 14, 35);
    doc.text(`Date: ${formatDate(quote.createdAt)}`, 14, 40);
  } else {
    doc.text(`Date: ${formatDate(quote.createdAt)}`, 14, 35);
  }

  // Company Info (Right aligned)
  doc.setTextColor(0);
  doc.text(profile.name, 140, 20);
  doc.setTextColor(100);
  doc.text(profile.email, 140, 25);
  if (profile.phone) doc.text(profile.phone, 140, 30);
  if (profile.address) {
    const splitAddress = doc.splitTextToSize(profile.address, 60);
    doc.text(splitAddress, 140, 35);
  }

  // Bill To
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text("Bill To:", 14, 50);
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (customer) {
    doc.text(customer.name, 14, 55);
    if (customer.email) doc.text(customer.email, 14, 60);
    if (customer.address) {
      const splitCustomerAddress = doc.splitTextToSize(customer.address, 80);
      doc.text(splitCustomerAddress, 14, 65);
    }
  }

  // Table
  const tableData = quote.items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] }, // blue-500
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  doc.text("Subtotal:", 140, finalY);
  doc.text(formatCurrency(quote.subtotal), 180, finalY, { align: "right" });

  doc.text(`Tax (${quote.taxRate}%):`, 140, finalY + 6);
  doc.text(formatCurrency(quote.taxAmount), 180, finalY + 6, { align: "right" });

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Total:", 140, finalY + 14);
  doc.text(formatCurrency(quote.total), 180, finalY + 14, { align: "right" });

  // Notes & Terms
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (quote.notes) {
    doc.text("Notes:", 14, finalY + 20);
    const splitNotes = doc.splitTextToSize(quote.notes, 100);
    doc.text(splitNotes, 14, finalY + 25);
  }

  if (quote.terms) {
    const termsY = quote.notes ? finalY + 45 : finalY + 20;
    doc.text("Terms & Conditions:", 14, termsY);
    const splitTerms = doc.splitTextToSize(quote.terms, 180);
    doc.text(splitTerms, 14, termsY + 5);
  }

  return doc;
}

export async function generateQuotePDF(
  quote: Quote,
  customer: Customer | undefined,
  profile: CompanyProfile
): Promise<void> {
  const doc = await buildQuoteDoc(quote, customer, profile);
  doc.save(`${quote.quoteNumber}.pdf`);
}

// Opens the device share sheet with the quote PDF attached. On browsers
// without file sharing (e.g. desktop Firefox), downloads the PDF and opens a
// pre-filled email instead so the user can attach it manually.
export async function shareQuotePDF(
  quote: Quote,
  customer: Customer | undefined,
  profile: CompanyProfile
): Promise<"shared" | "emailed"> {
  const doc = await buildQuoteDoc(quote, customer, profile);
  const filename = `${quote.quoteNumber}.pdf`;

  const subject = `Quote ${quote.quoteNumber}${quote.title ? ` — ${quote.title}` : ""} from ${profile.name}`;
  const body =
    `Hi${customer ? ` ${customer.name}` : ""},\n\n` +
    `Please find attached quote ${quote.quoteNumber}` +
    `${quote.title ? ` for ${quote.title}` : ""} totalling ${formatCurrency(quote.total)}.\n\n` +
    `Let me know if you have any questions.\n\n` +
    `${profile.name}`;

  const file = new File([doc.output("blob")], filename, { type: "application/pdf" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    // Throws AbortError if the user dismisses the share sheet.
    await navigator.share({ files: [file], title: subject, text: body });
    return "shared";
  }

  doc.save(filename);
  const mailto =
    `mailto:${encodeURIComponent(customer?.email || "")}` +
    `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return "emailed";
}
