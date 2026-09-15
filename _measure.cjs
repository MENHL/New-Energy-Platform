/**
 * [临时脚本] _measure.cjs —— 多视口验证 KPI 卡片对齐 / 看板两行两列 / 登录页移动端
 * 运行：node _measure.cjs（需 dev server 已在 5180 端口运行）
 */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = [];

  /* 登录 */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5180/login');
  await page.waitForTimeout(1500);
  await page.getByPlaceholder('请输入企业账号 / 工号').fill('admin');
  await page.getByPlaceholder('请输入密码').fill('123456');
  await page.getByRole('button', { name: '登 录' }).click();
  await page.waitForTimeout(2500);

  /* 1. 看板 1440：测量卡片几何 + 截图 */
  await page.goto('http://localhost:5180/board');
  await page.waitForTimeout(2500);
  const geo = await page.evaluate(() => {
    const row = document.querySelector('.board-view .kpi-row');
    return {
      rowAlign: getComputedStyle(row).alignItems,
      cards: [...document.querySelectorAll('.board-view .kpi-card')].map((c) => {
        const r = c.getBoundingClientRect();
        return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
      })
    };
  });
  out.push('board-1440 geometry: ' + JSON.stringify(geo, null, 1));
  await page.screenshot({ path: 'v4-board-1440.png' });

  /* 2. 看板 1100：验证两行两列 */
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'v4-board-1100.png' });

  /* 3. 总览 1440 */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5180/home');
  await page.waitForTimeout(2500);
  const geoHome = await page.evaluate(() => {
    return [...document.querySelectorAll('.home-view .kpi-card')].map((c) => {
      const r = c.getBoundingClientRect();
      return { top: Math.round(r.top), h: Math.round(r.height) };
    });
  });
  out.push('home-1440 geometry: ' + JSON.stringify(geoHome, null, 1));
  await page.screenshot({ path: 'v4-home-1440.png' });

  /* 4. 登录页 375 移动端 */
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5180/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'v4-login-mobile.png' });

  await browser.close();
  fs.writeFileSync('_measure_out.txt', out.join('\n'), 'utf8');
})().catch((e) => {
  fs.writeFileSync('_measure_out.txt', 'ERROR: ' + e.message, 'utf8');
  process.exit(1);
});
