const pool = require('../config/db');

async function listCourses() {
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY id DESC');
  return rows;
}

async function registerCourse(studentId, courseId) {
  const [result] = await pool.query(
    'INSERT INTO course_registrations (student_id, course_id) VALUES (?, ?)',
    [studentId, courseId]
  );
  return result.insertId;
}

module.exports = {
  listCourses,
  registerCourse
};
