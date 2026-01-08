# TOTP 核心算法实现

本目录包含 TOTP (Time-based One-Time Password) 管理器的核心算法实现。

## 已实现的模块

### 1. Base32 编解码器 (`base32.ts`)

实现了 RFC 4648 Base32 编码标准，用于处理 TOTP 密钥的编码和解码。

**功能：**
- `base32Decode(encoded: string): Uint8Array` - 将 Base32 字符串解码为字节数组
- `base32Encode(data: Uint8Array): string` - 将字节数组编码为 Base32 字符串

**特性：**
- 自动处理大小写转换
- 自动移除空格
- 支持填充字符 `=`
- 完整的错误处理

**测试覆盖：**
- ✅ 基本编解码功能
- ✅ 大小写处理
- ✅ 空格处理
- ✅ 填充处理
- ✅ 无效字符检测
- ✅ 往返一致性（round-trip）

### 2. TOTP 生成算法 (`totp.ts`)

实现了 RFC 6238 TOTP 标准，用于生成基于时间的一次性密码。

**功能：**
- `generateTOTP(secretBase32, step?, digits?): Promise<string>` - 生成 TOTP 令牌
- `getTimeRemaining(step?): number` - 获取当前周期剩余秒数
- `getProgress(step?): number` - 获取当前周期进度百分比

**特性：**
- 使用 Web Crypto API 的 HMAC-SHA1
- 支持自定义时间步长（默认 30 秒）
- 支持自定义令牌位数（默认 6 位）
- 动态截断算法
- 前导零填充

**测试覆盖：**
- ✅ 6 位令牌生成
- ✅ 同一时间窗口内的一致性
- ✅ 不同密钥生成不同令牌
- ✅ 前导零填充
- ✅ 无效密钥错误处理
- ✅ 自定义步长和位数
- ✅ 时间剩余计算
- ✅ 进度百分比计算
- ✅ 不同时间窗口生成不同令牌

### 3. OTPAuth URI 解析器 (`otpauth.ts`)

实现了 OTPAuth URI 协议解析，用于从二维码中提取 TOTP 配置信息。

**功能：**
- `parseOtpAuthUri(uri: string): OTPAuthData | null` - 解析 otpauth:// URI

**特性：**
- 支持标准 otpauth:// 协议
- 提取密钥、发行者、账户信息
- 自动生成友好的备注名称
- 支持自定义参数（算法、位数、周期）
- URL 编码字符自动解码
- 完整的错误处理

**支持的 URI 格式：**
```
otpauth://totp/Issuer:Account?secret=SECRET&issuer=Issuer
otpauth://totp/Account?secret=SECRET
otpauth://totp/Issuer:Account?secret=SECRET&algorithm=SHA1&digits=6&period=30
```

**测试覆盖：**
- ✅ 完整 URI 解析（包含发行者和账户）
- ✅ 仅账户名的 URI
- ✅ 路径中的发行者
- ✅ 参数优先级处理
- ✅ 自定义参数解析
- ✅ 密钥规范化
- ✅ URL 编码处理
- ✅ 无效协议拒绝
- ✅ 非 TOTP 类型拒绝
- ✅ 缺少密钥拒绝
- ✅ 无效 Base32 密钥拒绝

### 4. 密钥验证和规范化 (`keyValidation.ts`)

实现了多格式密钥输入的验证和规范化功能。

**功能：**
- `normalizeSecret(secret: string): string` - 规范化密钥字符串
- `validateAndNormalizeSecret(input: string): KeyValidationResult` - 验证并规范化密钥

**支持的输入格式：**
1. 纯 Base32：`JBSWY3DPEHPK3PXP`
2. 小写：`jbswy3dpehpk3pxp`
3. 带空格：`JBSW Y3DP EHPK 3PXP`
4. 混合大小写带空格：`jbsw Y3dp ehpk 3PXP`
5. OTPAuth URI：`otpauth://totp/Issuer:Account?secret=JBSWY3DPEHPK3PXP`

**特性：**
- 自动移除空格
- 自动转换大小写
- Base32 格式验证
- 最小长度验证（8 字符）
- OTPAuth URI 自动解析
- 详细的错误信息

**测试覆盖：**
- ✅ 规范化功能（空格、大小写）
- ✅ 有效 Base32 验证
- ✅ 小写输入处理
- ✅ 带空格输入处理
- ✅ 填充字符处理
- ✅ 无效字符拒绝
- ✅ 过短密钥拒绝
- ✅ 无效 Base32 字符拒绝（0, 1, 8, 9）
- ✅ OTPAuth URI 解析
- ✅ 无效 URI 拒绝
- ✅ 空输入处理
- ✅ 纯空白输入处理

## 使用示例

### 完整工作流程

```typescript
import { validateAndNormalizeSecret } from '@/utils/keyValidation';
import { generateTOTP } from '@/utils/totp';

// 用户输入（支持多种格式）
const userInput = 'jbsw y3dp ehpk 3pxp'; // 或 otpauth:// URI

// 步骤 1: 验证和规范化
const validation = validateAndNormalizeSecret(userInput);

if (!validation.isValid) {
  console.error('无效的密钥:', validation.error);
  return;
}

// 步骤 2: 生成 TOTP
const token = await generateTOTP(validation.normalizedSecret);
console.log(`当前令牌: ${token}`);
```

### 生成 TOTP 令牌

```typescript
import { generateTOTP, getTimeRemaining, getProgress } from '@/utils/totp';

// 生成令牌
const secret = 'JBSWY3DPEHPK3PXP';
const token = await generateTOTP(secret);
console.log(`Current token: ${token}`); // 例如: "123456"

// 获取剩余时间
const remaining = getTimeRemaining();
console.log(`Time remaining: ${remaining}s`); // 例如: 15

// 获取进度
const progress = getProgress();
console.log(`Progress: ${progress}%`); // 例如: 50.5
```

### 解析 OTPAuth URI

```typescript
import { parseOtpAuthUri } from '@/utils/otpauth';

// 从二维码获取的 URI
const uri = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
const data = parseOtpAuthUri(uri);

if (data) {
  console.log(`密钥: ${data.secret}`);        // 'JBSWY3DPEHPK3PXP'
  console.log(`备注: ${data.remark}`);        // 'Google (user@example.com)'
  console.log(`发行者: ${data.issuer}`);      // 'Google'
  console.log(`账户: ${data.account}`);       // 'user@example.com'
  
  // 使用提取的密钥生成令牌
  const token = await generateTOTP(data.secret);
  console.log(`令牌: ${token}`);
}
```

### 密钥验证和规范化

```typescript
import { validateAndNormalizeSecret, normalizeSecret } from '@/utils/keyValidation';

// 验证各种格式的输入
const inputs = [
  'JBSWY3DPEHPK3PXP',                    // 标准格式
  'jbswy3dpehpk3pxp',                    // 小写
  'JBSW Y3DP EHPK 3PXP',                 // 带空格
  'jbsw y3dp ehpk 3pxp',                 // 小写带空格
  'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP'  // URI
];

inputs.forEach(input => {
  const result = validateAndNormalizeSecret(input);
  if (result.isValid) {
    console.log(`✓ ${input} → ${result.normalizedSecret}`);
  } else {
    console.log(`✗ ${input} → ${result.error}`);
  }
});

// 简单规范化（不验证）
const normalized = normalizeSecret('jbsw y3dp ehpk 3pxp');
console.log(normalized); // 'JBSWY3DPEHPK3PXP'
```

### Base32 编解码

```typescript
import { base32Encode, base32Decode } from '@/utils/base32';

// 编码
const data = new TextEncoder().encode('Hello');
const encoded = base32Encode(data);
console.log(encoded); // "JBSWY3DP========"

// 解码
const decoded = base32Decode('JBSWY3DPEHPK3PXP');
console.log(decoded); // Uint8Array
```

## 运行测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# UI 模式
npm run test:ui
```

## 技术细节

### Base32 编码

Base32 使用 32 个字符（A-Z, 2-7）来表示数据，每个字符代表 5 位。这使得它比 Base64 更适合人类阅读和输入，因为它避免了容易混淆的字符（如 0/O, 1/I/l）。

### TOTP 算法

TOTP 基于 HMAC-SHA1 算法：

1. 计算时间步数：`counter = floor(current_time / step)`
2. 将计数器转换为 8 字节大端序
3. 使用密钥对计数器进行 HMAC-SHA1
4. 动态截断：使用最后一个字节的低 4 位作为偏移量
5. 提取 4 字节并转换为数字
6. 对 10^digits 取模得到最终令牌

### 安全性

- 使用 Web Crypto API 确保加密操作的安全性
- 密钥在客户端处理，不发送到服务器
- 支持标准的 30 秒时间窗口
- 完整的输入验证

## 下一步

- [x] 实现 OTPAuth URI 解析器
- [x] 实现密钥验证和规范化
- [ ] 添加属性测试（Property-Based Testing）
- [ ] 实现 QR 码扫描功能

## 参考资料

- [RFC 4648 - Base32 编码](https://tools.ietf.org/html/rfc4648)
- [RFC 6238 - TOTP 算法](https://tools.ietf.org/html/rfc6238)
- [RFC 4226 - HOTP 算法](https://tools.ietf.org/html/rfc4226)
