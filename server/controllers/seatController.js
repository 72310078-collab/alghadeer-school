const db = require('../config/database');

db.query(`
  CREATE TABLE IF NOT EXISTS classrooms (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    class_id    INT NOT NULL UNIQUE,
    rows_count  INT NOT NULL DEFAULT 5,
    cols_count  INT NOT NULL DEFAULT 6,
    notes       VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  )
`, err => { if (err) console.error('classrooms table:', err.message); });

db.query(`
  CREATE TABLE IF NOT EXISTS class_seat_allocations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    class_id    INT NOT NULL,
    student_id  INT NOT NULL,
    seat_number INT NOT NULL,
    row_num     INT NOT NULL,
    col_num     INT NOT NULL,
    health_type ENUM('none','vision','hearing','mobility','other') DEFAULT 'none',
    health_note VARCHAR(255),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student    (student_id),
    UNIQUE KEY uq_class_seat (class_id, row_num, col_num),
    FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE
  )
`, err => { if (err) console.error('class_seat_allocations table:', err.message); });

exports.getClassroom = (req, res) => {
  db.query('SELECT * FROM classrooms WHERE class_id = ?', [req.params.class_id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data[0] || null);
  });
};

exports.saveClassroom = (req, res) => {
  const { class_id, rows_count, cols_count, notes } = req.body;
  if (!class_id || !rows_count || !cols_count)
    return res.status(400).json({ message: 'class_id والأبعاد مطلوبة' });

  const q = `
    INSERT INTO classrooms (class_id, rows_count, cols_count, notes)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE rows_count = VALUES(rows_count), cols_count = VALUES(cols_count), notes = VALUES(notes)
  `;
  db.query(q, [class_id, rows_count, cols_count, notes || null], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    db.query('SELECT * FROM classrooms WHERE class_id = ?', [class_id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
      res.json(rows[0]);
    });
  });
};

exports.getAllocations = (req, res) => {
  const q = `
    SELECT csa.*,
           u.name AS student_name,
           ROUND(AVG(g.score / g.max_score * 100), 1) AS avg_score
    FROM class_seat_allocations csa
    JOIN users u ON u.id = csa.student_id
    LEFT JOIN subjects sub ON sub.class_id = csa.class_id
    LEFT JOIN grades   g   ON g.student_id = csa.student_id AND g.subject_id = sub.id
    WHERE csa.class_id = ?
    GROUP BY csa.id, csa.class_id, csa.student_id, csa.seat_number,
             csa.row_num, csa.col_num, csa.health_type, csa.health_note,
             csa.assigned_at, u.name
    ORDER BY csa.row_num, csa.col_num
  `;
  db.query(q, [req.params.class_id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.generateAllocations = (req, res) => {
  const { class_id, students: healthData = [] } = req.body;
  if (!class_id) return res.status(400).json({ message: 'class_id مطلوب' });

  db.query('SELECT * FROM classrooms WHERE class_id = ?', [class_id], (err, rooms) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (!rooms.length)
      return res.status(404).json({ message: 'لم يتم تعريف تخطيط الغرفة بعد. أضف تخطيط الصف أولاً.' });

    const room       = rooms[0];
    const totalSeats = room.rows_count * room.cols_count;

    db.query(
      `SELECT id, name FROM users WHERE class_id = ? AND role = 'student' ORDER BY name`,
      [class_id],
      (err, students) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
        if (students.length > totalSeats)
          return res.status(400).json({
            message: `عدد الطلاب (${students.length}) أكبر من المقاعد المتاحة (${totalSeats})`
          });

        db.query(
          `SELECT g.student_id,
                  ROUND(AVG(g.score / g.max_score * 100), 1) AS avg_score
           FROM grades g
           JOIN subjects s ON s.id = g.subject_id
           WHERE s.class_id = ?
           GROUP BY g.student_id`,
          [class_id],
          (err, gradeRows) => {
            if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

            const gradeMap = {};
            gradeRows.forEach(g => { gradeMap[g.student_id] = parseFloat(g.avg_score); });

            const healthMap = {};
            healthData.forEach(h => { healthMap[h.id] = h; });

            const enriched = students.map(s => ({
              ...s,
              health_type: healthMap[s.id]?.health_type || 'none',
              health_note: healthMap[s.id]?.health_note || null,
              avg_score:   gradeMap[s.id] ?? null,
            }));

            const neededRows = Math.min(
              room.rows_count,
              Math.ceil(enriched.length / room.cols_count)
            );

            const seats = [];
            for (let r = 1; r <= neededRows; r++)
              for (let c = 1; c <= room.cols_count; c++)
                seats.push({ row: r, col: c });

            const midCol     = Math.ceil(room.cols_count / 2);
            const frontLimit = Math.max(1, Math.ceil(neededRows * 0.4));
            const midLimit   = Math.max(frontLimit + 1, Math.ceil(neededRows * 0.7));

            const isFront = s => s.row <= frontLimit;
            const isMid   = s => s.row > frontLimit && s.row <= midLimit;
            const isBack  = s => s.row > midLimit;
            const isSide  = s => s.col <= 2 || s.col >= room.cols_count - 1;
            const isAisle = s => s.col === 1 || s.col === room.cols_count;

            const frontSeats     = seats.filter(s => isFront(s));
            const frontSideSeats = seats.filter(s => isFront(s) || isSide(s));
            const aisleSeats     = seats.filter(s => isAisle(s));
            const secondRowSeats = seats.filter(s => s.row === 2);
            const midAndBackSeats = seats.filter(s => s.row > frontLimit);

            const visionGroup   = enriched.filter(s => s.health_type === 'vision');
            const hearingGroup  = enriched.filter(s => s.health_type === 'hearing');
            const mobilityGroup = enriched.filter(s => s.health_type === 'mobility');
            const otherGroup    = enriched.filter(s => s.health_type === 'other');
            const regular       = enriched.filter(s => s.health_type === 'none');

            const weakGroup   = regular.filter(s => s.avg_score !== null && s.avg_score < 50);
            const mediumGroup = regular.filter(s => s.avg_score === null || (s.avg_score >= 50 && s.avg_score <= 75));
            const goodGroup   = regular.filter(s => s.avg_score !== null && s.avg_score > 75);

            const usedSeats = new Set();
            const assigned  = [];

            const pickSeat = (preferred) => {
              for (const s of preferred) {
                const key = `${s.row}-${s.col}`;
                if (!usedSeats.has(key)) { usedSeats.add(key); return s; }
              }
              for (const s of seats) {
                const key = `${s.row}-${s.col}`;
                if (!usedSeats.has(key)) { usedSeats.add(key); return s; }
              }
              return null;
            };

            const assignGroup = (group, preferred) => {
              group.forEach(student => {
                const seat = pickSeat(preferred);
                if (seat) assigned.push({ student, seat });
              });
            };

            assignGroup(visionGroup,   frontSeats);
            assignGroup(hearingGroup,  frontSideSeats);
            assignGroup(mobilityGroup, aisleSeats);
            assignGroup(otherGroup,    secondRowSeats);
            assignGroup(weakGroup,     frontSeats);
            assignGroup(mediumGroup,   [...secondRowSeats, ...midAndBackSeats]);
            assignGroup(goodGroup,     midAndBackSeats);

            db.query('DELETE FROM class_seat_allocations WHERE class_id = ?', [class_id], (err) => {
              if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
              if (assigned.length === 0)
                return res.json({ message: 'لا يوجد طلاب', allocated: 0 });

              const values = assigned.map(({ student, seat }, i) => [
                class_id, student.id, i + 1, seat.row, seat.col,
                student.health_type, student.health_note,
              ]);

              db.query(
                `INSERT INTO class_seat_allocations
                   (class_id, student_id, seat_number, row_num, col_num, health_type, health_note)
                 VALUES ?`,
                [values],
                (err) => {
                  if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
                  res.json({
                    message:     'تم توزيع المقاعد بنجاح',
                    allocated:   assigned.length,
                    total_seats: totalSeats,
                    stats: {
                      vision:   visionGroup.length,
                      hearing:  hearingGroup.length,
                      mobility: mobilityGroup.length,
                      other:    otherGroup.length,
                      weak:     weakGroup.length,
                      medium:   mediumGroup.length,
                      good:     goodGroup.length,
                    },
                  });
                }
              );
            });
          }
        );
      }
    );
  });
};

exports.clearAllocations = (req, res) => {
  db.query('DELETE FROM class_seat_allocations WHERE class_id = ?', [req.params.class_id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم مسح التوزيع' });
  });
};

exports.getMySeat = (req, res) => {
  const q = `
    SELECT csa.seat_number, csa.row_num, csa.col_num, csa.health_type, csa.health_note,
           c.name AS class_name, c.grade_level,
           cr.rows_count, cr.cols_count
    FROM class_seat_allocations csa
    JOIN classes    c  ON c.id        = csa.class_id
    JOIN classrooms cr ON cr.class_id = csa.class_id
    WHERE csa.student_id = ?
  `;
  db.query(q, [req.user.id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data[0] || null);
  });
};
