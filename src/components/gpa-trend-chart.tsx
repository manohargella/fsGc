"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AllSemesterGrades } from "@/types";
import { semesterSubjects } from "@/lib/gpa";

interface GpaTrendChartProps {
  semestersData: AllSemesterGrades;
}

interface SemesterGPA {
  semester: string;
  sgpa: number;
  cgpa: number;
}

export default function GpaTrendChart({ semestersData }: GpaTrendChartProps) {
  const semesterGPAs = useMemo((): SemesterGPA[] => {
    const semesters = Object.keys(semestersData).sort();
    const gpaData: SemesterGPA[] = [];
    
    let cumulativeTotalScore = 0;
    let cumulativeTotalCredits = 0;
    
    semesters.forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.grades && grades.grades.length > 0 && semesterSubjects[semKey]) {
        const subjects = semesterSubjects[semKey];
        
        // Calculate SGPA for this semester
        let semesterTotalScore = 0;
        let semesterTotalCredits = 0;
        
        subjects.forEach((subject, index) => {
          const grade = grades.grades[index];
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint) && subject.credit > 0) {
              semesterTotalScore += gradePoint * subject.credit;
              semesterTotalCredits += subject.credit;
            }
          }
        });
        
        const sgpa = semesterTotalCredits > 0 ? semesterTotalScore / semesterTotalCredits : 0;
        
        // Add to cumulative total
        subjects.forEach((subject, index) => {
          const grade = grades.grades[index];
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint) && subject.credit > 0) {
              cumulativeTotalScore += gradePoint * subject.credit;
              cumulativeTotalCredits += subject.credit;
            }
          }
        });
        
        const cgpa = cumulativeTotalCredits > 0 ? cumulativeTotalScore / cumulativeTotalCredits : 0;
        
        gpaData.push({
          semester: `Semester ${semKey}`,
          sgpa: Number(sgpa.toFixed(2)),
          cgpa: Number(cgpa.toFixed(2))
        });
      }
    });
    
    return gpaData;
  }, [semestersData]);

  const trend = useMemo(() => {
    if (semesterGPAs.length < 2) return { direction: 'stable', value: 0 };
    
    const lastTwo = semesterGPAs.slice(-2);
    const difference = lastTwo[1].cgpa - lastTwo[0].cgpa;
    
    if (difference > 0.1) return { direction: 'up', value: difference };
    if (difference < -0.1) return { direction: 'down', value: Math.abs(difference) };
    return { direction: 'stable', value: 0 };
  }, [semesterGPAs]);

  const maxGPA = Math.max(...semesterGPAs.map(s => s.cgpa), 10);
  const minGPA = Math.min(...semesterGPAs.map(s => s.cgpa), 0);

  if (semesterGPAs.length === 0) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">GPA Trend Analysis</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add grades to see your GPA progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">GPA Trend Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your academic progress over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {trend.direction === 'up' && (
              <TrendingUp className="h-4 w-4 text-green-500" />
            )}
            {trend.direction === 'down' && (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            {trend.direction === 'stable' && (
              <Minus className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {trend.direction === 'up' && `+${trend.value.toFixed(2)}`}
              {trend.direction === 'down' && `-${trend.value.toFixed(2)}`}
              {trend.direction === 'stable' && 'Stable'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-48 w-full">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {semesterGPAs.map((semester, index) => {
                const height = ((semester.cgpa - minGPA) / (maxGPA - minGPA)) * 100;
                const isLast = index === semesterGPAs.length - 1;
                
                return (
                  <div key={semester.semester} className="flex flex-col items-center">
                    <div className="relative">
                      <div 
                        className={`w-8 rounded-t-sm transition-all duration-300 ${
                          isLast 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg' 
                            : 'bg-gradient-to-t from-blue-500/60 to-blue-300/60'
                        }`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                        {semester.cgpa.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      {semester.semester.split(' ')[1]}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 25, 50, 75, 100].map((line) => (
                <div
                  key={line}
                  className="absolute w-full border-t border-border/30"
                  style={{ bottom: `${line}%` }}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {semesterGPAs[semesterGPAs.length - 1]?.cgpa.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-muted-foreground">Current CGPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {semesterGPAs.length}
              </div>
              <div className="text-xs text-muted-foreground">Semesters</div>
            </div>
          </div>

          {/* Semester breakdown */}
          {semesterGPAs.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Recent Performance</h4>
              <div className="space-y-1">
                {semesterGPAs.slice(-3).reverse().map((semester, index) => (
                  <div key={semester.semester} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{semester.semester}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{semester.cgpa.toFixed(2)}</span>
                      {index < semesterGPAs.slice(-3).length - 1 && (
                        <span className={`text-xs ${
                          semester.cgpa > semesterGPAs[semesterGPAs.length - 2 - index]?.cgpa 
                            ? 'text-green-500' 
                            : semester.cgpa < semesterGPAs[semesterGPAs.length - 2 - index]?.cgpa 
                            ? 'text-red-500' 
                            : 'text-blue-500'
                        }`}>
                          {semester.cgpa > semesterGPAs[semesterGPAs.length - 2 - index]?.cgpa ? '↗' : 
                           semester.cgpa < semesterGPAs[semesterGPAs.length - 2 - index]?.cgpa ? '↘' : '→'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 