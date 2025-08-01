"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { AllSemesterGrades } from "@/types";
import { semesterSubjects } from "@/lib/gpa";

interface GradeDistributionChartProps {
  semestersData: AllSemesterGrades;
}

interface GradeCount {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const GRADE_COLORS = {
  'A+': '#10B981', // Green
  'A': '#34D399',
  'A-': '#6EE7B7',
  'B+': '#3B82F6', // Blue
  'B': '#60A5FA',
  'B-': '#93C5FD',
  'C+': '#F59E0B', // Orange
  'C': '#FBBF24',
  'C-': '#FCD34D',
  'D+': '#EF4444', // Red
  'D': '#F87171',
  'D-': '#FCA5A5',
  'F': '#DC2626',  // Dark Red
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

export default function GradeDistributionChart({ semestersData }: GradeDistributionChartProps) {
  const gradeDistribution = useMemo((): GradeCount[] => {
    const gradeCounts: Record<string, number> = {};
    let totalGrades = 0;

    // Count grades across all semesters
    Object.keys(semestersData).forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.length > 0 && semesterSubjects[semKey]) {
        grades.forEach((grade, index) => {
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint)) {
              const letterGrade = getLetterGrade(gradePoint);
              gradeCounts[letterGrade] = (gradeCounts[letterGrade] || 0) + 1;
              totalGrades++;
            }
          }
        });
      }
    });

    // Convert to array format for chart
    const distribution = Object.entries(gradeCounts)
      .map(([grade, count]) => ({
        name: grade,
        value: count,
        color: GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6B7280',
        percentage: totalGrades > 0 ? (count / totalGrades) * 100 : 0
      }))
      .sort((a, b) => {
        // Sort by grade quality (A+ first, F last)
        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
        return gradeOrder.indexOf(a.name) - gradeOrder.indexOf(b.name);
      });

    return distribution;
  }, [semestersData]);

  const totalGrades = gradeDistribution.reduce((sum, grade) => sum + grade.value, 0);
  const averageGrade = useMemo(() => {
    if (totalGrades === 0) return 0;
    
    let totalPoints = 0;
    Object.keys(semestersData).forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.length > 0) {
        grades.forEach(grade => {
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint)) {
              totalPoints += gradePoint;
            }
          }
        });
      }
    });
    
    return totalPoints / totalGrades;
  }, [semestersData, totalGrades]);

  if (totalGrades === 0) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Grade Distribution</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add grades to see your grade distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No grades available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Grade Distribution</CardTitle>
        <CardDescription className="text-muted-foreground">
          Breakdown of your letter grades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} grades (${((value / totalGrades) * 100).toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalGrades}
              </div>
              <div className="text-xs text-muted-foreground">Total Grades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {averageGrade.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Average Grade</div>
            </div>
          </div>

          {/* Grade Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Grade Breakdown</h4>
            <div className="grid grid-cols-2 gap-2">
              {gradeDistribution.map((grade) => (
                <div key={grade.name} className="flex items-center justify-between p-2 rounded-md bg-background/30">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: grade.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{grade.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{grade.value}</span>
                    <span className="text-xs text-muted-foreground">({grade.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          {gradeDistribution.length > 0 && (
            <div className="pt-4 border-t border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-2">Performance Summary</h4>
              <div className="space-y-2">
                {(() => {
                  const aGrades = gradeDistribution.filter(g => g.name.startsWith('A')).reduce((sum, g) => sum + g.value, 0);
                  const bGrades = gradeDistribution.filter(g => g.name.startsWith('B')).reduce((sum, g) => sum + g.value, 0);
                  const cGrades = gradeDistribution.filter(g => g.name.startsWith('C')).reduce((sum, g) => sum + g.value, 0);
                  const dGrades = gradeDistribution.filter(g => g.name.startsWith('D')).reduce((sum, g) => sum + g.value, 0);
                  const fGrades = gradeDistribution.filter(g => g.name === 'F').reduce((sum, g) => sum + g.value, 0);

                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">A Grades:</span>
                        <span className="text-green-500 font-medium">{aGrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">B Grades:</span>
                        <span className="text-blue-500 font-medium">{bGrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">C Grades:</span>
                        <span className="text-yellow-500 font-medium">{cGrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">D/F Grades:</span>
                        <span className="text-red-500 font-medium">{dGrades + fGrades}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
