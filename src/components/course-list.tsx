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
          <div className="border rounded-md">
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
