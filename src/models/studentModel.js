const pool = require('../config/db');

async function createStudent({ userId, studentId, department, year }) {
  const [result] = await pool.query(
    'INSERT INTO students (user_id, student_id, department, year) VALUES (?, ?, ?, ?)',
    [userId, studentId, department, year]
  );
  return result.insertId;
}

async function getStudentByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

module.exports = {
  createStudent,
  getStudentByUserId
};
