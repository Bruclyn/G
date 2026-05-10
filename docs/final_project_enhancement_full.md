# Design and Implementation of a Student Management and Academic Performance Analysis System Using SQL Server and Tableau

## Phase 1: Literature, Meta-Analysis, and Referencing Refinement

### 1.1 Citation/Reference Mismatch Fix Guide
1. Export all in-text citations from chapters using a find pattern like `(Author, Year)`.
2. Compare against the reference list alphabetically.
3. Resolve mismatch categories:
   - In-text citation missing in references.
   - Reference listed but never cited.
   - Year/name mismatch.
   - Duplicate entries for same work.
4. Final validation: each claim-heavy paragraph has at least one citation.

### 1.2 APA 7 Consistency Rules (Project-Wide)
- In-text: (Surname, Year) and (Surname et al., Year) for 3+ authors.
- Reference titles in sentence case.
- Journal title and volume in italics.
- DOI as URL: `https://doi.org/...`
- Hanging indent for references.

### 1.3 Improved Literature Review Flow
1. Student information systems in higher education.
2. Academic performance analysis frameworks.
3. Relational database quality and normalization.
4. GPA computation automation methods.
5. At-risk student detection methods.
6. Educational BI dashboards with Tableau.
7. Synthesis and identified research gap.

### 1.4 Merged Comparative Meta-Analysis (Single Professional Section)
| Study Focus | Methodology | Strengths | Weaknesses | Gap Identified | Relevance to This Project |
|---|---|---|---|---|---|
| Student record digitization | Case study/system implementation | Better record accessibility | Limited analytics depth | Lacks performance intelligence layer | Supports core student data module |
| Academic performance prediction | Historical-data modeling | Early warning potential | Often uses complex models hard to deploy | Implementation realism in small institutions | Supports practical risk rules |
| BI dashboards for education | Dashboard design evaluation | Improved decision visibility | Sometimes disconnected from transactional DB | Need integrated SQL-to-dashboard pipeline | Supports Tableau integration strategy |
| GPA management systems | Rule-based formula implementation | Transparent and auditable grading logic | Sometimes inflexible across programs | Need parameterized procedure-level design | Supports stored procedure architecture |
| Database normalization studies | Schema quality analysis | Reduced anomalies and redundancy | Can become complex for novice teams | Need balanced 3NF design for undergraduate scope | Supports normalized SQL Server schema |

### 1.5 Comparative Narrative (Consolidated)
Most existing studies independently address either student record management, analytics, or reporting dashboards. Fewer provide an end-to-end implementation that combines validated relational design, automated GPA computation, risk detection, and management-grade dashboarding in one coherent architecture. This project fills that gap by integrating SQL Server (data layer + business rules) and Tableau (decision layer) into a realistic, deployable system for departmental use.

### 1.6 Final Research Gap Statement
Current undergraduate-focused implementations rarely combine (1) normalized student-academic relational storage, (2) stored procedure-based GPA/risk logic, and (3) interactive Tableau analytics in one operational system. This project addresses that practical integration gap while remaining technically defendable at final-year level.

---

## Phase 2: Diagram Specifications and Reproducible Structures

## 2.1 Entity Relationship Diagram (ERD)
### Entities
- **Students** (StudentID, MatricNo, FirstName, LastName, Gender, DOB, DeptID, ProgramID, EntryYear, Status)
- **Departments** (DeptID, DeptName, Faculty)
- **Programs** (ProgramID, ProgramName, LevelType, DeptID)
- **Courses** (CourseID, CourseCode, CourseTitle, CreditUnit, DeptID, SemesterOffered)
- **Lecturers** (LecturerID, StaffNo, FullName, DeptID, Rank)
- **Semesters** (SemesterID, SessionName, TermName, StartDate, EndDate)
- **Enrollments** (EnrollmentID, StudentID, SemesterID, EnrollmentDate)
- **Results** (ResultID, StudentID, CourseID, SemesterID, Score, LetterGrade, GradePoint)
- **CourseAssignments** (AssignmentID, CourseID, LecturerID, SemesterID)
- **RiskFlags** (RiskID, StudentID, SemesterID, CGPA, RiskLevel, RiskReason, FlagDate)

### Relationships
- Department 1—M Programs
- Department 1—M Students
- Department 1—M Courses
- Program 1—M Students
- Student M—M Courses (resolved through Results)
- Student 1—M Results
- Semester 1—M Results
- Course 1—M Results
- Lecturer M—M Courses (through CourseAssignments)
- Student 1—M RiskFlags

### Diagram Layout
- Left: master/reference entities (Departments, Programs, Semesters).
- Center: Students and Courses.
- Right: transactional entities (Results, RiskFlags, CourseAssignments).
- Bottom: Lecturers linked via CourseAssignments.
- Use crow’s foot notation; highlight PK/FK labels in each table box.

## 2.2 System Architecture Diagram
### Layers
1. **Presentation Layer**: Web app (Admin, Lecturer, Adviser views), Tableau dashboards.
2. **Application Layer**: API/business logic (authentication, enrollment, results, GPA execution, risk detection trigger).
3. **Data Layer**: SQL Server database, stored procedures, views, constraints.
4. **Analytics Layer**: Tableau extracts/live connections to SQL views.

### Connection Labels
- UI → API: HTTPS/REST
- API → SQL Server: parameterized SQL / stored procedures
- SQL Server → Tableau: read-only analytics views

### Layout
- Top-down stack diagram with arrows downward and feedback arrows from dashboards to users.

## 2.3 Use Case Diagram
### Actors
- Student
- Lecturer
- Academic Adviser
- Department Admin
- System Administrator

### Core Use Cases
- Login
- Register student
- Manage courses
- Upload results
- Compute GPA/CGPA
- Detect at-risk students
- View performance dashboards
- Generate reports
- Manage users/roles

### Layout
- Actors outside system boundary rectangle.
- Group operational use cases left-center; analytics use cases right-center.

## 2.4 Database Relationship Flow
1. Student admitted → Students record.
2. Semester opens → Semesters record active.
3. Student enrolls → Enrollments entry.
4. Lecturer uploads score → Results entry.
5. Stored procedure computes GPA/CGPA and updates derived metrics.
6. Risk procedure writes RiskFlags.
7. Views refresh and Tableau consumes metrics.

## 2.5 GPA Computation Workflow
1. Input: StudentID + SemesterID.
2. Fetch all registered results.
3. Convert scores/letter grades to grade points.
4. Compute Quality Points = GradePoint × CreditUnit.
5. GPA = Sum(QualityPoints) / Sum(CreditUnits).
6. CGPA = cumulative quality points / cumulative credits.
7. Persist snapshot into summary table.

## 2.6 Academic Risk Detection Workflow
### Rule-Based Detection (undergraduate-defendable)
- **High risk**: CGPA < 1.50
- **Moderate risk**: 1.50 ≤ CGPA < 2.00
- **Low risk**: CGPA ≥ 2.00
- Optional additional flags:
  - Failed core courses ≥ 2 in current semester
  - Semester GPA drop > 1.00 from prior semester

### Workflow Steps
1. Run after GPA computation.
2. Evaluate threshold rules.
3. Insert/update RiskFlags.
4. Expose to adviser dashboard.

## 2.7 Tableau Dashboard Mockup Blueprint
- Use consistent top filter strip: Session, Semester, Department, Program Level.
- Left panel: KPI cards.
- Center: trend/distribution visuals.
- Right: exception/risk lists.
- Bottom: drill-down table.

---

## Phase 3: SQL Server Database Design and Scripts (T-SQL)

## 3.1 Normalized Schema (3NF)
- Reference tables: Departments, Programs, Semesters, GradeScale.
- Master tables: Students, Lecturers, Courses.
- Transaction tables: Enrollments, Results, CourseAssignments.
- Analytical/support tables: GPAHistory, RiskFlags.

## 3.2 CREATE TABLE Statements
```sql
CREATE TABLE Departments (
    DeptID INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(100) NOT NULL UNIQUE,
    Faculty NVARCHAR(100) NULL
);

CREATE TABLE Programs (
    ProgramID INT IDENTITY(1,1) PRIMARY KEY,
    ProgramName NVARCHAR(100) NOT NULL,
    LevelType NVARCHAR(20) NOT NULL,
    DeptID INT NOT NULL,
    CONSTRAINT FK_Programs_Departments FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
);

CREATE TABLE Students (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    MatricNo NVARCHAR(30) NOT NULL UNIQUE,
    FirstName NVARCHAR(80) NOT NULL,
    LastName NVARCHAR(80) NOT NULL,
    Gender CHAR(1) NULL,
    DOB DATE NULL,
    DeptID INT NOT NULL,
    ProgramID INT NOT NULL,
    EntryYear INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CONSTRAINT FK_Students_Departments FOREIGN KEY (DeptID) REFERENCES Departments(DeptID),
    CONSTRAINT FK_Students_Programs FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID)
);

CREATE TABLE Semesters (
    SemesterID INT IDENTITY(1,1) PRIMARY KEY,
    SessionName NVARCHAR(20) NOT NULL,
    TermName NVARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CONSTRAINT UQ_Semesters UNIQUE(SessionName, TermName)
);

CREATE TABLE Courses (
    CourseID INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode NVARCHAR(20) NOT NULL UNIQUE,
    CourseTitle NVARCHAR(150) NOT NULL,
    CreditUnit INT NOT NULL CHECK (CreditUnit BETWEEN 1 AND 6),
    DeptID INT NOT NULL,
    SemesterOffered NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Courses_Departments FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
);

CREATE TABLE Lecturers (
    LecturerID INT IDENTITY(1,1) PRIMARY KEY,
    StaffNo NVARCHAR(30) NOT NULL UNIQUE,
    FullName NVARCHAR(120) NOT NULL,
    DeptID INT NOT NULL,
    [Rank] NVARCHAR(50) NULL,
    CONSTRAINT FK_Lecturers_Departments FOREIGN KEY (DeptID) REFERENCES Departments(DeptID)
);

CREATE TABLE Enrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    SemesterID INT NOT NULL,
    EnrollmentDate DATE NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Enrollments_Students FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    CONSTRAINT FK_Enrollments_Semesters FOREIGN KEY (SemesterID) REFERENCES Semesters(SemesterID),
    CONSTRAINT UQ_Enrollments UNIQUE(StudentID, SemesterID)
);

CREATE TABLE Results (
    ResultID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    CourseID INT NOT NULL,
    SemesterID INT NOT NULL,
    Score DECIMAL(5,2) NOT NULL CHECK (Score BETWEEN 0 AND 100),
    LetterGrade CHAR(1) NOT NULL,
    GradePoint DECIMAL(3,2) NOT NULL CHECK (GradePoint BETWEEN 0 AND 5),
    CONSTRAINT FK_Results_Students FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    CONSTRAINT FK_Results_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    CONSTRAINT FK_Results_Semesters FOREIGN KEY (SemesterID) REFERENCES Semesters(SemesterID),
    CONSTRAINT UQ_Results UNIQUE(StudentID, CourseID, SemesterID)
);

CREATE TABLE CourseAssignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    LecturerID INT NOT NULL,
    SemesterID INT NOT NULL,
    CONSTRAINT FK_CourseAssignments_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
    CONSTRAINT FK_CourseAssignments_Lecturers FOREIGN KEY (LecturerID) REFERENCES Lecturers(LecturerID),
    CONSTRAINT FK_CourseAssignments_Semesters FOREIGN KEY (SemesterID) REFERENCES Semesters(SemesterID)
);

CREATE TABLE GPAHistory (
    GPAHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    SemesterID INT NOT NULL,
    SemesterGPA DECIMAL(4,2) NOT NULL,
    CGPA DECIMAL(4,2) NOT NULL,
    CalculatedOn DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_GPAHistory_Students FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    CONSTRAINT FK_GPAHistory_Semesters FOREIGN KEY (SemesterID) REFERENCES Semesters(SemesterID),
    CONSTRAINT UQ_GPAHistory UNIQUE(StudentID, SemesterID)
);

CREATE TABLE RiskFlags (
    RiskID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL,
    SemesterID INT NOT NULL,
    CGPA DECIMAL(4,2) NOT NULL,
    RiskLevel NVARCHAR(20) NOT NULL,
    RiskReason NVARCHAR(255) NOT NULL,
    FlagDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RiskFlags_Students FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    CONSTRAINT FK_RiskFlags_Semesters FOREIGN KEY (SemesterID) REFERENCES Semesters(SemesterID)
);
```

## 3.3 Sample INSERT Statements
```sql
INSERT INTO Departments (DeptName, Faculty) VALUES
('Computer Science', 'Science'),
('Information Systems', 'Computing');

INSERT INTO Programs (ProgramName, LevelType, DeptID) VALUES
('BSc Computer Science', 'Undergraduate', 1),
('BSc Information Systems', 'Undergraduate', 2);

INSERT INTO Semesters (SessionName, TermName, StartDate, EndDate) VALUES
('2025/2026', 'First', '2025-09-15', '2026-01-20'),
('2025/2026', 'Second', '2026-02-15', '2026-06-25');

INSERT INTO Students (MatricNo, FirstName, LastName, Gender, DOB, DeptID, ProgramID, EntryYear)
VALUES ('CSC/23/001', 'Amina', 'Yusuf', 'F', '2005-04-22', 1, 1, 2023);
```

## 3.4 Stored Procedure: GPA Calculation
```sql
CREATE OR ALTER PROCEDURE sp_CalculateStudentGPA
    @StudentID INT,
    @SemesterID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SemesterGPA DECIMAL(4,2), @CGPA DECIMAL(4,2);

    ;WITH SemResult AS (
        SELECT r.StudentID,
               r.SemesterID,
               SUM(r.GradePoint * c.CreditUnit) AS TotalQuality,
               SUM(c.CreditUnit) AS TotalCredits
        FROM Results r
        INNER JOIN Courses c ON r.CourseID = c.CourseID
        WHERE r.StudentID = @StudentID AND r.SemesterID = @SemesterID
        GROUP BY r.StudentID, r.SemesterID
    ), CumResult AS (
        SELECT r.StudentID,
               SUM(r.GradePoint * c.CreditUnit) AS CumQuality,
               SUM(c.CreditUnit) AS CumCredits
        FROM Results r
        INNER JOIN Courses c ON r.CourseID = c.CourseID
        WHERE r.StudentID = @StudentID
        GROUP BY r.StudentID
    )
    SELECT
        @SemesterGPA = CAST(s.TotalQuality / NULLIF(s.TotalCredits, 0) AS DECIMAL(4,2)),
        @CGPA = CAST(cu.CumQuality / NULLIF(cu.CumCredits, 0) AS DECIMAL(4,2))
    FROM SemResult s
    CROSS JOIN CumResult cu;

    MERGE GPAHistory AS target
    USING (SELECT @StudentID AS StudentID, @SemesterID AS SemesterID) AS src
    ON target.StudentID = src.StudentID AND target.SemesterID = src.SemesterID
    WHEN MATCHED THEN
        UPDATE SET SemesterGPA = @SemesterGPA,
                   CGPA = @CGPA,
                   CalculatedOn = SYSDATETIME()
    WHEN NOT MATCHED THEN
        INSERT (StudentID, SemesterID, SemesterGPA, CGPA)
        VALUES (@StudentID, @SemesterID, @SemesterGPA, @CGPA);
END;
```

## 3.5 Stored Procedure: Risk Detection
```sql
CREATE OR ALTER PROCEDURE sp_DetectAcademicRisk
    @StudentID INT,
    @SemesterID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CGPA DECIMAL(4,2),
            @RiskLevel NVARCHAR(20),
            @RiskReason NVARCHAR(255),
            @FailedCourses INT;

    SELECT @CGPA = CGPA
    FROM GPAHistory
    WHERE StudentID = @StudentID AND SemesterID = @SemesterID;

    SELECT @FailedCourses = COUNT(*)
    FROM Results
    WHERE StudentID = @StudentID
      AND SemesterID = @SemesterID
      AND GradePoint = 0;

    IF @CGPA < 1.50
    BEGIN
        SET @RiskLevel = 'High';
        SET @RiskReason = 'CGPA below 1.50';
    END
    ELSE IF @CGPA < 2.00
    BEGIN
        SET @RiskLevel = 'Moderate';
        SET @RiskReason = 'CGPA between 1.50 and 1.99';
    END
    ELSE
    BEGIN
        SET @RiskLevel = 'Low';
        SET @RiskReason = 'CGPA 2.00 and above';
    END

    IF @FailedCourses >= 2
        SET @RiskReason = CONCAT(@RiskReason, '; Multiple failed courses in semester');

    INSERT INTO RiskFlags (StudentID, SemesterID, CGPA, RiskLevel, RiskReason)
    VALUES (@StudentID, @SemesterID, @CGPA, @RiskLevel, @RiskReason);
END;
```

## 3.6 SQL Views for Tableau
```sql
CREATE OR ALTER VIEW vw_StudentPerformanceSummary AS
SELECT s.StudentID,
       s.MatricNo,
       CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
       d.DeptName,
       p.ProgramName,
       gh.SemesterID,
       sem.SessionName,
       sem.TermName,
       gh.SemesterGPA,
       gh.CGPA
FROM GPAHistory gh
JOIN Students s ON gh.StudentID = s.StudentID
JOIN Departments d ON s.DeptID = d.DeptID
JOIN Programs p ON s.ProgramID = p.ProgramID
JOIN Semesters sem ON gh.SemesterID = sem.SemesterID;

CREATE OR ALTER VIEW vw_CoursePassRate AS
SELECT c.CourseCode,
       c.CourseTitle,
       sem.SessionName,
       sem.TermName,
       COUNT(*) AS TotalSits,
       SUM(CASE WHEN r.GradePoint > 0 THEN 1 ELSE 0 END) AS PassCount,
       CAST(100.0 * SUM(CASE WHEN r.GradePoint > 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0) AS DECIMAL(5,2)) AS PassRate
FROM Results r
JOIN Courses c ON r.CourseID = c.CourseID
JOIN Semesters sem ON r.SemesterID = sem.SemesterID
GROUP BY c.CourseCode, c.CourseTitle, sem.SessionName, sem.TermName;

CREATE OR ALTER VIEW vw_RiskDistribution AS
SELECT rf.RiskLevel,
       sem.SessionName,
       sem.TermName,
       COUNT(*) AS StudentCount
FROM RiskFlags rf
JOIN Semesters sem ON rf.SemesterID = sem.SemesterID
GROUP BY rf.RiskLevel, sem.SessionName, sem.TermName;
```

---

## Phase 4: Tableau Dashboard Prototypes

## 4.1 Student Enrolment Overview
- **KPIs**: Total students, New entrants, Active students, Department count.
- **Charts**: line chart (enrolment trend), stacked bar (program vs level), map/treemap (department share).
- **Filters**: Session, Department, Program, Gender.
- **Drill-down**: Department → Program → student list.
- **Insight goal**: detect growth/decline and allocation pressure.

## 4.2 GPA Distribution Analysis
- **KPIs**: Mean GPA, Median GPA, % above 3.50, % below 2.00.
- **Charts**: histogram, box plot by department, trend line by semester.
- **Filters**: Session, Semester, Department, Level.
- **Drill-down**: GPA band → student details.
- **Insight goal**: identify achievement spread and disparity.

## 4.3 Course Pass Rate Analytics
- **KPIs**: Overall pass rate, course with lowest pass rate, repeat-course volume.
- **Charts**: heatmap (course vs semester pass rates), bar chart ranked by pass rate.
- **Filters**: Department, Lecturer, Semester.
- **Drill-down**: Course → lecturer → student attempts.
- **Insight goal**: pinpoint difficult courses and intervention needs.

## 4.4 At-Risk Student Dashboard
- **KPIs**: High-risk count, Moderate-risk count, trend in risk movement.
- **Charts**: risk-level donut, trend area chart, risk reason bar chart.
- **Table**: flagged students with CGPA, failed courses, adviser status.
- **Filters**: Department, Session, RiskLevel.
- **Insight goal**: prioritize advising actions and monitor outcomes.

## 4.5 Lecturer Performance Dashboard
- **KPIs**: Mean course pass rate by lecturer, average class GPA, flagged courses.
- **Charts**: bar chart by lecturer, scatter (class size vs pass rate), trend line over semesters.
- **Filters**: Department, Semester, Course level.
- **Drill-down**: Lecturer → course → result distribution.
- **Insight goal**: support teaching quality review and targeted support.

### Visual Design Suggestions (All Dashboards)
- Use 1 primary and 1 accent color family.
- Keep KPI cards at top row for immediate interpretation.
- Keep consistent typography and spacing.
- Use red/amber/green only for risk semantics.

---

## Phase 5: Viva Preparation Pack

## 5.1 Likely Viva Questions + Sample Answers

### Q1. Why normalization?
- **Simple**: To reduce repeated data and prevent contradictory records.
- **Technical**: 3NF separation of entities minimizes update/insert/delete anomalies while preserving join-based retrieval.
- **Defense answer**: “We normalized to 3NF so student, course, semester, and result facts remain consistent and auditable.”

### Q2. Why SQL Server?
- **Simple**: Reliable enterprise-grade database with strong query features.
- **Technical**: Supports stored procedures, constraints, indexing, and security suitable for transactional academic systems.
- **Defense answer**: “SQL Server enabled dependable data integrity and server-side GPA/risk logic via stored procedures.”

### Q3. Why Tableau?
- **Simple**: It turns database records into easy-to-understand visuals.
- **Technical**: Connects directly to SQL views, enabling governed analytics with interactive drill-down.
- **Defense answer**: “Tableau provided fast dashboard prototyping and stakeholder-friendly analytics.”

### Q4. How is GPA calculated?
- **Simple**: Multiply grade points by course credits, sum, divide by total credits.
- **Technical**: Computed via `SUM(GradePoint*CreditUnit)/SUM(CreditUnit)` in procedure-level logic.
- **Defense answer**: “GPA and CGPA are computed centrally in SQL procedures for consistency and reproducibility.”

### Q5. Why stored procedures?
- **Simple**: To keep critical calculations in one controlled place.
- **Technical**: Centralized business rules reduce application duplication and improve maintainability/security.
- **Defense answer**: “Procedures ensure all clients apply exactly the same GPA/risk logic.”

### Q6. What is referential integrity?
- **Simple**: Links between tables that prevent invalid records.
- **Technical**: FK constraints enforce parent-child consistency (e.g., results cannot exist for unknown students).
- **Defense answer**: “Referential integrity guarantees data trustworthiness for analytics outputs.”

### Q7. Why SQL views for Tableau?
- **Simple**: To give dashboards clean, ready-to-use data.
- **Technical**: Views abstract joins/derivations and expose stable semantics for BI tooling.
- **Defense answer**: “Views decouple analytics from raw transactional complexity.”

### Q8. How does risk detection work?
- **Simple**: Students are flagged by CGPA thresholds and fail counts.
- **Technical**: Procedure assigns High/Moderate/Low risk and records reasons in RiskFlags.
- **Defense answer**: “Rule-based detection is transparent, explainable, and appropriate for undergraduate scope.”

### Q9. Why dashboard analytics matter?
- **Simple**: Faster decisions and earlier interventions.
- **Technical**: Aggregated KPIs + drill-down reveal cohort trends and outliers not obvious in row-level reports.
- **Defense answer**: “Dashboards transform operational data into actionable academic intelligence.”

### Q10. Explain your system architecture.
- **Simple**: App captures data, SQL processes it, Tableau visualizes it.
- **Technical**: Layered architecture isolates UI, business services, data management, and analytics consumption.
- **Defense answer**: “Layered separation improves maintainability, testing, and scalability.”

---

## Phase 6: Preliminary Pages, Formatting, and Presentation

## 6.1 Abstract (Improved)
This project presents the design and implementation of a Student Management and Academic Performance Analysis System using Microsoft SQL Server and Tableau. The system integrates student records, course management, result processing, GPA/CGPA computation, and academic risk detection in a unified framework. A normalized relational schema is implemented to ensure data integrity and reduce redundancy, while stored procedures automate core academic calculations and risk classification. SQL views provide curated datasets for Tableau dashboards that support enrollment monitoring, GPA distribution analysis, course pass-rate tracking, and identification of at-risk students. The project demonstrates how transactional data can be transformed into actionable insights for administrators, lecturers, and academic advisers. The solution is practical, scalable for departmental deployment, and suitable for improving evidence-based academic decision-making in higher education.

## 6.2 Dedication (Sample)
This work is dedicated to my parents, mentors, and all students whose persistence and curiosity continue to inspire meaningful innovation in education.

## 6.3 Acknowledgements (Sample)
I sincerely thank my project supervisor for continuous guidance, my lecturers for their academic support, and my colleagues for constructive feedback throughout this project. I also appreciate my family for their encouragement and patience during the research and implementation process.

## 6.4 Table of Contents Structure
1. Preliminary Pages
2. Chapter One: Introduction
3. Chapter Two: Literature Review and Comparative Analysis
4. Chapter Three: Methodology
5. Chapter Four: System Design and Implementation
6. Chapter Five: Results, Dashboards, and Discussion
7. Chapter Six: Conclusion and Recommendations
8. References
9. Appendices

## 6.5 List of Figures (Template)
- Figure 4.1: System Architecture Diagram
- Figure 4.2: Entity Relationship Diagram
- Figure 4.3: Use Case Diagram
- Figure 4.4: GPA Computation Workflow
- Figure 4.5: Risk Detection Workflow
- Figure 5.1–5.5: Tableau Dashboard Prototypes

## 6.6 List of Tables (Template)
- Table 2.1: Comparative Literature Review Matrix
- Table 4.1: Database Table Specifications
- Table 4.2: Key Constraints and Relationships
- Table 5.1: Dashboard KPI Definitions

## 6.7 Acronyms/Abbreviations
- DBMS: Database Management System
- ERD: Entity Relationship Diagram
- FK: Foreign Key
- GPA: Grade Point Average
- CGPA: Cumulative Grade Point Average
- KPI: Key Performance Indicator
- OLTP: Online Transaction Processing
- SIS: Student Information System
- SQL: Structured Query Language

## 6.8 Numbering and Formatting Consistency
- Use multilevel heading numbering (e.g., 2.3.1).
- Figure/table numbers tied to chapter numbers.
- Uniform caption style: bold label + sentence case title.
- Consistent margins, line spacing, and font.

## 6.9 Page Layout Recommendations
- A4 paper.
- Margins: Left 1.5 in, others 1 in (binding-friendly).
- Font: Times New Roman 12 pt.
- Line spacing: 1.5.
- Page numbers: bottom center/right.

## 6.10 Printing and Binding Suggestions
- Print draft in grayscale for proofreading, final in color for dashboards.
- Use 100gsm paper for final copy if possible.
- Spiral for draft review; hard cover for final submission.
- Verify color contrast in risk dashboard (especially red/amber/green legibility).
