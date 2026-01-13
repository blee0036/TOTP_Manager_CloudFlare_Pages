# 设计文档：UI 重新设计

## 概述

本设计文档描述 TOTP 认证器应用的 UI 重新设计方案。新设计采用黑色和紫色为主的现代配色方案，打造高端、简洁、有设计感的用户界面。设计基于现有的 Vue 3 + Vuetify 3 技术栈，通过修改主题配置、组件样式和交互动画来实现视觉升级。

## 架构

### 设计系统层次

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (App.vue)                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  导航栏     │  │  页面视图   │  │  全局提示   │     │
│  │ Navigation  │  │   Views     │  │  Snackbar   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                    组件层 (Components)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │TokenCard │ │ KeyForm  │ │SearchBar │ │EmptyState│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│                    样式层 (Styles)                       │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Vuetify Theme   │  │  Global CSS      │            │
│  │  (vuetify.ts)    │  │  (style.css)     │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 文件修改范围

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/plugins/vuetify.ts` | 重写 | 新的黑紫配色主题 |
| `src/style.css` | 修改 | 全局样式和动画 |
| `src/App.vue` | 修改 | 导航栏重新设计 |
| `src/components/TokenCard.vue` | 重写 | 新的卡片设计 |
| `src/views/TokenDisplay.vue` | 修改 | 空状态和布局优化 |
| `src/views/Auth.vue` | 修改 | 认证页面美化 |
| `src/components/KeyForm.vue` | 修改 | 表单样式优化 |

## 组件和接口

### 1. 主题配置 (vuetify.ts)

```typescript
// 亮色主题 - 浅灰白背景 + 紫色强调
const lightTheme = {
  dark: false,
  colors: {
    primary: '#8B5CF6',           // 紫色主色
    'primary-darken-1': '#7C3AED', // 深紫色
    secondary: '#A78BFA',          // 浅紫色
    accent: '#C4B5FD',             // 淡紫色
    error: '#EF4444',              // 红色
    warning: '#F59E0B',            // 琥珀色
    success: '#10B981',            // 绿色
    info: '#8B5CF6',               // 紫色
    background: '#FAFAFA',         // 浅灰白背景
    surface: '#FFFFFF',            // 纯白表面
    'surface-variant': '#F5F3FF',  // 淡紫色表面
    'on-primary': '#FFFFFF',
    'on-background': '#1F2937',    // 深灰文字
    'on-surface': '#1F2937',
    'on-surface-variant': '#6B7280',
  }
}

// 暗色主题 - 深黑背景 + 紫色强调
const darkTheme = {
  dark: true,
  colors: {
    primary: '#A78BFA',            // 亮紫色
    'primary-darken-1': '#8B5CF6', // 紫色
    secondary: '#C4B5FD',          // 浅紫色
    accent: '#DDD6FE',             // 淡紫色
    error: '#F87171',              // 浅红色
    warning: '#FBBF24',            // 浅琥珀色
    success: '#34D399',            // 浅绿色
    info: '#A78BFA',               // 紫色
    background: '#0A0A0B',         // 深黑背景
    surface: '#18181B',            // 深灰表面
    'surface-variant': '#27272A',  // 中灰表面
    'surface-bright': '#3F3F46',   // 亮灰表面
    'on-primary': '#0A0A0B',
    'on-background': '#F4F4F5',    // 浅灰文字
    'on-surface': '#F4F4F5',
    'on-surface-variant': '#A1A1AA',
  }
}
```

### 2. TokenCard 组件设计

```vue
<!-- 新的 TokenCard 结构 -->
<template>
  <div class="token-card">
    <!-- 头部：服务名称 + 操作按钮 -->
    <div class="token-header">
      <span class="service-name">{{ remark }}</span>
      <button class="menu-btn">⋮</button>
    </div>
    
    <!-- 验证码显示 -->
    <div class="token-code">
      <span class="code-digits">{{ formattedToken }}</span>
      <button class="copy-btn" @click="handleCopy">
        <CopyIcon />
      </button>
    </div>
    
    <!-- 环形进度条 -->
    <div class="progress-ring">
      <svg viewBox="0 0 36 36">
        <circle class="progress-bg" />
        <circle class="progress-bar" :stroke-dashoffset="progressOffset" />
      </svg>
      <span class="time-remaining">{{ timeRemaining }}s</span>
    </div>
  </div>
</template>
```

**样式规范：**
- 卡片圆角：16px
- 卡片阴影：`0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- 悬停阴影：`0 10px 15px -3px rgba(139, 92, 246, 0.2)`
- 验证码字体：`'JetBrains Mono', 'Fira Code', monospace`
- 验证码字号：32px
- 环形进度条尺寸：36x36px

### 3. 导航栏设计

```vue
<!-- 新的导航栏结构 -->
<template>
  <nav class="app-navbar">
    <!-- Logo -->
    <router-link to="/" class="logo">
      <ShieldIcon />
      <span class="logo-text">TOTP</span>
    </router-link>
    
    <!-- 桌面端导航 -->
    <div class="nav-links" v-if="!isMobile">
      <NavButton icon="grid" to="/" tooltip="令牌" />
      <NavButton icon="plus" to="/add" tooltip="添加" />
      <NavButton icon="settings" to="/manage" tooltip="管理" v-if="isAuth" />
    </div>
    
    <!-- 工具栏 -->
    <div class="nav-tools">
      <ThemeToggle />
      <LanguageSelector />
      <UserMenu v-if="isAuth" />
      <LoginButton v-else />
    </div>
    
    <!-- 移动端菜单按钮 -->
    <button class="menu-toggle" v-if="isMobile" @click="toggleDrawer">
      <MenuIcon />
    </button>
  </nav>
</template>
```

**样式规范：**
- 导航栏高度：64px
- 背景：`rgba(10, 10, 11, 0.8)` + `backdrop-filter: blur(12px)`
- 底部边框：`1px solid rgba(139, 92, 246, 0.2)`
- 图标按钮尺寸：40x40px
- 图标尺寸：20px

### 4. 空状态设计

```vue
<template>
  <div class="empty-state">
    <!-- 装饰性图标 -->
    <div class="empty-icon">
      <ShieldKeyIcon />
      <div class="glow-effect"></div>
    </div>
    
    <!-- 标题和描述 -->
    <h2 class="empty-title">还没有添加密钥</h2>
    <p class="empty-desc">添加你的第一个 2FA 密钥，开始保护你的账户安全</p>
    
    <!-- 行动按钮 -->
    <button class="add-key-btn">
      <PlusIcon />
      添加密钥
    </button>
  </div>
</template>
```

**样式规范：**
- 图标尺寸：120px
- 图标颜色：紫色渐变
- 发光效果：`box-shadow: 0 0 60px rgba(139, 92, 246, 0.3)`
- 标题字号：24px
- 描述字号：16px
- 按钮：紫色渐变背景

### 5. 认证页面设计

```vue
<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="auth-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>
    
    <!-- 认证卡片 -->
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <ShieldIcon />
        <h1>TOTP Manager</h1>
        <p>安全的双因素认证管理器</p>
      </div>
      
      <!-- 标签页 -->
      <div class="auth-tabs">
        <button :class="{ active: tab === 'login' }">登录</button>
        <button :class="{ active: tab === 'register' }">注册</button>
      </div>
      
      <!-- 表单 -->
      <form class="auth-form">
        <!-- 输入框 -->
      </form>
      
      <!-- 分隔线 -->
      <div class="divider">
        <span>或</span>
      </div>
      
      <!-- 临时模式 -->
      <button class="temp-mode-btn">
        <IncognitoIcon />
        临时模式
      </button>
    </div>
  </div>
</template>
```

**样式规范：**
- 背景渐变球：紫色模糊渐变
- 卡片宽度：400px
- 卡片圆角：24px
- 卡片背景：`rgba(24, 24, 27, 0.9)` + `backdrop-filter: blur(20px)`
- 输入框圆角：12px
- 按钮圆角：12px

## 数据模型

本次 UI 重新设计不涉及数据模型变更，仅修改视觉呈现层。

## 正确性属性

*正确性属性是指在系统所有有效执行中都应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### Property 1: WCAG 颜色对比度合规

*对于任意* 主题配置中的文字颜色和背景颜色组合，计算得到的对比度比值应大于等于 4.5:1（WCAG AA 标准）

**验证: 需求 1.6**

### Property 2: 动画时长范围

*对于任意* CSS 过渡或动画定义，其 duration 值应在 200ms 到 400ms 之间

**验证: 需求 6.4**

### Property 3: 触摸目标尺寸

*对于任意* 可点击元素（按钮、链接、图标按钮），其最小尺寸应为 44x44 像素

**验证: 需求 8.4**

## 错误处理

### 主题切换错误
- 如果主题切换失败，保持当前主题不变
- 在控制台记录错误信息

### 动画降级
- 如果用户启用了 `prefers-reduced-motion`，禁用所有动画
- 提供无动画的备用样式

### 字体加载失败
- 使用系统字体作为后备：`system-ui, -apple-system, sans-serif`
- 等宽字体后备：`'Courier New', monospace`

## 测试策略

### 单元测试
- 测试主题配置的颜色值是否正确
- 测试组件在不同状态下的渲染
- 测试响应式断点的正确性

### 属性测试
- 使用属性测试验证颜色对比度
- 使用属性测试验证动画时长
- 使用属性测试验证触摸目标尺寸

### 视觉回归测试
- 使用截图对比工具验证 UI 变更
- 测试明暗主题的视觉一致性

### 可访问性测试
- 使用 axe-core 进行自动化可访问性测试
- 验证键盘导航功能
- 验证屏幕阅读器兼容性
