import { jsPDF } from "jspdf";

interface CertificateData {
  userName: string;
  courseTitle: string;
}

export const generateCertificate = ({ userName, courseTitle }: CertificateData) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Design Elements ---
  
  // 1. Double Border
  doc.setDrawColor(37, 99, 235); // Blue border
  doc.setLineWidth(1.5);
  doc.rect(5, 5, 287, 200); 
  
  doc.setDrawColor(0); // Black inner border
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 277, 190);

  // 2. Main Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(45);
  doc.setTextColor(30, 41, 59); // Slate-900
  doc.text("CERTIFICATE", 148.5, 45, { align: "center" });
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("OF COMPLETION", 148.5, 55, { align: "center", charSpace: 2 });

  // 3. Decorative Line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(80, 65, 217, 65);

  // 4. Recipient Text
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text("PROUDLY PRESENTED TO", 148.5, 80, { align: "center" });

  // 5. User Name
  doc.setFont("times", "bolditalic");
  doc.setFontSize(42);
  doc.setTextColor(37, 99, 235); // Brand Blue
  doc.text(userName, 148.5, 105, { align: "center" });

  // 6. Course Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text("For successfully completing all requirements of the course", 148.5, 125, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59);
  doc.text(courseTitle, 148.5, 140, { align: "center" });

  // 7. Footer (Date and Authority)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  // Date Side
  doc.text("DATE", 60, 175, { align: "center" });
  doc.line(35, 170, 85, 170);
  doc.text(date, 60, 165, { align: "center" });

  // Signature Side
  doc.text("DIRECTOR", 237, 175, { align: "center" });
  doc.line(212, 170, 262, 170);
  doc.setFont("times", "italic");
  doc.text("Learning Admin", 237, 165, { align: "center" });

  // 8. Final Download
  const fileName = `${courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`;
  doc.save(fileName);
};