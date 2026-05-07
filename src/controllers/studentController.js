const { createStudent, getStudentByUserId } = require('../models/studentModel');

async function registerStudent(req, res) {
  try {
    const userId = req.user.id;
    const { studentId, department, year } = req.body;

    if (!studentId || !department || !year) {
      return res.status(400).json({ message: 'studentId, department, and year are required' });
    }

    const existing = await getStudentByUserId(userId);
    if (existing) {
      return res.status(409).json({ message: 'Student profile already exists for this user' });
    }

    const id = await createStudent({ userId, studentId, department, year });
    return res.status(201).json({ message: 'Student registration successful', id });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  registerStudent
};
