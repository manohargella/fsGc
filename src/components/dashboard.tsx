"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Moon, Sun, LogOut, Loader2, BarChart3, TrendingUp, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import type { AllSemesterGrades } from "@/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { semesterSubjects } from "@/lib/gpa";
import { useAuth } from "@/context/auth-context";
import { auth, db } from "@/lib/firebase";

import GpaDisplay from "./gpa-display";
import CourseList from "./course-list";
import CourseForm from "./course-form";
import GradeDistributionChart from "./grade-distribution-chart";
import GpaTrendChart from "./gpa-trend-chart";
import ReportCardGenerator from "./report-card-generator";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "dark");
  const { toast } = useToast();
  
  const [currentSemester, setCurrentSemester] = useState<string>("1");
  const [semestersData, setSemestersData] = useState<AllSemesterGrades>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showGradeDistribution, setShowGradeDistribution] = useState(false);
  const [showGpaTrend, setShowGpaTrend] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);

  const currentSubjects = useMemo(() => semesterSubjects[currentSemester] || [], [currentSemester]);
  const currentGrades = useMemo(() => semestersData[currentSemester]?.grades || [], [semestersData, currentSemester]);
  const currentCustomSubjects = useMemo(() => semestersData[currentSemester]?.customSubjects || {}, [semestersData, currentSemester]);
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && db) {
      setIsDataLoaded(false);
      const docRef = doc(db, "users", user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Handle migration from old format to new format
          const oldSemestersData = data.semestersData || {};
          const newSemestersData: AllSemesterGrades = {};
          
          Object.keys(oldSemestersData).forEach(semKey => {
            const oldData = oldSemestersData[semKey];
            if (Array.isArray(oldData)) {
              // Old format: just an array of grades
              newSemestersData[semKey] = { grades: oldData };
            } else {
              // New format: already has the correct structure
              newSemestersData[semKey] = oldData;
            }
          });
          
          setSemestersData(newSemestersData);
        }
        setIsDataLoaded(true);
      });
    } else if (user && !db) {
      // Firebase not configured, proceed without loading from DB
      setIsDataLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && isDataLoaded && db) {
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, { semestersData }).catch(error => {
        console.error("Error saving data:", error);
        toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
      });
    }
  }, [semestersData, user, isDataLoaded, toast]);

  const handleGradeChange = (subjectIndex: number, gradePoint: string) => {
    let gpVal = gradePoint;
    const gp = parseFloat(gpVal);
    if (gp > 10) {
      gpVal = "10";
      toast({ title: "Maximum grade point is 10", description: "The value has been capped at 10.", variant: "destructive" });
    }
    if (gp < 0) {
        gpVal = "0";
    }

    if (!semestersData[currentSemester]) {
      setSemestersData({
        ...semestersData,
        [currentSemester]: { grades: [], customSubjects: {} }
      });
    }

    const currentSemesterData = semestersData[currentSemester] || { grades: [], customSubjects: {} };
    const newGrades = [...(currentSemesterData.grades || currentSubjects.map(() => ({ gradePoint: "" })))];
    newGrades[subjectIndex] = { gradePoint: gpVal };

    setSemestersData({
      ...semestersData,
      [currentSemester]: {
        ...currentSemesterData,
        grades: newGrades
      }
    });
  };

  const resetAllGrades = () => {
    setSemestersData({});
    toast({ title: "All Grades Reset", description: "All grades across all semesters have been cleared.", variant: "default" });
  };

  const clearCurrentSemesterGrades = () => {
    if (semestersData[currentSemester]) {
      const newSemestersData = { ...semestersData };
      delete newSemestersData[currentSemester];
      setSemestersData(newSemestersData);
      toast({ title: "Semester Grades Cleared", description: `Grades for semester ${currentSemester} have been cleared.`, variant: "default" });
    }
  };

  const updateSubjectName = (subjectIndex: number, newName: string) => {
    if (!semestersData[currentSemester]) {
      setSemestersData({
        ...semestersData,
        [currentSemester]: { grades: [], customSubjects: {} }
      });
    }

    const currentSemesterData = semestersData[currentSemester] || { grades: [], customSubjects: {} };
    const newCustomSubjects = { ...currentSemesterData.customSubjects };
    
    if (newName.trim() === '') {
      delete newCustomSubjects[subjectIndex];
    } else {
      newCustomSubjects[subjectIndex] = newName.trim();
    }

    setSemestersData({
      ...semestersData,
      [currentSemester]: {
        ...currentSemesterData,
        customSubjects: newCustomSubjects
      }
    });
  };

  const { sgpa, cgpa } = useMemo(() => {
    let semesterTotalScore = 0;
    let semesterTotalCredits = 0;

    currentSubjects.forEach((subject, index) => {
        const grade = currentGrades[index];
        const gradePoint = parseFloat(String(grade?.gradePoint || ""));
        if (!isNaN(gradePoint) && subject.credit > 0) {
            semesterTotalScore += gradePoint * subject.credit;
            semesterTotalCredits += subject.credit;
        }
    });
    
    const calculatedSgpa = semesterTotalCredits > 0 ? semesterTotalScore / semesterTotalCredits : 0;
    
    let cumulativeTotalScore = 0;
    let cumulativeTotalCredits = 0;
    
    Object.keys(semestersData).forEach(semKey => {
      const grades = semestersData[semKey];
      if (grades && grades.grades && grades.grades.length > 0 && semesterSubjects[semKey]) {
        const subjects = semesterSubjects[semKey];
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
      }
    });

    const calculatedCgpa = cumulativeTotalCredits > 0 ? cumulativeTotalScore / cumulativeTotalCredits : 0;

    return { sgpa: calculatedSgpa, cgpa: calculatedCgpa };
  }, [semestersData, currentSubjects, currentGrades]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
      toast({ title: "Logout Failed", description: "There was an error signing out.", variant: "destructive" });
    }
  };
  
  if (authLoading || !isDataLoaded || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">GradeCal</h1>
        <div className="flex items-center gap-2">
            <Button onClick={toggleTheme} variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Dialog open={showGradeDistribution} onOpenChange={setShowGradeDistribution}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                <span>Grade Distribution</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Grade Distribution Analysis</DialogTitle>
                                <DialogDescription>
                                    Detailed breakdown of your letter grades across all semesters
                                </DialogDescription>
                            </DialogHeader>
                            <GradeDistributionChart semestersData={semestersData} />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={showGpaTrend} onOpenChange={setShowGpaTrend}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                <span>GPA Trend Analysis</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>GPA Trend Analysis</DialogTitle>
                                <DialogDescription>
                                    Track your academic progress over time
                                </DialogDescription>
                            </DialogHeader>
                            <GpaTrendChart semestersData={semestersData} />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={showReportCard} onOpenChange={setShowReportCard}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Generate Report Card</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Report Card Generator</DialogTitle>
                                <DialogDescription>
                                    Create a professional PDF report card with Manohar Labs branding
                                </DialogDescription>
                            </DialogHeader>
                            <ReportCardGenerator semestersData={semestersData} user={user} />
                        </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
          <div className="space-y-8 lg:col-span-2 xl:col-span-3">
            <CourseList 
                subjects={currentSubjects} 
                grades={currentGrades} 
                onGradeChange={handleGradeChange}
                currentSemester={currentSemester}
                resetAllGrades={resetAllGrades}
                clearCurrentSemesterGrades={clearCurrentSemesterGrades}
                customSubjects={currentCustomSubjects}
                onSubjectNameChange={updateSubjectName}
            />
          </div>

          <div className="space-y-8 lg:col-span-1 xl:col-span-1">
            <CourseForm 
                currentSemester={currentSemester}
                onSemesterChange={setCurrentSemester}
            />
            <GpaDisplay sgpa={sgpa} cgpa={cgpa} />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Build by{" "}
        <a
          href="https://manohargella.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Manohar Gella
        </a>
      </footer>
    </div>
  );
}
