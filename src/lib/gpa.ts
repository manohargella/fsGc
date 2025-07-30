export const semesterSubjects: Record<string, { name: string; credit: number }[]> = {
    "1": [
      { name: "Engineering Mathematics – I", credit: 3 },
      { name: "Engineering Chemistry", credit: 3 },
      { name: "English", credit: 3 },
      { name: "Computer Programming Using C", credit: 3 },
      { name: "IT Essentials", credit: 3 },
      { name: "Communication skills Lab", credit: 1.5 },
      { name: "Computer Engineering Workshop Lab", credit: 1.5 },
      { name: "Computer Programming using C lab", credit: 1.5 },
    ],
    "2": [
      { name: "Engineering Mathematics–II", credit: 3 },
      { name: "Engineering Physics", credit: 3 },
      { name: "Elements of Electronics Engineering", credit: 3 },
      { name: "Data Structures Using C", credit: 3 },
      { name: "Digital Logic Design", credit: 3 },
      { name: "Linux Administration Lab", credit: 1.5 },
      { name: "Engineering Physics Lab", credit: 1.5 },
      { name: "Data Structures Lab", credit: 1.5 },
    ],
    "3": [
      { name: "Discrete Mathematical Structures", credit: 3 },
      { name: "Computer Organization and Architecture", credit: 3 },
      { name: "PSQT", credit: 3 },
      { name: "Operating Systems", credit: 3 },
      { name: "Object Oriented Programming Through Java", credit: 3 },
      { name: "Computer Organization & Architecture Lab", credit: 1.5 },
      { name: "Object Oriented Programming Through Java Lab", credit: 1.5 },
      { name: "Operating Systems Lab", credit: 1.5 },
      { name: "Intellectual Property Rights (Internal)", credit: 2 },
      { name: "Environmental Science", credit: 0 },
    ],
    "4": [
      { name: "Microprocessors", credit: 3 },
      { name: "Design and Analysis of Algorithms", credit: 3 },
      { name: "Database Management System", credit: 3 },
      { name: "Formal Languages & Automata Theory", credit: 3 },
      { name: "Managerial Economics", credit: 3 },
      { name: "Algorithms Lab through C++", credit: 1.5 },
      { name: "Database Management Systems Lab", credit: 1.5 },
      { name: "Web Technologies", credit: 2 },
      { name: "Professional Ethics & Universal Human Values", credit: 0 },
    ],
    "5": [
      { name: "Data Communications & Computer Networks", credit: 3 },
      { name: "Artificial Intelligence", credit: 3 },
      { name: "Compiler Design", credit: 3 },
      { name: "Professional Elective 1", credit: 3 },
      { name: "Open Elective 1", credit: 3 },
      { name: "Data Communications & Computer Networks Lab", credit: 1.5 },
      { name: "Python Programming Lab", credit: 1.5 },
      { name: "Soft Skills", credit: 2 },
      { name: "Internship 1", credit: 2 },
    ],
    "6": [
      { name: "Object Oriented Software Engineering", credit: 3 },
      { name: "Machine Learning", credit: 3 },
      { name: "Cryptography & Network Security", credit: 3 },
      { name: "Professional Elective 2", credit: 3 },
      { name: "Open Elective 2", credit: 3 },
      { name: "Object oriented Software Engineering Lab", credit: 1.5 },
      { name: "Machine Learning Lab", credit: 1.5 },
      { name: "Cryptography & Network Security Lab", credit: 2 },
      { name: "Embedded Systems Design", credit: 2 },
    ],
    "7": [
      { name: "Professional Elective 3", credit: 3 },
      { name: "Professional Elective 4", credit: 3 },
      { name: "Professional Elective 5", credit: 3 },
      { name: "Open Elective 3", credit: 3 },
      { name: "Open Elective 4", credit: 3 },
      { name: "HSS Elective", credit: 3 },
      { name: "Design Thinking and product Innovation", credit: 2 },
      { name: "Internship 2", credit: 2 },
    ],
    "8": [{ name: "Project Work", credit: 14 }],
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
