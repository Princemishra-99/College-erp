import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore
}

import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Subject } from '../models/Subject.js';
import { Attendance } from '../models/Attendance.js';
import { Mark } from '../models/Mark.js';
import { Fee } from '../models/Fee.js';
import { Notice } from '../models/Notice.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_erp';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB at', mongoUri);

    // Clear existing records
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});
    await Fee.deleteMany({});
    await Notice.deleteMany({});
    console.log('[Seeder] Cleared previous database records.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Dr. S.K. Banerjee (Dean & Admin)',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
    });

    // 2. Create Faculty Users & Profiles
    const facultyUser1 = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'faculty.sharma@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
    });

    const faculty1 = await Faculty.create({
      userId: facultyUser1._id,
      employeeId: 'FAC-CSE-001',
      department: 'Computer Science & Engg',
      designation: 'Head of Department',
      qualification: 'Ph.D in Computer Science, IIT Roorkee',
      experienceYears: 14,
      phone: '+91 98765 43210',
    });

    const facultyUser2 = await User.create({
      name: 'Prof. Priya Verma',
      email: 'faculty.priya@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
    });

    const faculty2 = await Faculty.create({
      userId: facultyUser2._id,
      employeeId: 'FAC-CSE-002',
      department: 'Computer Science & Engg',
      designation: 'Assistant Professor',
      qualification: 'M.Tech CSE, NIT Trichy',
      experienceYears: 5,
      phone: '+91 98111 22334',
    });

    // 3. Create Subjects
    const sub1 = await Subject.create({
      subjectCode: 'CS401',
      subjectName: 'Design & Analysis of Algorithms',
      department: 'Computer Science & Engg',
      semester: 4,
      credits: 4,
      facultyId: faculty1._id,
    });

    const sub2 = await Subject.create({
      subjectCode: 'CS402',
      subjectName: 'Database Management Systems',
      department: 'Computer Science & Engg',
      semester: 4,
      credits: 4,
      facultyId: faculty2._id,
    });

    const sub3 = await Subject.create({
      subjectCode: 'CS403',
      subjectName: 'Operating Systems',
      department: 'Computer Science & Engg',
      semester: 4,
      credits: 4,
      facultyId: faculty1._id,
    });

    const sub4 = await Subject.create({
      subjectCode: 'CS404',
      subjectName: 'Computer Networks',
      department: 'Computer Science & Engg',
      semester: 4,
      credits: 3,
      facultyId: faculty2._id,
    });

    // Update faculty assigned subjects
    await Faculty.findByIdAndUpdate(faculty1._id, { assignedSubjects: [sub1._id, sub3._id] });
    await Faculty.findByIdAndUpdate(faculty2._id, { assignedSubjects: [sub2._id, sub4._id] });

    // 4. Create Students
    const studentData = [
      {
        name: 'Rahul Verma',
        email: 'rahul@student.edu',
        enrollmentNo: '23CSE001',
        phone: '+91 91234 56780',
        guardianName: 'Ramesh Verma',
        guardianPhone: '+91 98765 00001',
        feePaid: 45000,
        feeTotal: 45000,
        isDefaulter: false,
      },
      {
        name: 'Ananya Singh',
        email: 'ananya@student.edu',
        enrollmentNo: '23CSE002',
        phone: '+91 91234 56781',
        guardianName: 'Vikram Singh',
        guardianPhone: '+91 98765 00002',
        feePaid: 25000,
        feeTotal: 45000,
        isDefaulter: false,
      },
      {
        name: 'Amit Kumar',
        email: 'amit@student.edu',
        enrollmentNo: '23CSE003',
        phone: '+91 91234 56782',
        guardianName: 'Sunil Kumar',
        guardianPhone: '+91 98765 00003',
        feePaid: 0,
        feeTotal: 45000,
        isDefaulter: true, // Will have <75% attendance for demo
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@student.edu',
        enrollmentNo: '23CSE004',
        phone: '+91 91234 56783',
        guardianName: 'Kiran Patel',
        guardianPhone: '+91 98765 00004',
        feePaid: 45000,
        feeTotal: 45000,
        isDefaulter: false,
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan@student.edu',
        enrollmentNo: '23CSE005',
        phone: '+91 91234 56784',
        guardianName: 'Deepak Gupta',
        guardianPhone: '+91 98765 00005',
        feePaid: 20000,
        feeTotal: 45000,
        isDefaulter: false,
      },
    ];

    const createdStudents = [];
    const subjectsList = [sub1, sub2, sub3, sub4];

    for (const item of studentData) {
      const u = await User.create({
        name: item.name,
        email: item.email,
        password: 'Student@123',
        role: 'student',
      });

      const s = await Student.create({
        userId: u._id,
        enrollmentNo: item.enrollmentNo,
        department: 'Computer Science & Engg',
        semester: 4,
        section: 'A',
        phone: item.phone,
        guardianName: item.guardianName,
        guardianPhone: item.guardianPhone,
        batchYear: '2023-2027',
      });

      createdStudents.push({ student: s, meta: item });

      // Fee Record
      const isPaid = item.feePaid >= item.feeTotal;
      const isPartial = item.feePaid > 0 && !isPaid;
      await Fee.create({
        studentId: s._id,
        semester: 4,
        totalAmount: item.feeTotal,
        paidAmount: item.feePaid,
        dueAmount: item.feeTotal - item.feePaid,
        status: isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending',
        receiptNo: item.feePaid > 0 ? `REC-2026-${s.enrollmentNo}` : undefined,
        paymentDate: item.feePaid > 0 ? new Date() : undefined,
        paymentMode: 'Online (UPI/Card)',
      });

      // Marks Records
      const scoreBase = item.isDefaulter ? 52 : 82;
      for (const sub of subjectsList) {
        await Mark.create({
          studentId: s._id,
          subjectId: sub._id,
          examType: 'MidSem1',
          marksObtained: scoreBase + Math.floor(Math.random() * 12),
          maxMarks: 100,
        });
      }
    }

    // 5. Generate Attendance Records across last 12 days
    const today = new Date();
    for (let dayOffset = 12; dayOffset >= 1; dayOffset--) {
      const attDate = new Date(today);
      attDate.setDate(today.getDate() - dayOffset);
      attDate.setHours(0, 0, 0, 0);

      // Skip Sunday
      if (attDate.getDay() === 0) continue;

      for (const item of createdStudents) {
        for (const sub of subjectsList) {
          // If defaulter student (Amit), give 40% absent rate, else 90% present rate
          const isAbsent = item.meta.isDefaulter
            ? Math.random() < 0.45
            : Math.random() < 0.08;

          await Attendance.create({
            studentId: item.student._id,
            subjectId: sub._id,
            facultyId: sub.facultyId,
            date: attDate,
            status: isAbsent ? 'Absent' : 'Present',
          });
        }
      }
    }

    // 6. Notices
    await Notice.create({
      title: 'End-Semester Examination Schedule - Summer 2026',
      content:
        'All undergraduate students are informed that the End-Semester Examination timetable for all B.Tech branches has been declared. Examinations commence from 25th May 2026. Hall tickets will be issued only to candidates having at least 75% attendance.',
      postedBy: adminUser._id,
      targetRole: 'all',
      category: 'Exam',
      isPinned: true,
    });

    await Notice.create({
      title: 'Semester Fee Payment Deadline Notice',
      content:
        'All enrolled students must clear their semester tuition fee dues on or before 15th April 2026. Payments can be submitted directly through the online College ERP portal.',
      postedBy: adminUser._id,
      targetRole: 'student',
      category: 'Fee',
      isPinned: true,
    });

    await Notice.create({
      title: 'Faculty Meeting: NAAC Accreditation Review',
      content:
        'There will be a mandatory faculty council meeting in the Conference Hall on Friday at 3:00 PM to review department documentation for the upcoming NAAC accreditation.',
      postedBy: adminUser._id,
      targetRole: 'faculty',
      category: 'Academic',
      isPinned: false,
    });

    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Default Test Credentials:');
    console.log('👉 Admin:   admin@college.edu            / Admin@123');
    console.log('👉 Faculty: faculty.sharma@college.edu   / Faculty@123');
    console.log('👉 Student: rahul@student.edu            / Student@123');
    console.log('👉 Defaulter Student (Attendance < 75%): amit@student.edu / Student@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
