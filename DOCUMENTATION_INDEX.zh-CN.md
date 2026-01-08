# 文档索引

[English](DOCUMENTATION_INDEX.md) | 简体中文

TOTP Manager 项目的完整文档索引。

## 主要文档

### README
- 📖 [README.md](README.md) - 英文版本（默认）
- 📖 [README.zh-CN.md](README.zh-CN.md) - 简体中文版本

**内容**：项目介绍、功能特性、安装指南、部署指南、使用指南

---

### 环境变量
- 🔧 [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - 英文版本（默认）
- 🔧 [ENVIRONMENT_VARIABLES.zh-CN.md](ENVIRONMENT_VARIABLES.zh-CN.md) - 简体中文版本

**内容**：详细的环境变量文档、配置方法、安全最佳实践、故障排除

---

### 快速参考
- 📋 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 英文版本（默认）
- 📋 [QUICK_REFERENCE.zh-CN.md](QUICK_REFERENCE.zh-CN.md) - 简体中文版本

**内容**：常用命令速查表、部署检查清单、故障排除快速参考

---

### CI/CD 工作流
- 🚀 [.github/workflows/README.md](.github/workflows/README.md) - 英文版本（默认）
- 🚀 [.github/workflows/README.zh-CN.md](.github/workflows/README.zh-CN.md) - 简体中文版本

**内容**：GitHub Actions 工作流文档、配置指南、故障排除

---

### 环境变量模板
- 📄 [.env.example](.env.example) - 带详细注释的环境变量模板

**内容**：环境变量配置模板文件

---

## 附加文档

### 数据库迁移
- 📁 [migrations/README.md](migrations/README.md) - 数据库迁移指南

### Favicon
- 🎨 [public/FAVICON_README.md](public/FAVICON_README.md) - Favicon 设计文档

### 组件
- 🧩 [src/components/README.md](src/components/README.md) - Vue 组件文档

### 工具函数
- 🛠️ [src/utils/README.md](src/utils/README.md) - 工具函数文档

---

## 文档结构

```
totp-manager/
├── README.md                           # 主文档（英文）
├── README.zh-CN.md                     # 主文档（中文）
├── ENVIRONMENT_VARIABLES.md            # 环境变量（英文）
├── ENVIRONMENT_VARIABLES.zh-CN.md      # 环境变量（中文）
├── QUICK_REFERENCE.md                  # 快速参考（英文）
├── QUICK_REFERENCE.zh-CN.md            # 快速参考（中文）
├── DOCUMENTATION_INDEX.md              # 本文件（英文）
├── DOCUMENTATION_INDEX.zh-CN.md        # 本文件（中文）
├── .env.example                        # 环境变量模板
├── .github/
│   └── workflows/
│       ├── README.md                   # CI/CD 文档（英文）
│       ├── README.zh-CN.md             # CI/CD 文档（中文）
│       ├── ci.yml                      # CI 工作流
│       └── deploy.yml                  # 部署工作流
├── migrations/
│   └── README.md                       # 数据库迁移指南
├── public/
│   └── FAVICON_README.md               # Favicon 文档
├── src/
│   ├── components/
│   │   └── README.md                   # 组件文档
│   └── utils/
│       └── README.md                   # 工具函数文档
└── ...
```

---

## 快速链接

### 入门指南
1. [安装指南](README.zh-CN.md#快速开始)
2. [本地开发设置](README.zh-CN.md#本地开发)
3. [环境变量配置](ENVIRONMENT_VARIABLES.zh-CN.md)
4. [首次部署检查清单](QUICK_REFERENCE.zh-CN.md#首次部署检查清单)

### 开发
1. [项目结构](README.zh-CN.md#项目结构)
2. [开发指南](README.zh-CN.md#开发指南)
3. [常用命令](QUICK_REFERENCE.zh-CN.md#常用命令)
4. [测试](README.zh-CN.md#运行测试)

### 部署
1. [部署到 Cloudflare Pages](README.zh-CN.md#部署到-cloudflare-pages)
2. [数据库管理](README.zh-CN.md#数据库管理)
3. [CI/CD 设置](.github/workflows/README.zh-CN.md)
4. [环境变量设置](ENVIRONMENT_VARIABLES.zh-CN.md#生产环境配置)

### 故障排除
1. [常见问题](README.zh-CN.md#故障排除)
2. [环境变量问题](ENVIRONMENT_VARIABLES.zh-CN.md#故障排除)
3. [快速故障排除](QUICK_REFERENCE.zh-CN.md#故障排除速查)
4. [CI/CD 问题](.github/workflows/README.zh-CN.md#故障排除)

---

## 语言版本

所有主要文档都提供英文和简体中文两个版本：

- **English**（默认）：主要文档语言
- **简体中文**：完整的中文翻译

要切换语言，请点击每个文档顶部的语言链接。

---

## 贡献文档

更新文档时：

1. 同时更新英文和中文版本
2. 确保语言切换链接正确
3. 保持各版本格式一致
4. 如果添加新文档，请更新此索引

---

## 文档维护

**最后更新**：2024-01-08

**维护者**：TOTP Manager 开发团队

**反馈**：如有文档问题或建议，请提交 Issue 或 Pull Request。

---

## 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vuetify 3 文档](https://vuetifyjs.com/)
- [Vite 文档](https://cn.vitejs.dev/)
