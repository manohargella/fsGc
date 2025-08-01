"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { AllSemesterGrades } from "@/types";
import { semesterSubjects } from "@/lib/gpa";

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
  'A+': '#10B981',
  'A': '#34D399',
  'A-': '#6EE7B7',
  'B+': '#3B82F6',
  'B': '#60A5FA',
  'B-': '#93C5FD',
  'C+': '#F59E0B',
  'C': '#FBBF24',
  'C-': '#FCD34D',
  'D+': '#EF4444',
  'D': '#F87171',
  'D-': '#FCA5A5',
  'F': '#DC2626',
};

const getLetterGrade = (gradePoint: number): string => {
  if (gradePoint >= 9.5) return 'A+';
  if (gradePoint >= 9.0) return 'A';
  if (gradePoint >= 8.5) return 'A-';
  if (gradePoint >= 8.0) return 'B+';
  if (gradePoint >= 7.5) return 'B';
  if (gradePoint >= 7.0) return 'B-';
  if (gradePoint >= 6.5) return 'C+';
  if (gradePoint >= 6.0) return 'C';
  if (gradePoint >= 5.5) return 'C-';
  if (gradePoint >= 5.0) return 'D+';
  if (gradePoint >= 4.5) return 'D';
  if (gradePoint >= 4.0) return 'D-';
  return 'F';
};

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
      
      if (grades && grades.length > 0 && subjects) {
        const semesterSubjects: Array<{
          name: string;
          credit: number;
          gradePoint: string;
          letterGrade: string;
        }> = [];

        let semesterTotalScore = 0;
        let semesterTotalCredits = 0;

        subjects.forEach((subject, index) => {
          const grade = grades[index];
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint)) {
              semesterTotalScore += gradePoint * subject.credit;
              semesterTotalCredits += subject.credit;
              cumulativeTotalScore += gradePoint * subject.credit;
              cumulativeTotalCredits += subject.credit;

              semesterSubjects.push({
                name: subject.name,
                credit: subject.credit,
                gradePoint: gradePoint.toFixed(2),
                letterGrade: getLetterGrade(gradePoint)
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
        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      });
  }, [reportData]);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary div for the report card
      const reportCardDiv = document.createElement('div');
      reportCardDiv.style.position = 'absolute';
      reportCardDiv.style.left = '-9999px';
      reportCardDiv.style.top = '0';
      reportCardDiv.style.width = '800px';
      reportCardDiv.style.backgroundColor = 'white';
      reportCardDiv.style.padding = '40px';
      reportCardDiv.style.fontFamily = 'Arial, sans-serif';
      reportCardDiv.style.color = 'black';
      
      // Generate the HTML content with charts
      reportCardDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">
            Manohar Labs
          </div>
          <div style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">
            Academic Excellence Report
          </div>
          <div style="border-bottom: 2px solid #1e40af; width: 200px; margin: 0 auto;"></div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <strong>Student Name:</strong> ${user?.displayName || 'N/A'}
            </div>
            <div>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Email:</strong> ${user?.email || 'N/A'}
            </div>
            <div>
              <strong>Report Period:</strong> ${selectedSemesters === "all" ? "All Semesters" : `First ${selectedSemesters} Semesters`}
            </div>
          </div>
        </div>

        <!-- Performance Analysis Section -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px;">
            Performance Analysis
          </h2>
          
          <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <!-- GPA Trend Chart -->
            <div style="flex: 1; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">GPA Trend Analysis</h3>
              <div style="height: 200px; position: relative;">
                <svg width="100%" height="100%" viewBox="0 0 300 200">
                  ${reportData.length > 1 ? `
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:0.3" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#lineGradient)" opacity="0.1"/>
                    <polyline 
                      points="${reportData.map((sem, index) => {
                        const x = (index / (reportData.length - 1)) * 280 + 10;
                        const y = 190 - (sem.cgpa / 10) * 180;
                        return `${x},${y}`;
                      }).join(' ')}"
                      fill="none" 
                      stroke="#1e40af" 
                      stroke-width="3"
                    />
                    ${reportData.map((sem, index) => {
                      const x = (index / (reportData.length - 1)) * 280 + 10;
                      const y = 190 - (sem.cgpa / 10) * 180;
                      return `<circle cx="${x}" cy="${y}" r="4" fill="#1e40af"/>`;
                    }).join('')}
                  ` : '<text x="150" y="100" text-anchor="middle" fill="#6b7280">Insufficient data for trend</text>'}
                </svg>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
                  ${reportData.map(sem => `<span>${sem.semester.split(' ')[1]}</span>`).join('')}
                </div>
              </div>
            </div>

            <!-- Grade Distribution Pie Chart -->
            <div style="flex: 1; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Grade Distribution</h3>
              <div style="height: 200px; position: relative;">
                ${gradeDistribution.length > 0 ? `
                  <svg width="100%" height="100%" viewBox="0 0 200 200">
                    ${gradeDistribution.map((grade, index) => {
                      const total = gradeDistribution.reduce((sum, g) => sum + g.count, 0);
                      const percentage = (grade.count / total) * 100;
                      const radius = 60;
                      const centerX = 100;
                      const centerY = 100;
                      
                      let startAngle = 0;
                      for (let i = 0; i < index; i++) {
                        const prevGrade = gradeDistribution[i];
                        const prevPercentage = (prevGrade.count / total) * 100;
                        startAngle += (prevPercentage / 100) * 2 * Math.PI;
                      }
                      
                      const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;
                      const x1 = centerX + radius * Math.cos(startAngle);
                      const y1 = centerY + radius * Math.sin(startAngle);
                      const x2 = centerX + radius * Math.cos(endAngle);
                      const y2 = centerY + radius * Math.sin(endAngle);
                      
                      const largeArcFlag = percentage > 50 ? 1 : 0;
                      
                      return `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${grade.color}"/>`;
                    }).join('')}
                    <circle cx="100" cy="100" r="30" fill="white"/>
                  </svg>
                  <div style="position: absolute; bottom: 0; left: 0; right: 0; font-size: 10px;">
                    ${gradeDistribution.map(grade => `
                      <div style="display: flex; align-items: center; margin-bottom: 2px;">
                        <div style="width: 10px; height: 10px; background-color: ${grade.color}; margin-right: 5px; border-radius: 2px;"></div>
                        <span>${grade.grade}: ${grade.count} (${grade.percentage.toFixed(1)}%)</span>
                      </div>
                    `).join('')}
                  </div>
                ` : '<text x="100" y="100" text-anchor="middle" fill="#6b7280">No grade data</text>'}
              </div>
            </div>
          </div>

          <!-- Summary Statistics -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
            <div style="text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #1e40af;">
                ${reportData.length}
              </div>
              <div style="font-size: 12px; color: #6b7280;">Semesters</div>
            </div>
            <div style="text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #1e40af;">
                ${reportData.reduce((sum, sem) => sum + sem.subjects.length, 0)}
              </div>
              <div style="font-size: 12px; color: #6b7280;">Total Subjects</div>
            </div>
            <div style="text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #1e40af;">
                ${reportData[reportData.length - 1]?.cgpa.toFixed(2) || '0.00'}
              </div>
              <div style="font-size: 12px; color: #6b7280;">Current CGPA</div>
            </div>
            <div style="text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #1e40af;">
                ${gradeDistribution.filter(g => g.grade.startsWith('A')).reduce((sum, g) => sum + g.count, 0)}
              </div>
              <div style="font-size: 12px; color: #6b7280;">A Grades</div>
            </div>
          </div>
        </div>
        
        <!-- Detailed Grade Breakdown -->
        <div style="margin-bottom: 40px;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px;">
            Detailed Grade Breakdown
          </h2>
          
          ${reportData.map((semester, index) => `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <div style="background-color: #1e40af; color: white; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
                <h3 style="margin: 0; font-size: 18px;">${semester.semester}</h3>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Subject</th>
                    <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Credits</th>
                    <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Grade Point</th>
                    <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Letter Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${semester.subjects.map(subject => `
                    <tr>
                      <td style="border: 1px solid #d1d5db; padding: 10px;">${subject.name}</td>
                      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${subject.credit}</td>
                      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${subject.gradePoint}</td>
                      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">${subject.letterGrade}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <div>
                  <strong>SGPA:</strong> ${semester.sgpa.toFixed(2)}
                </div>
                <div>
                  <strong>CGPA:</strong> ${semester.cgpa.toFixed(2)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 40px; text-align: center; border-top: 2px solid #1e40af; padding-top: 20px;">
          <div style="font-size: 14px; color: #6b7280;">
            Generated by Manohar Labs - Your GPA, Simplified
          </div>
        </div>
      `;
      
      document.body.appendChild(reportCardDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(reportCardDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove the temporary div
      document.body.removeChild(reportCardDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const fileName = `GradeCal_Report_${user?.displayName?.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
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
              Generate Enhanced Report Card
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