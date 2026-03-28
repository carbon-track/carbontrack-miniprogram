const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 内容安全测试函数
 * 仅用于开发和测试环境，不上生产
 *
 * 使用说明：
 * wx.cloud.callFunction({
 *   name: 'test-security',
 *   data: {
 *     testSuite: 'coverage' | 'boundary' | 'performance' | 'all',  // 测试套件名称
 *     contentType: 'text' | 'image'                // 可选，指定测试内容类型
 *   }
 * })
 */

// 合规的测试案例（安全内容）
const SAFE_TEST_CASES = {
  text: [
    // 正常业务内容
    '今天天气真好',
    '我喜欢绿色环保',
    '减少碳排放很重要',
    '这个产品很有帮助',
    '感谢您的反馈',

    // 技术性测试
    '测试！@#$%^&*()内容',      // 特殊字符
    'A',                        // 最短文本
    'A'.repeat(100),             // 中等长度
    'This is 测试 test content', // 中英文混合
    '测试😀🎉👍内容',             // 表情符号
    '换行\n测试\t内容',          // 换行和制表符

    // 业务场景
    '用户昵称测试123',
    '个人简介：我是一名环保爱好者',
    '反馈内容：这个功能很好用',
    '这个产品的碳足迹很低'
  ],

  image: [
    // 使用合规的测试图片URL（需要替换为实际的云存储文件ID）
    'cloud://xxx.xxx/normal-image-1.jpg',  // 普通图片
    'cloud://xxx.xxx/normal-image-2.jpg',  // 景物图片
    'cloud://xxx.xxx/normal-image-3.jpg'   // 图标图片
  ]
}

// 边界测试案例（技术性边界，不包含真实违规内容）
const BOUNDARY_TEST_CASES = {
  text: [
    // 长度边界
    '',                              // 空字符串（应该被前端拦截，测试后端容错）
    'A'.repeat(1),                   // 最小长度
    'A'.repeat(500),                 // 较长文本
    'A'.repeat(10000),               // 超长文本

    // 字符集边界
    ' ',                             // 仅空格
    '   ',                           // 多个空格
    '1234567890',                    // 仅数字
    '!@#$%^&*()',                    // 仅特殊字符
    '测试内容'.repeat(20)            // 中文重复
  ]
}

// 性能测试案例
const PERFORMANCE_TEST_CASES = {
  text: [
    '测试内容',                      // 单条短文本
    '测试内容'.repeat(10),           // 多条文本
    '测试内容'.repeat(100)           // 批量文本
  ]
}

/**
 * 执行文本安全测试
 */
async function testTextSecurity(testCases) {
  const results = []
  const startTime = Date.now()

  for (const testCase of testCases) {
    const testStart = Date.now()

    try {
      const result = await cloud.callFunction({
        name: 'content-security',
        data: {
          contentType: 'text',
          content: testCase,
          source: 'test'
        }
      })

      results.push({
        content: testCase.length > 50 ? testCase.substring(0, 50) + '...' : testCase,
        contentLength: testCase.length,
        status: result.result.status,
        errcode: result.result.errcode,
        errmsg: result.result.errmsg,
        riskScore: result.result.riskScore,
        expected: 'approved',
        passed: result.result.status === 'approved',
        duration: Date.now() - testStart
      })

    } catch (error) {
      results.push({
        content: testCase.length > 50 ? testCase.substring(0, 50) + '...' : testCase,
        contentLength: testCase.length,
        status: 'error',
        error: error.message,
        expected: 'approved',
        passed: false,
        duration: Date.now() - testStart
      })
    }
  }

  return {
    type: 'text',
    totalTests: testCases.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
    totalDuration: Date.now() - startTime
  }
}

/**
 * 执行图片安全测试
 */
async function testImageSecurity(testCases) {
  const results = []
  const startTime = Date.now()

  for (const testCase of testCases) {
    const testStart = Date.now()

    try {
      const result = await cloud.callFunction({
        name: 'content-security',
        data: {
          contentType: 'image',
          content: testCase,
          source: 'test'
        }
      })

      results.push({
        imageUrl: testCase,
        status: result.result.status,
        errcode: result.result.errcode,
        errmsg: result.result.errmsg,
        riskScore: result.result.riskScore,
        expected: 'approved',
        passed: result.result.status === 'approved',
        duration: Date.now() - testStart
      })

    } catch (error) {
      results.push({
        imageUrl: testCase,
        status: 'error',
        error: error.message,
        expected: 'approved',
        passed: false,
        duration: Date.now() - testStart
      })
    }
  }

  return {
    type: 'image',
    totalTests: testCases.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
    totalDuration: Date.now() - startTime
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(suiteResults) {
  let report = '\n========== 内容安全测试报告 ==========\n'
  report += `测试时间: ${new Date().toLocaleString('zh-CN')}\n`
  report += `环境: ${process.env.TCB_ENV_ID}\n\n`

  let totalTests = 0
  let totalPassed = 0
  let totalFailed = 0

  for (const [suiteName, suiteResult] of Object.entries(suiteResults)) {
    report += `--- 测试套件: ${suiteName} ---\n`
    report += `类型: ${suiteResult.type}\n`
    report += `总测试数: ${suiteResult.totalTests}\n`
    report += `通过数: ${suiteResult.passed}\n`
    report += `失败数: ${suiteResult.failed}\n`
    report += `耗时: ${suiteResult.totalDuration}ms\n\n`

    // 显示失败案例
    const failedCases = suiteResult.results.filter(r => !r.passed)
    if (failedCases.length > 0) {
      report += '失败的测试案例:\n'
      failedCases.forEach((item, index) => {
        report += `  ${index + 1}. ${JSON.stringify(item, null, 2).split('\n').join('\n     ')}\n`
      })
      report += '\n'
    }

    totalTests += suiteResult.totalTests
    totalPassed += suiteResult.passed
    totalFailed += suiteResult.failed
  }

  report += '========== 测试总结 ==========\n'
  report += `总测试数: ${totalTests}\n`
  report += `总通过数: ${totalPassed}\n`
  report += `总失败数: ${totalFailed}\n`
  report += `通过率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0}%\n`
  report += '================================\n'

  return report
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { testSuite, contentType } = event

  // 安全检查：仅允许在开发/测试环境运行
  const envId = process.env.TCB_ENV_ID
  if (!envId || (envId.includes('prod') && !event.__forceTest__)) {
    return {
      error: '测试函数仅允许在开发/测试环境运行',
      code: 'FORBIDDEN'
    }
  }

  console.log(`[Security Test] 开始执行测试套件: ${testSuite}`)

  const suiteResults = {}

  try {
    // 根据测试套件执行不同的测试
    if (testSuite === 'coverage') {
      // 覆盖率测试
      if (!contentType || contentType === 'text') {
        suiteResults['文本-合规内容'] = await testTextSecurity(SAFE_TEST_CASES.text)
      }
      if (!contentType || contentType === 'image') {
        suiteResults['图片-合规内容'] = await testImageSecurity(SAFE_TEST_CASES.image)
      }

    } else if (testSuite === 'boundary') {
      // 边界测试
      suiteResults['文本-边界测试'] = await testTextSecurity(BOUNDARY_TEST_CASES.text)

    } else if (testSuite === 'performance') {
      // 性能测试
      suiteResults['文本-性能测试'] = await testTextSecurity(PERFORMANCE_TEST_CASES.text)

    } else if (testSuite === 'all') {
      // 全部测试
      suiteResults['文本-合规内容'] = await testTextSecurity(SAFE_TEST_CASES.text)
      suiteResults['图片-合规内容'] = await testImageSecurity(SAFE_TEST_CASES.image)
      suiteResults['文本-边界测试'] = await testTextSecurity(BOUNDARY_TEST_CASES.text)
      suiteResults['文本-性能测试'] = await testTextSecurity(PERFORMANCE_TEST_CASES.text)

    } else {
      return {
        error: '不支持的测试套件，请选择: coverage, boundary, performance, all',
        code: 'INVALID_SUITE'
      }
    }

    // 生成并返回测试报告
    const report = generateTestReport(suiteResults)

    console.log(report)

    // 保存测试结果到数据库（可选）
    try {
      const db = cloud.database()

      await db.collection('security_test_log').add({
        data: {
          testSuite,
          contentType,
          results: suiteResults,
          report,
          timestamp: new Date(),
          envId
        }
      })
      console.log('[Security Test] 测试结果已保存到数据库')
    } catch (dbError) {
      console.warn('[Security Test] 保存测试结果失败:', dbError.message)
    }

    return {
      success: true,
      suiteResults,
      report,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('[Security Test] 测试执行失败:', error)

    return {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  }
}
