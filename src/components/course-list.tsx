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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    setIsEditDialogOpen(true);
  };

  const saveSubjectName = () => {
    if (editingSubjectIndex !== null) {
      onSubjectNameChange(editingSubjectIndex, editingSubjectName);
      setEditingSubjectIndex(null);
      setEditingSubjectName("");
      setIsEditDialogOpen(false);
    }
  };

  const cancelEditingSubject = () => {
    setEditingSubjectIndex(null);
    setEditingSubjectName("");
    setIsEditDialogOpen(false);
  };

  const getDisplaySubjectName = (subject: EditableSubject, index: number) => {
    if (subject.isEditable && customSubjects[index]) {
      return customSubjects[index];
    }
    return subject.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semester {currentSemester} Subjects</CardTitle>
        <CardDescription>Enter grade points for each subject to calculate GPA. Use Enter to move to next field.</CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length > 0 ? (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] px-2 text-sm font-medium">Subject Name</TableHead>
                  <TableHead className="text-center px-2 text-sm font-medium">Credits</TableHead>
                  <TableHead className="text-center px-2 text-sm font-medium">Grade Point</TableHead>
                  <TableHead className="text-center px-2 text-sm font-medium">Letter Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject, index) => {
                    const gradeValue = grades[index]?.gradePoint ?? "";
                    return (
                        <TableRow key={subject.name}>
                            <TableCell className="font-medium p-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className={`block break-words ${subject.isEditable ? "text-blue-600 font-medium" : ""}`}>
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
                                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 flex-shrink-0 mt-0.5"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center p-2 text-sm font-medium">
                                {subject.credit}
                            </TableCell>
                            <TableCell className="w-[100px] p-2">
                                <Input 
                                    type="number" 
                                    className="text-center w-full"
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
                            <TableCell className="text-center font-bold p-2 text-lg">
                                {getGradeLetter(parseFloat(String(gradeValue)))}
                            </TableCell>
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
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Reset All Grades
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Grades</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently clear all grades across all semesters. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllGrades} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Clear Semester {currentSemester}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Semester {currentSemester} Grades</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear all grades for semester {currentSemester} only. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCurrentSemesterGrades} className="bg-orange-600 text-white hover:bg-orange-700">
                  Clear Semester
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Edit Subject Name Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subject Name</DialogTitle>
              <DialogDescription>
                Enter a new name for this elective subject.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="text"
                placeholder="Enter subject name"
                value={editingSubjectName}
                onChange={(e) => setEditingSubjectName(e.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    saveSubjectName();
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelEditingSubject}>
                Cancel
              </Button>
              <Button onClick={saveSubjectName}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
