# 用户认证系统说明

## 功能概述

现在系统已经实现了完整的用户认证功能：

### 1. 用户注册 (Register)
- 访问路径：`/register`
- 功能：
  - 创建新账号
  - 需要提供：用户名、邮箱、密码（至少6位）
  - 密码使用bcrypt加密存储
  - 注册成功后自动登录并跳转到个人资料页面

### 2. 用户登录 (Login)
- 访问路径：`/login`
- 功能：
  - 使用邮箱和密码登录
  - 登录成功后获得JWT token
  - 自动跳转到个人资料页面

### 3. 个人资料页面 (Profile)
- 访问路径：`/profile`
- 功能：
  - 查看个人信息（用户名、邮箱、每日提交限额、注册时间）
  - 查看提交历史记录
  - 退出登录功能
  - 需要登录才能访问

### 4. 提交页面 (Submit)
- 访问路径：`/submit`
- 功能：
  - 提交驾驶评测结果
  - 显示当前登录用户信息
  - 需要登录才能提交
  - 自动使用登录用户的ID提交数据

## 技术实现

### 后端 (Backend)
- **密码加密**：使用 `bcryptjs` 加密存储密码
- **Token认证**：使用 `jsonwebtoken` 生成和验证token
- **数据库**：SQLite，users表包含password字段
- **API端点**：
  - `POST /api/auth/register` - 用户注册
  - `POST /api/auth/login` - 用户登录

### 前端 (Frontend)
- **路由保护**：未登录用户访问Profile和Submit页面会自动跳转到登录页
- **本地存储**：使用localStorage存储用户信息和token
- **状态管理**：使用React hooks管理登录状态
- **新增页面**：
  - `Login.js` - 登录页面
  - `Register.js` - 注册页面

## 使用流程

1. **新用户**：
   - 访问首页或点击导航栏的"Login"
   - 点击"Register here"进入注册页面
   - 填写用户名、邮箱、密码
   - 注册成功后自动登录

2. **老用户**：
   - 访问登录页面
   - 输入邮箱和密码
   - 登录成功后可以查看个人资料和提交结果

3. **提交结果**：
   - 登录后访问Submit页面
   - 填写评测数据
   - 系统会自动关联到当前登录用户

4. **退出登录**：
   - 在Profile页面点击"Logout"按钮
   - 清除本地存储的用户信息

## 安全性

- 密码使用bcrypt加密，不以明文存储
- JWT token有效期为7天
- API端点进行参数验证
- 数据库使用UNIQUE约束防止重复注册

## 测试账号

可以使用以下方式创建测试账号：

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123456"}'
```

登录测试：

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

## 数据库结构

### users表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  quota_limit INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 后续改进建议

1. 添加"忘记密码"功能
2. 添加邮箱验证
3. 添加用户头像上传
4. 添加更改密码功能
5. 添加管理员权限管理
6. 使用环境变量管理JWT密钥
7. 添加刷新token机制
8. 添加账号信息编辑功能
