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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getGradeLetter } from "@/lib/gpa";
import type { Subject, SemesterGrade, EditableSubject } from "@/types";
import { useState } from "react";
import { Edit2 } from "lucide-react";

type CourseListProps = {
  subjects: EditableSubject[];
  grades: SemesterGrade[];
  onGradeChange: (subjectIndex: number, gradePoint: string) => void;
  currentSemester: string;
  resetAllGrades: () => void;
  clearCurrentSemesterGrades: () => void;
  customSubjects: Record<number, string>;
  onSubjectNameChange: (subjectIndex: number, newName: string) => void;
};

export default function CourseList({ subjects, grades, onGradeChange, currentSemester, resetAllGrades, clearCurrentSemesterGrades, customSubjects, onSubjectNameChange }: CourseListProps) {
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState<string>("");

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < subjects.length) {
        // Focus the next input field
        const nextInput = document.querySelector(`input[data-index="${nextIndex}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  const startEditingSubject = (subjectIndex: number, currentName: string) => {
    setEditingSubjectIndex(subjectIndex);
    setEditingSubjectName(customSubjects[subjectIndex] || currentName);
  };

  const saveSubjectName = (subjectIndex: number) => {
    onSubjectNameChange(subjectIndex, editingSubjectName);
    setEditingSubjectIndex(null);
    setEditingSubjectName("");
  };

  const cancelEditingSubject = () => {
    setEditingSubjectIndex(null);
    setEditingSubjectName("");
  };

  const getDisplaySubjectName = (subject: EditableSubject, index: number) => {
    if (subject.isEditable && customSubjects[index]) {
      return customSubjects[index];
    }
    return subject.name;
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-3 sm:px-6 pb-4">
        <CardTitle className="text-lg sm:text-xl">Semester {currentSemester} Subjects</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter grade points for each subject to calculate GPA. Use Enter to move to next field.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {subjects.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-[45%] sm:w-[40%] px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium">
                      Subject Name
                    </TableHead>
                    <TableHead className="text-center px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium">
                      Credits
                    </TableHead>
                    <TableHead className="text-center px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium">
                      Grade Point
                    </TableHead>
                    <TableHead className="text-center px-2 sm:px-3 md:px-4 py-3 text-xs sm:text-sm font-medium">
                      Letter Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject, index) => {
                      const gradeValue = grades[index]?.gradePoint ?? "";
                      return (
                          <TableRow key={subject.name} className="border-b hover:bg-muted/50">
                              <TableCell className="font-medium p-2 sm:p-3 md:p-4 text-xs sm:text-sm">
                                  {editingSubjectIndex === index ? (
                                      <div className="flex items-center gap-2">
                                          <Input
                                              type="text"
                                              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                                              value={editingSubjectName}
                                              onChange={(e) => setEditingSubjectName(e.target.value)}
                                              onBlur={() => saveSubjectName(index)}
                                              onKeyPress={(event) => {
                                                  if (event.key === 'Enter') {
                                                      event.preventDefault();
                                                      saveSubjectName(index);
                                                  } else if (event.key === 'Escape') {
                                                      event.preventDefault();
                                                      cancelEditingSubject();
                                                  }
                                              }}
                                              autoFocus
                                          />
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => saveSubjectName(index)}
                                              className="h-8 w-8 p-0 flex-shrink-0"
                                          >
                                              ✓
                                          </Button>
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={cancelEditingSubject}
                                              className="h-8 w-8 p-0 flex-shrink-0"
                                          >
                                              ✕
                                          </Button>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2">
                                          <div className="flex-1 min-w-0">
                                              <span className={`block truncate ${subject.isEditable ? "text-blue-600 font-medium" : ""}`}>
                                                  {getDisplaySubjectName(subject, index)}
                                              </span>
                                              {subject.isEditable && (
                                                  <span className="inline-block mt-1 text-xs text-blue-500 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-full">
                                                      Elective
                                                  </span>
                                              )}
                                          </div>
                                          {subject.isEditable && (
                                              <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => startEditingSubject(index, subject.name)}
                                                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100 flex-shrink-0"
                                              >
                                                  <Edit2 className="h-3 w-3" />
                                              </Button>
                                          )}
                                      </div>
                                  )}
                              </TableCell>
                              <TableCell className="text-center p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-medium">
                                {subject.credit}
                              </TableCell>
                              <TableCell className="w-[80px] sm:w-[100px] md:w-[150px] p-2 sm:p-3 md:p-4">
                                  <Input 
                                      type="number" 
                                      className="text-center w-full h-8 sm:h-9 text-xs sm:text-sm"
                                      min="0"
                                      max="10"
                                      step="0.01"
                                      data-index={index}
                                      value={gradeValue}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow decimal values and validate range
                                        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
                                          onGradeChange(index, value);
                                        }
                                      }}
                                      onKeyPress={(event) => handleKeyPress(event, index)}
                                      placeholder="-"
                                  />
                              </TableCell>
                              <TableCell className="text-center font-bold p-2 sm:p-3 md:p-4 text-sm sm:text-base md:text-xl">
                                {getGradeLetter(parseFloat(String(gradeValue)))}
                              </TableCell>
                          </TableRow>
                      );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold">No Subjects Found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Select a semester to see subjects.
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto h-10 sm:h-9 text-sm">
                Reset All Grades
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Grades</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently clear all grades across all semesters. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllGrades} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-9 text-sm">
                Clear Semester {currentSemester}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Semester {currentSemester} Grades</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear all grades for semester {currentSemester} only. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCurrentSemesterGrades} className="w-full sm:w-auto bg-orange-600 text-white hover:bg-orange-700">
                  Clear Semester
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
