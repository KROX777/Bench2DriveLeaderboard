const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./leaderboard.db');

db.get('SELECT password FROM users WHERE username = ?', ['root'], async (err, row) => {
  if (err) {
    console.log('❌ 数据库错误:', err.message);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('❌ 用户不存在');
    db.close();
    return;
  }

  console.log('✓ 找到用户，哈希值长度:', row.password.length);
  
  try {
    const isValid = await bcrypt.compare('123456', row.password);
    console.log('密码验证结果:', isValid ? '✅ 正确' : '❌ 错误');
  } catch (err) {
    console.log('❌ 比对出错:', err.message);
  }
  
  db.close();
});
