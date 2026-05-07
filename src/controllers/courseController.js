const { listCourses, registerCourse } = require('../models/courseModel');
const { getStudentByUserId } = require('../models/studentModel');

async function getCourses(req, res) {
  try {
    const courses = await listCourses();
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function registerForCourse(req, res) {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const student = await getStudentByUserId(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Register as student first.' });
    }

    const id = await registerCourse(student.id, courseId);
    return res.status(201).json({ message: 'Course registration successful', id });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already registered for this course' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getCourses,
  registerForCourse
};
