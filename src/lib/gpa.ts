import type { EditableSubject } from "@/types";

export const semesterSubjects: Record<string, EditableSubject[]> = {
    "1": [
      { name: "Engineering Mathematics – I", credit: 3, isEditable: false },
      { name: "Engineering Chemistry", credit: 3, isEditable: false },
      { name: "English", credit: 3, isEditable: false },
      { name: "Computer Programming Using C", credit: 3, isEditable: false },
      { name: "IT Essentials", credit: 3, isEditable: false },
      { name: "Communication skills Lab", credit: 1.5, isEditable: false },
      { name: "Computer Engineering Workshop Lab", credit: 1.5, isEditable: false },
      { name: "Computer Programming using C lab", credit: 1.5, isEditable: false },
    ],
    "2": [
      { name: "Engineering Mathematics–II", credit: 3, isEditable: false },
      { name: "Engineering Physics", credit: 3, isEditable: false },
      { name: "Elements of Electronics Engineering", credit: 3, isEditable: false },
      { name: "Data Structures Using C", credit: 3, isEditable: false },
      { name: "Digital Logic Design", credit: 3, isEditable: false },
      { name: "Linux Administration Lab", credit: 1.5, isEditable: false },
      { name: "Engineering Physics Lab", credit: 1.5, isEditable: false },
      { name: "Data Structures Lab", credit: 1.5, isEditable: false },
    ],
    "3": [
      { name: "Discrete Mathematical Structures", credit: 3, isEditable: false },
      { name: "Computer Organization and Architecture", credit: 3, isEditable: false },
      { name: "PSQT", credit: 3, isEditable: false },
      { name: "Operating Systems", credit: 3, isEditable: false },
      { name: "Object Oriented Programming Through Java", credit: 3, isEditable: false },
      { name: "Computer Organization & Architecture Lab", credit: 1.5, isEditable: false },
      { name: "Object Oriented Programming Through Java Lab", credit: 1.5, isEditable: false },
      { name: "Operating Systems Lab", credit: 1.5, isEditable: false },
      { name: "Intellectual Property Rights (Internal)", credit: 2, isEditable: false },
      { name: "Environmental Science", credit: 0, isEditable: false },
    ],
    "4": [
      { name: "Microprocessors", credit: 3, isEditable: false },
      { name: "Design and Analysis of Algorithms", credit: 3, isEditable: false },
      { name: "Database Management System", credit: 3, isEditable: false },
      { name: "Formal Languages & Automata Theory", credit: 3, isEditable: false },
      { name: "Managerial Economics", credit: 3, isEditable: false },
      { name: "Algorithms Lab through C++", credit: 1.5, isEditable: false },
      { name: "Database Management Systems Lab", credit: 1.5, isEditable: false },
      { name: "Web Technologies", credit: 2, isEditable: false },
      { name: "Professional Ethics & Universal Human Values", credit: 0, isEditable: false },
    ],
    "5": [
      { name: "Data Communications & Computer Networks", credit: 3, isEditable: false },
      { name: "Artificial Intelligence", credit: 3, isEditable: false },
      { name: "Compiler Design", credit: 3, isEditable: false },
      { name: "Professional Elective 1", credit: 3, isEditable: true },
      { name: "Open Elective 1", credit: 3, isEditable: true },
      { name: "Data Communications & Computer Networks Lab", credit: 1.5, isEditable: false },
      { name: "Python Programming Lab", credit: 1.5, isEditable: false },
      { name: "Soft Skills", credit: 2, isEditable: false },
      { name: "Internship 1", credit: 2, isEditable: false },
    ],
    "6": [
      { name: "Object Oriented Software Engineering", credit: 3, isEditable: false },
      { name: "Machine Learning", credit: 3, isEditable: false },
      { name: "Cryptography & Network Security", credit: 3, isEditable: false },
      { name: "Professional Elective 2", credit: 3, isEditable: true },
      { name: "Open Elective 2", credit: 3, isEditable: true },
      { name: "Object oriented Software Engineering Lab", credit: 1.5, isEditable: false },
      { name: "Machine Learning Lab", credit: 1.5, isEditable: false },
      { name: "Cryptography & Network Security Lab", credit: 2, isEditable: false },
      { name: "Embedded Systems Design", credit: 2, isEditable: false },
    ],
    "7": [
      { name: "Professional Elective 3", credit: 3, isEditable: true },
      { name: "Professional Elective 4", credit: 3, isEditable: true },
      { name: "Professional Elective 5", credit: 3, isEditable: true },
      { name: "Open Elective 3", credit: 3, isEditable: true },
      { name: "Open Elective 4", credit: 3, isEditable: true },
      { name: "HSS Elective", credit: 3, isEditable: true },
      { name: "Design Thinking and product Innovation", credit: 2, isEditable: false },
      { name: "Internship 2", credit: 2, isEditable: false },
    ],
    "8": [{ name: "Project Work", credit: 14, isEditable: false }],
};

export const getGradeLetter = (gradePoint: number): string => {
  if (isNaN(gradePoint) || gradePoint < 0) return "-";
  if (gradePoint === 10) return "O";
  if (gradePoint === 9) return "A+";
  if (gradePoint === 8) return "A";
  if (gradePoint === 7) return "B+";
  if (gradePoint === 6) return "B";
  if (gradePoint === 5) return "C";
  if (gradePoint === 4) return "P";
  if (gradePoint < 4) return "F";
  return "-";
};
