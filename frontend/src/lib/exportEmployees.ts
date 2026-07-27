import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { EmployeeListItem } from "@/hooks/employee/useEmployees";

const statusLabel = (s: string) =>
  s === "ON_NOTICE" ? "On Notice" : s.charAt(0) + s.slice(1).toLowerCase();

const COLUMNS = ["Employee Code", "Full Name", "Email", "Phone", "Department", "Designation", "Joined", "BPV Score", "Status"];

const toRow = (e: EmployeeListItem) => [
  e.employeeCode,
  e.fullName,
  e.email,
  e.phone ?? "—",
  e.department.name,
  e.designation.title,
  new Date(e.dateOfJoining).toISOString().split("T")[0],
  e.latestBpvScore != null ? e.latestBpvScore.toFixed(1) : "—",
  statusLabel(e.status),
];

export function exportEmployeesToExcel(employees: EmployeeListItem[], filename = "employees") {
  const rows = employees.map(toRow);
  const sheet = XLSX.utils.aoa_to_sheet([COLUMNS, ...rows]);
  sheet["!cols"] = COLUMNS.map((_, i) => ({ wch: i === 1 ? 22 : i === 2 ? 26 : 16 }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Employees");
  XLSX.writeFile(book, `${filename}.xlsx`);
}

export function exportEmployeesToPdf(employees: EmployeeListItem[], filename = "employees") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.setTextColor(234, 90, 16); // primary-600
  doc.text("Employees", 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · ${employees.length} records`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [COLUMNS],
    body: employees.map(toRow),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [234, 90, 16], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [255, 247, 237] },
  });

  doc.save(`${filename}.pdf`);
}
