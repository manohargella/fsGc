"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { AllSemesterGrades } from "@/types";
import { getGradeLetter, semesterSubjects } from "@/lib/gpa";

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

export default function GradeDistributionChart({ semestersData }: GradeDistributionChartProps) {
  const gradeDistribution = useMemo((): GradeCount[] => {
    const gradeCounts: Record<string, number> = {};
    let totalGrades = 0;

    // Count grades across all semesters
    Object.keys(semestersData).forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.grades && grades.grades.length > 0 && semesterSubjects[semKey]) {
        grades.grades.forEach((grade, index) => {
          if (grade && grade.gradePoint) {
            const gradePoint = parseFloat(String(grade.gradePoint));
            if (!isNaN(gradePoint)) {
              const letterGrade = getGradeLetter(gradePoint);
              if (letterGrade === "-") return;
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
        return GRADE_ORDER.indexOf(a.name) - GRADE_ORDER.indexOf(b.name);
      });

    return distribution;
  }, [semestersData]);

  const totalGrades = gradeDistribution.reduce((sum, grade) => sum + grade.value, 0);
  const averageGrade = useMemo(() => {
    if (totalGrades === 0) return 0;
    
    let totalPoints = 0;
    Object.keys(semestersData).forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.grades && grades.grades.length > 0) {
        grades.grades.forEach(grade => {
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
                  const oAGrades = gradeDistribution.filter(g => ['O', 'A+', 'A'].includes(g.name)).reduce((sum, g) => sum + g.value, 0);
                  const bGrades = gradeDistribution.filter(g => ['B+', 'B'].includes(g.name)).reduce((sum, g) => sum + g.value, 0);
                  const cGrades = gradeDistribution.filter(g => g.name === 'C').reduce((sum, g) => sum + g.value, 0);
                  const pFGrades = gradeDistribution.filter(g => ['P', 'F'].includes(g.name)).reduce((sum, g) => sum + g.value, 0);

                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">O/A Grades:</span>
                        <span className="text-green-500 font-medium">{oAGrades}</span>
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
                        <span className="text-muted-foreground">P/F Grades:</span>
                        <span className="text-red-500 font-medium">{pFGrades}</span>
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
