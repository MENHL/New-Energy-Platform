async page => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5180/login');
  await page.waitForTimeout(1200);
  await page.getByPlaceholder('请输入企业账号 / 工号').fill('admin');
  await page.getByPlaceholder('请输入密码').fill('123456');
  await page.getByRole('button', { name: '登 录' }).click();
  await page.waitForTimeout(2200);

  /* 看板 1440：几何测量 + 截图 */
  await page.goto('http://localhost:5180/board');
  await page.waitForTimeout(2500);
  const geoBoard = await page.evaluate(() => {
    const row = document.querySelector('.board-view .kpi-row');
    return {
      rowAlign: getComputedStyle(row).alignItems,
      cards: [...document.querySelectorAll('.board-view .kpi-card')].map((c) => {
        const r = c.getBoundingClientRect();
        return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
      })
    };
  });
  await page.screenshot({ path: 'v4-board-1440.png' });

  /* 看板 1100：两行两列验证 */
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'v4-board-1100.png' });

  /* 总览 1440 */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5180/home');
  await page.waitForTimeout(2500);
  const geoHome = await page.evaluate(() => {
    return [...document.querySelectorAll('.home-view .kpi-card')].map((c) => {
      const r = c.getBoundingClientRect();
      return { top: Math.round(r.top), h: Math.round(r.height) };
    });
  });
  await page.screenshot({ path: 'v4-home-1440.png' });

  /* 登录页 375 移动端 */
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5180/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'v4-login-mobile.png' });

  return { board: geoBoard, home: geoHome };
}
