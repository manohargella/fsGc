"use client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getGradeLetter } from "@/lib/gpa";
import type { Subject, SemesterGrade } from "@/types";

type CourseListProps = {
  subjects: Subject[];
  grades: SemesterGrade[];
  onGradeChange: (subjectIndex: number, gradePoint: string) => void;
  currentSemester: string;
};

export default function CourseList({ subjects, grades, onGradeChange, currentSemester }: CourseListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Semester {currentSemester} Subjects</CardTitle>
        <CardDescription>Enter grade points for each subject to calculate GPA.</CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length > 0 ? (
          <>
            {/* Desktop View: Table */}
            <div className="border rounded-md hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Subject Name</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Grade Point (0-10)</TableHead>
                    <TableHead className="text-center">Letter Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject, index) => {
                      const gradeValue = grades[index]?.gradePoint ?? "";
                      return (
                          <TableRow key={subject.name}>
                              <TableCell className="font-medium">{subject.name}</TableCell>
                              <TableCell className="text-center">{subject.credit}</TableCell>
                              <TableCell className="w-[150px]">
                                  <Input 
                                      type="number" 
                                      className="text-center"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      value={gradeValue}
                                      onChange={(e) => onGradeChange(index, e.target.value)}
                                      placeholder="-"
                                      onKeyPress={(event) => {
                                        if (!/[0-9.]/.test(event.key)) {
                                          event.preventDefault();
                                        }
                                      }}
                                  />
                              </TableCell>
                              <TableCell className="text-center font-bold">{getGradeLetter(parseFloat(String(gradeValue)))}</TableCell>
                          </TableRow>
                      );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="space-y-4 md:hidden">
              {subjects.map((subject, index) => {
                const gradeValue = grades[index]?.gradePoint ?? "";
                return (
                  <div key={subject.name} className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium leading-tight">{subject.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Credits</label>
                        <p className="font-semibold">{subject.credit}</p>
                      </div>
                      <div className="text-right">
                        <label className="text-xs text-muted-foreground">Letter Grade</label>
                        <p className="font-bold text-xl">{getGradeLetter(parseFloat(String(gradeValue)))}</p>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`grade-input-${index}`} className="text-sm font-medium text-muted-foreground">
                        Grade Point (0-10)
                      </label>
                      <Input
                          id={`grade-input-${index}`}
                          type="number"
                          className="w-full mt-1 text-center text-base"
                          min="0"
                          max="10"
                          step="0.1"
                          value={gradeValue}
                          onChange={(e) => onGradeChange(index, e.target.value)}
                          placeholder="Enter Grade"
                          onKeyPress={(event) => {
                            if (!/[0-9.]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Subjects Found</h3>
            <p className="text-muted-foreground">
              Select a semester to see subjects.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
