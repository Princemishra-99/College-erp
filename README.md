# AI-Integrated Multilingual College ERP System 🎓
> **Built for University Project Submission & Viva Evaluation**  
> Powered by **MERN Stack (MongoDB, Express, React, Node.js)** & **Sarvam Indic AI**

---

## 📌 College Submission Compliance (As per Notice Guidelines)

| Guideline Requirement | Project Specification | Details |
| :--- | :--- | :--- |
| **1️⃣ Mode of Deployment** | **Web Application** | Modern Single-Page Web Application (React + Vite + REST APIs) accessible via any standard browser. |
| **2️⃣ Type of Database Used** | **Non-Relational (NoSQL)** | **MongoDB** with Mongoose ODM. Data stored as JSON/BSON documents in Collections. |
| **3️⃣ Special AI Integration** | **Sarvam Indic AI** | Multilingual campus chatbot ("Campus Sahayak") supporting Hindi/Hinglish and 1-click notice translator. |

---

## 🗄️ Database Representation (MongoDB Collections & Schema)

College presentation / synopsis ke liye schema table:

### 1. `users` Collection (Authentication & Access Control)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key (Auto) | Unique user ID |
| `name` | String | Required | Full name of user |
| `email` | String | Required, Unique | Login email identifier |
| `password` | String | Hashed (Bcrypt) | Encrypted password |
| `role` | String | `admin`, `faculty`, `student` | Role-based access control |
| `isActive` | Boolean | Default: `true` | Account status |

### 2. `students` Collection (Student Academic Records)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique student ID |
| `userId` | ObjectId | Ref: `users` | Linked authentication account |
| `enrollmentNo`| String | Required, Unique | College Roll / Enrollment number |
| `department` | String | Required | Department (e.g. CSE, IT, ECE) |
| `semester` | Number | 1 to 8 | Current enrolled semester |
| `section` | String | Default: 'A' | Class section |
| `phone` | String | Required | Student mobile number |
| `guardianName`| String | Required | Parent / Guardian name |

### 3. `faculties` Collection (Teachers & Course Allotment)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Unique faculty ID |
| `userId` | ObjectId | Ref: `users` | Linked user account |
| `employeeId` | String | Required, Unique | Faculty Employee ID |
| `department` | String | Required | Teaching department |
| `designation` | String | Required | Professor / Asst. Professor / HOD |
| `assignedSubjects`| Array[ObjectId] | Ref: `subjects` | Allocated syllabus courses |

### 4. `subjects` Collection (Curriculum Syllabus)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Course ID |
| `subjectCode` | String | Required, Unique | Course Code (e.g. CS401, CS402) |
| `subjectName` | String | Required | Course Name |
| `department` | String | Required | Target branch |
| `semester` | Number | Required | Target semester |
| `credits` | Number | Default: 4 | Academic credit points |
| `facultyId` | ObjectId | Ref: `faculties` | Assigned teacher lead |

### 5. `attendances` Collection (Daily Class Attendance)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Attendance record ID |
| `studentId` | ObjectId | Ref: `students` | Student reference |
| `subjectId` | ObjectId | Ref: `subjects` | Subject reference |
| `facultyId` | ObjectId | Ref: `faculties` | Faculty who marked |
| `date` | Date | Required | Lecture date |
| `status` | String | `Present`, `Absent` | Attendance state |

*(Compound Index: `studentId + subjectId + date` prevents duplicate marking).*

### 6. `marks` Collection (Examinations & Grades)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Marks entry ID |
| `studentId` | ObjectId | Ref: `students` | Student reference |
| `subjectId` | ObjectId | Ref: `subjects` | Subject reference |
| `examType` | String | `MidSem1`, `MidSem2`, `EndSem` | Examination category |
| `marksObtained`| Number | Min: 0 | Scored marks |
| `maxMarks` | Number | Default: 100 | Maximum total |
| `grade` | String | Auto-calculated | Letter grade (A+, A, B+, B, C, P, F) |

### 7. `fees` Collection (Tuition Ledger & Receipts)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Fee ledger entry |
| `studentId` | ObjectId | Ref: `students` | Student reference |
| `semester` | Number | Required | Target semester |
| `totalAmount` | Number | Required | Total prescribed fees |
| `paidAmount` | Number | Default: 0 | Total paid so far |
| `dueAmount` | Number | Auto-calculated | Remaining outstanding balance |
| `status` | String | `Paid`, `Partial`, `Pending` | Payment status |
| `receiptNo` | String | Unique | Official receipt reference |

### 8. `notices` Collection (Campus Circulars)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Circular ID |
| `title` | String | Required | Circular heading |
| `content` | String | Required | Detailed circular text |
| `postedBy` | ObjectId | Ref: `users` | Publisher |
| `targetRole` | String | `all`, `student`, `faculty` | Targeted audience |
| `category` | String | `General`, `Exam`, `Academic`, `Fee` | Category tag |
| `isPinned` | Boolean | Default: `false` | Pinned priority |

---

## ⚡ Quick Start & Run Instructions

### Step 1: Start Backend API
Open a terminal in the `server` directory:
```bash
cd server
npm start
```
* Backend runs at: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/health`

### Step 2: Seed Sample Data (Viva Ready in 1-Click)
In the `server` directory:
```bash
npm run seed
```
> This instantly creates 1 Admin, 2 Faculty members, 5 Students with realistic attendance, exam marks, tuition fees, and notices!

### Step 3: Start React Client
Open a second terminal in the `client` directory:
```bash
cd client
npm run dev
```
* Web Portal runs at: `http://localhost:5173`

---

## 🔑 Default Test Logins (1-Click Fill Available on Login Page)

| Role | Email | Password | What to Demo |
| :--- | :--- | :--- | :--- |
| **Dean / Admin** | `admin@college.edu` | `Admin@123` | Dashboard analytics, Add students, Fee ledger, Broadcast notices |
| **Faculty Member** | `faculty.sharma@college.edu` | `Faculty@123` | Mark attendance, Upload examination marks, View assigned classes |
| **Student (Safe)** | `rahul@student.edu` | `Student@123` | Attendance > 75%, Download PDF Marksheet, Download PDF Fee Receipt |
| **Student (Defaulter)**| `amit@student.edu` | `Student@123` | Attendance < 75% (**Defaulter Warning Banner** demo) |

---

## 🤖 Sarvam Indic AI Features

1. **Campus Sahayak Chatbot (कैंपस सहायक)**:
   - Interactive AI helpdesk widget in the portal.
   - Answers student and parent questions in **Hindi, Hinglish, or English**.
   - Questions handled: Minimum 75% attendance rule, semester fee deadlines, exam passing grades, library timings.
2. **1-Click Notice Translator**:
   - English notices are translated into formal Hindi with one click.
3. **AI Bullet Summarizer (TL;DR)**:
   - Automatically generates quick 3-bullet summaries of lengthy circulars.
4. **API Key Setup**:
   - In `server/.env`, set:
     ```env
     SARVAM_API_KEY=your_sarvam_api_key_here
     ```
   - If the API key is empty or in development mode, the built-in smart campus engine provides immediate simulated responses so your live demonstration never stops.

---

## 📜 MongoDB Viva Commands Cheatsheet

For examination evaluation in terminal:
```bash
# Connect to Mongo Shell
mongosh

# Switch to database
use college_erp;

# Display all collections (Required by College Notice)
show collections;

# Query collections
db.students.find().pretty();
db.attendances.find({ status: "Absent" }).count();
db.fees.find({ status: "Pending" });
```
