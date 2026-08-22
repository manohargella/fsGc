"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import type { AllSemesterGrades } from "@/types";
import { getGradeLetter, semesterSubjects } from "@/lib/gpa";

interface ReportCardGeneratorProps {
  semestersData: AllSemesterGrades;
  user: any;
}

interface SemesterReport {
  semester: string;
  subjects: Array<{
    name: string;
    credit: number;
    gradePoint: string;
    letterGrade: string;
  }>;
  sgpa: number;
  cgpa: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
  color: string;
}

const GRADE_COLORS = {
  O: '#059669',
  'A+': '#10B981',
  A: '#34D399',
  'B+': '#3B82F6',
  B: '#60A5FA',
  C: '#FBBF24',
  P: '#F59E0B',
  F: '#DC2626',
};

const GRADE_ORDER = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];

export default function ReportCardGenerator({ semestersData, user }: ReportCardGeneratorProps) {
  const [selectedSemesters, setSelectedSemesters] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const availableSemesters = useMemo(() => {
    return Object.keys(semestersData).sort((a, b) => parseInt(a) - parseInt(b));
  }, [semestersData]);

  const reportData = useMemo((): SemesterReport[] => {
    if (!semesterSubjects) return [];
    
    const semesters = selectedSemesters === "all" 
      ? availableSemesters 
      : availableSemesters.slice(0, parseInt(selectedSemesters));
    
    const reports: SemesterReport[] = [];
    let cumulativeTotalScore = 0;
    let cumulativeTotalCredits = 0;

    semesters.forEach(semKey => {
      const grades = semestersData[semKey];
      const subjects = semesterSubjects[semKey];
      
      if (grades && grades.grades && grades.grades.length > 0 && subjects) {
        const semesterSubjects: Array<{
          name: string;
          credit: number;
          gradePoint: string;
          letterGrade: string;
        }> = [];

        let semesterTotalScore = 0;
        let semesterTotalCredits = 0;

        subjects.forEach((subject, index) => {
          const grade = grades.grades[index];
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint)) {
              semesterTotalScore += gradePoint * subject.credit;
              semesterTotalCredits += subject.credit;
              cumulativeTotalScore += gradePoint * subject.credit;
              cumulativeTotalCredits += subject.credit;

              semesterSubjects.push({
                name: grades.customSubjects && grades.customSubjects[index] ? grades.customSubjects[index] : subject.name,
                credit: subject.credit,
                gradePoint: gradePoint.toFixed(2),
                letterGrade: getGradeLetter(gradePoint)
              });
            }
          }
        });

        const sgpa = semesterTotalScore > 0 ? semesterTotalScore / semesterTotalCredits : 0;
        const cgpa = cumulativeTotalCredits > 0 ? cumulativeTotalScore / cumulativeTotalCredits : 0;

        reports.push({
          semester: `Semester ${semKey}`,
          subjects: semesterSubjects,
          sgpa: Number(sgpa.toFixed(2)),
          cgpa: Number(cgpa.toFixed(2))
        });
      }
    });

    return reports;
  }, [semestersData, selectedSemesters, availableSemesters]);

  const gradeDistribution = useMemo((): GradeDistribution[] => {
    const gradeCounts: Record<string, number> = {};
    let totalGrades = 0;

    reportData.forEach(semester => {
      semester.subjects.forEach(subject => {
        if (subject.letterGrade) {
          gradeCounts[subject.letterGrade] = (gradeCounts[subject.letterGrade] || 0) + 1;
          totalGrades++;
        }
      });
    });

    return Object.entries(gradeCounts)
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: totalGrades > 0 ? (count / totalGrades) * 100 : 0,
        color: GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6B7280'
      }))
      .sort((a, b) => {
        return GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
      });
  }, [reportData]);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const footerReserve = 18;
      const headerHeight = 24;

      const navy = { r: 15, g: 39, b: 68 };
      const gold = { r: 184, g: 148, b: 79 };
      const slate = { r: 71, g: 85, b: 105 };
      const muted = { r: 148, g: 163, b: 184 };
      const light = { r: 248, g: 250, b: 252 };
      const rowAlt = { r: 241, g: 245, b: 249 };
      const line = { r: 226, g: 232, b: 240 };

      const studentName = user?.displayName || "Student";
      const studentEmail = user?.email || "N/A";
      const reportDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const period =
        selectedSemesters === "all"
          ? "All Semesters"
          : `First ${selectedSemesters} Semester${selectedSemesters === "1" ? "" : "s"}`;
      const currentCgpa = reportData[reportData.length - 1]?.cgpa.toFixed(2) || "0.00";
      const totalSubjects = reportData.reduce((sum, sem) => sum + sem.subjects.length, 0);
      const oaCount = gradeDistribution
        .filter((g) => ["O", "A+", "A"].includes(g.grade))
        .reduce((sum, g) => sum + g.count, 0);

      const hexToRgb = (hex: string) => {
        const value = hex.replace("#", "");
        return {
          r: parseInt(value.slice(0, 2), 16),
          g: parseInt(value.slice(2, 4), 16),
          b: parseInt(value.slice(4, 6), 16),
        };
      };

      const formatGradePoint = (value: string) => {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) return value;
        return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
      };

      const drawHeader = (isCover: boolean) => {
        const barHeight = isCover ? 40 : 22;
        pdf.setFillColor(navy.r, navy.g, navy.b);
        pdf.rect(0, 0, pageWidth, barHeight, "F");
        pdf.setFillColor(gold.r, gold.g, gold.b);
        pdf.rect(0, barHeight, pageWidth, 1.4, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(gold.r, gold.g, gold.b);
        pdf.text("MANOHAR LABS", margin, isCover ? 13 : 9);

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(isCover ? 20 : 11);
        pdf.text("Academic Transcript", margin, isCover ? 24 : 16);

        if (isCover) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(203, 213, 225);
          pdf.text("Official grade report", margin, 32);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(203, 213, 225);
          pdf.text(studentName, pageWidth - margin, 10, { align: "right" });
          pdf.text(`CGPA  ${currentCgpa}`, pageWidth - margin, 16, { align: "right" });
        }
      };

      const drawFooter = (pageNum: number, totalPages: number) => {
        pdf.setFillColor(navy.r, navy.g, navy.b);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(203, 213, 225);
        pdf.text("Confidential academic record  ·  Generated by Manohar Labs", margin, pageHeight - 5);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      };

      const startContentPage = () => {
        pdf.addPage();
        drawHeader(false);
        return headerHeight + 8;
      };

      const colWidths = [
        contentWidth * 0.54,
        contentWidth * 0.14,
        contentWidth * 0.16,
        contentWidth * 0.16,
      ];

      const measureSemesterBlock = (semester: SemesterReport) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const nameWidth = colWidths[0] - 8;
        const rowHeights = semester.subjects.map((subject) => {
          const lines = pdf.splitTextToSize(subject.name, nameWidth);
          return Math.max(8, lines.length * 4.2 + 4);
        });
        const tableHeight = 9 + rowHeights.reduce((sum, h) => sum + h, 0);
        return 10 + 8 + tableHeight + 14;
      };

      const drawSemesterBlock = (semester: SemesterReport, startY: number) => {
        let y = startY;

        pdf.setFillColor(navy.r, navy.g, navy.b);
        pdf.rect(margin, y, contentWidth, 9, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.text(semester.semester.toUpperCase(), margin + 4, y + 6.2);
        y += 9;

        const headers = ["Subject", "Credits", "Grade Point", "Letter"];
        pdf.setFillColor(rowAlt.r, rowAlt.g, rowAlt.b);
        pdf.rect(margin, y, contentWidth, 8, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(slate.r, slate.g, slate.b);
        let x = margin;
        headers.forEach((header, i) => {
          const align = i === 0 ? "left" : "center";
          const tx = i === 0 ? x + 3 : x + colWidths[i] / 2;
          pdf.text(header, tx, y + 5.4, { align });
          x += colWidths[i];
        });
        y += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        semester.subjects.forEach((subject, index) => {
          const nameWidth = colWidths[0] - 8;
          const lines = pdf.splitTextToSize(subject.name, nameWidth);
          const rowH = Math.max(8, lines.length * 4.2 + 4);

          if (index % 2 === 1) {
            pdf.setFillColor(light.r, light.g, light.b);
            pdf.rect(margin, y, contentWidth, rowH, "F");
          }

          pdf.setDrawColor(line.r, line.g, line.b);
          pdf.setLineWidth(0.2);
          pdf.line(margin, y + rowH, margin + contentWidth, y + rowH);

          const textY = y + rowH / 2 + 1.2;
          pdf.setTextColor(30, 41, 59);
          pdf.text(lines, margin + 3, y + 5.2);

          const cells = [
            String(subject.credit),
            formatGradePoint(subject.gradePoint),
            subject.letterGrade,
          ];
          x = margin + colWidths[0];
          cells.forEach((cell, i) => {
            if (i === 2) pdf.setFont("helvetica", "bold");
            else pdf.setFont("helvetica", "normal");
            pdf.text(cell, x + colWidths[i + 1] / 2, textY, { align: "center" });
            x += colWidths[i + 1];
          });
          y += rowH;
        });

        pdf.setFillColor(navy.r, navy.g, navy.b);
        pdf.rect(margin, y, contentWidth, 10, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`SGPA    ${semester.sgpa.toFixed(2)}`, margin + 4, y + 6.5);
        pdf.setTextColor(gold.r, gold.g, gold.b);
        pdf.text(`CGPA    ${semester.cgpa.toFixed(2)}`, pageWidth - margin - 4, y + 6.5, { align: "right" });

        return y + 16;
      };

      // Cover / summary page
      drawHeader(true);
      let y = 50;

      pdf.setFillColor(light.r, light.g, light.b);
      pdf.rect(margin, y, contentWidth, 26, "F");
      pdf.setDrawColor(line.r, line.g, line.b);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, y, contentWidth, 26);

      const info = [
        ["Student", studentName],
        ["Email", studentEmail],
        ["Issued", reportDate],
        ["Period", period],
      ];
      info.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ix = margin + 6 + col * (contentWidth / 2);
        const iy = y + 8 + row * 11;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(muted.r, muted.g, muted.b);
        pdf.text(item[0].toUpperCase(), ix, iy);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(navy.r, navy.g, navy.b);
        pdf.text(item[1], ix, iy + 5);
      });
      y += 34;

      const stats = [
        { label: "Semesters", value: String(reportData.length) },
        { label: "Subjects", value: String(totalSubjects) },
        { label: "CGPA", value: currentCgpa },
        { label: "O / A Grades", value: String(oaCount) },
      ];
      const gap = 4;
      const boxW = (contentWidth - gap * 3) / 4;
      stats.forEach((stat, i) => {
        const bx = margin + i * (boxW + gap);
        pdf.setFillColor(navy.r, navy.g, navy.b);
        pdf.rect(bx, y, boxW, 22, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(stat.value, bx + boxW / 2, y + 10, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(gold.r, gold.g, gold.b);
        pdf.text(stat.label.toUpperCase(), bx + boxW / 2, y + 17, { align: "center" });
      });
      y += 30;

      const chartH = 62;
      const chartGap = 6;
      const chartW = (contentWidth - chartGap) / 2;

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(line.r, line.g, line.b);
      pdf.rect(margin, y, chartW, chartH);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(navy.r, navy.g, navy.b);
      pdf.text("CGPA TREND", margin + 5, y + 7);

      const plotX = margin + 10;
      const plotY = y + 12;
      const plotW = chartW - 18;
      const plotH = 40;
      pdf.setDrawColor(line.r, line.g, line.b);
      pdf.line(plotX, plotY + plotH, plotX + plotW, plotY + plotH);
      pdf.line(plotX, plotY, plotX, plotY + plotH);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text("10", plotX - 1, plotY + 2, { align: "right" });
      pdf.text("0", plotX - 1, plotY + plotH, { align: "right" });

      if (reportData.length > 0) {
        const points = reportData.map((sem, index) => {
          const px = plotX + (reportData.length === 1 ? plotW / 2 : (index / (reportData.length - 1)) * plotW);
          const py = plotY + plotH - (sem.cgpa / 10) * plotH;
          return { px, py, label: sem.semester.replace("Semester ", "S") };
        });
        pdf.setDrawColor(navy.r, navy.g, navy.b);
        pdf.setLineWidth(0.7);
        points.forEach((point, index) => {
          if (index > 0) {
            pdf.line(points[index - 1].px, points[index - 1].py, point.px, point.py);
          }
        });
        points.forEach((point) => {
          pdf.setFillColor(gold.r, gold.g, gold.b);
          pdf.circle(point.px, point.py, 1.1, "F");
          pdf.setFontSize(6);
          pdf.setTextColor(slate.r, slate.g, slate.b);
          pdf.text(point.label, point.px, plotY + plotH + 4, { align: "center" });
        });
      }

      const distX = margin + chartW + chartGap;
      pdf.setDrawColor(line.r, line.g, line.b);
      pdf.setLineWidth(0.3);
      pdf.rect(distX, y, chartW, chartH);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(navy.r, navy.g, navy.b);
      pdf.text("GRADE MIX", distX + 5, y + 7);

      const maxCount = Math.max(...gradeDistribution.map((g) => g.count), 1);
      const barAreaH = 48;
      const barH = Math.min(6, barAreaH / Math.max(gradeDistribution.length, 1) - 1.2);
      gradeDistribution.forEach((grade, index) => {
        const by = y + 12 + index * (barH + 1.4);
        const color = hexToRgb(grade.color);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(navy.r, navy.g, navy.b);
        pdf.text(grade.grade, distX + 5, by + barH - 1.2);
        const barX = distX + 16;
        const barMax = chartW - 42;
        const barW = Math.max(2, (grade.count / maxCount) * barMax);
        pdf.setFillColor(rowAlt.r, rowAlt.g, rowAlt.b);
        pdf.rect(barX, by, barMax, barH - 0.6, "F");
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.rect(barX, by, barW, barH - 0.6, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(slate.r, slate.g, slate.b);
        pdf.text(`${grade.count}  (${grade.percentage.toFixed(0)}%)`, distX + chartW - 5, by + barH - 1.2, {
          align: "right",
        });
      });

      y += chartH + 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(muted.r, muted.g, muted.b);
      pdf.text("Grading scale:  10–O   9–A+   8–A   7–B+   6–B   5–C   4–P   below 4–F", margin, y);

      // Semester tables — never split a table across pages
      y = startContentPage();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(navy.r, navy.g, navy.b);
      pdf.text("Semester Grade Records", margin, y);
      pdf.setFillColor(gold.r, gold.g, gold.b);
      pdf.rect(margin, y + 2.5, 36, 0.7, "F");
      y += 10;

      reportData.forEach((semester) => {
        const needed = measureSemesterBlock(semester);
        if (y + needed > pageHeight - footerReserve) {
          y = startContentPage();
        }
        y = drawSemesterBlock(semester, y);
      });

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        drawFooter(i, totalPages);
      }

      const fileName = `Academic_Transcript_${studentName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (availableSemesters.length === 0) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Report Card Generator</CardTitle>
          <CardDescription className="text-muted-foreground">
            Generate a professional PDF report card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No grades available for report generation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Report Card Generator</CardTitle>
        <CardDescription className="text-muted-foreground">
          Generate a professional PDF report card with Manohar Labs branding and performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Include Semesters:</label>
          <Select value={selectedSemesters} onValueChange={setSelectedSemesters}>
            <SelectTrigger>
              <SelectValue placeholder="Select semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters ({availableSemesters.length})</SelectItem>
              {availableSemesters.map((sem, index) => (
                <SelectItem key={sem} value={(index + 1).toString()}>
                  First {index + 1} Semester{index > 0 ? 's' : ''} ({sem})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Report Summary:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Semesters:</span>
              <span className="ml-2 font-medium text-foreground">
                {selectedSemesters === "all" ? availableSemesters.length : selectedSemesters}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Subjects:</span>
              <span className="ml-2 font-medium text-foreground">
                {reportData.reduce((sum, sem) => sum + sem.subjects.length, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Report Features:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• GPA Trend Analysis Chart</div>
            <div>• Grade Distribution Pie Chart</div>
            <div>• Performance Summary Statistics</div>
            <div>• Detailed Semester Breakdown</div>
            <div>• Professional Manohar Labs Branding</div>
          </div>
        </div>

        <Button 
          onClick={generatePDF} 
          disabled={isGenerating || reportData.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Professional Report Card
            </>
          )}
        </Button>

        {reportData.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Enhanced report will include {reportData.length} semester{reportData.length > 1 ? 's' : ''} with visual analysis charts
          </div>
        )}
      </CardContent>
    </Card>
  );
} 