import { expect, test, type BrowserContext, type APIResponse, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { availableRecordSchema } from '../src/lib/contracts/coordination';
import { z } from 'zod';
const origin = process.env.PROHOR_TEST_URL || 'http://127.0.0.1:3017';
async function english(context: BrowserContext) {
  await context.addInitScript(() => localStorage.setItem('prohor-access-preferences-v1', JSON.stringify({ language: 'en' })));
}
async function payload(response: Pick<APIResponse, 'ok' | 'status' | 'url' | 'json'>) {
  expect(response.ok(), `HTTP ${response.status()} from ${new URL(response.url()).pathname}`).toBeTruthy();
  return (await response.json()).data;
}
async function signIn(context: BrowserContext, email: string, password: string) {
  const response = await context.request.post('/auth/sign-in', { headers: { origin }, data: { email, password, next: '/app' } });
  expect(response.status(), 'Synthetic account sign-in must succeed before testing').toBe(200);
}
async function continueStep(page: Page) { await page.locator('form').getByRole('button', { name: 'Continue', exact: true }).click(); }
async function noOverflow(page: Page) {
  const layout = await page.evaluate(() => ({
    viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
    language: document.documentElement.lang, textSize: getComputedStyle(document.documentElement).fontSize,
    offenders: [...document.querySelectorAll('body *')].filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1) && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 8).map(element => ({ tag: element.tagName, className: element.getAttribute('class'), text: element.textContent?.slice(0, 60) })),
  }));
  expect(layout.documentWidth, JSON.stringify(layout, null, 2)).toBeLessThanOrEqual(layout.viewport + 1);
}
test('public introduction is clear, keyboard reachable and responsive in both languages', async ({ page, context }) => {
  await english(context); await page.goto('/bondhon');
  const open = page.getByRole('link', { name: 'Open my Bondhon', exact: true });
  await expect(open).toHaveAttribute('href', '/app/bondhon');
  await open.focus(); await expect(open).toBeFocused();
  for (const language of ['en', 'bn']) {
    await page.evaluate(language => {
      const key = 'prohor-access-preferences-v1';
      localStorage.setItem(key, JSON.stringify({ ...JSON.parse(localStorage.getItem(key) || '{}'), language }));
      document.documentElement.lang = language;
      window.dispatchEvent(new CustomEvent('prohor-preferences-change'));
    }, language);
    for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const scale of ['100%', '200%']) {
        await page.evaluate(scale => { document.documentElement.style.fontSize = scale; }, scale);
        await noOverflow(page);
      }
    }
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map(item => item.id)).toEqual([]);
});

// Opt-in: this test creates ONE synthetic request, reads TWO existing synthetic records,
// acknowledges, replies, revokes and signs both test accounts out. It never modifies SQL directly.
const credentials = {
  motherEmail: process.env.PROHOR_TEST_MOTHER_EMAIL,
  motherPassword: process.env.PROHOR_TEST_MOTHER_PASSWORD,
  providerEmail: process.env.PROHOR_TEST_PROVIDER_EMAIL,
  providerPassword: process.env.PROHOR_TEST_PROVIDER_PASSWORD,
};
test('M8 two-account proof: two exact records, reply, real withdrawal and sign-out', async ({ browser }, testInfo) => {
  test.skip(!Object.values(credentials).every(Boolean), 'Set all four PROHOR_TEST_* synthetic account credential variables to enable the hosted proof.');
  test.setTimeout(300_000);
  const mother = await browser.newContext({ baseURL: origin, viewport: { width: 390, height: 844 } });
  const provider = await browser.newContext({ baseURL: origin, viewport: { width: 1280, height: 900 } });
  await english(mother); await english(provider);
  let createdId: string | null = null;
  let stopped = false;
  try {
    await signIn(mother, credentials.motherEmail!, credentials.motherPassword!);
    await signIn(provider, credentials.providerEmail!, credentials.providerPassword!);
    const providerMe = await payload(await provider.request.get('/api/me'));
    const motherMe = await payload(await mother.request.get('/api/me'));
    expect(providerMe.role).toBe('provider'); expect(motherMe.role).toBe('mother');
    expect(providerMe.id).not.toBe(motherMe.id);
    const recipients = await payload(await mother.request.get('/api/care-recipients'));
    expect(recipients.some((item: { id: string }) => item.id === providerMe.id)).toBeTruthy();
    const records = z.array(availableRecordSchema).parse(await payload(await mother.request.get('/api/care-records')))
      .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
    const reading = (kinds: string[]) => records.find(item => {
      const fields = item.record.fields;
      return item.record.type === 'maternal_observation' && 'measurement' in fields && fields.measurement && kinds.includes(fields.measurement.kind);
    });
    const bp = reading(['systolic_blood_pressure', 'diastolic_blood_pressure']), hb = reading(['hemoglobin']);
    expect(bp, 'Demo mother needs an existing synthetic blood-pressure record; ask the record owner to arrange it').toBeTruthy();
    expect(hb, 'Demo mother needs an existing synthetic haemoglobin record').toBeTruthy();
    const chosen = [bp!, hb!];
    const pageA = await mother.newPage(), pageB = await provider.newPage();
    await pageA.goto('/app/bondhon');
    await pageA.getByRole('button', { name: 'Ask for help or prepare a visit', exact: true }).click();
    await pageA.getByLabel('Purpose of this request', { exact: true }).fill('Demo visit preparation ' + randomUUID().slice(0, 8));
    await pageA.getByLabel('Message for this recipient', { exact: true }).fill('Synthetic visit preparation ' + randomUUID().slice(0, 8));
    await continueStep(pageA);
    await pageA.locator(`input[name="recipient"][value="${providerMe.id}"]`).check();
    await continueStep(pageA); await continueStep(pageA);
    await pageA.getByRole('radio', { name: '1 hour', exact: true }).check();
    for (const item of chosen) await pageA.locator(`[data-record-key="${item.record.type}/${item.record.id}"]`).getByRole('checkbox').first().check();
    await pageA.getByRole('checkbox', { name: 'Allow the simulated provider to reply', exact: false }).check();
    await noOverflow(pageA);
    await pageA.getByRole('button', { name: 'Review information and permissions', exact: true }).click();
    await expect(pageA.getByRole('heading', { name: 'Review your sharing decision' })).toBeFocused();
    await expect(pageA.getByText('Everything else: diary, AI conversations, files, other records, and any note you did not tick.', { exact: true })).toBeVisible();
    const send = pageA.getByRole('button', { name: 'Approve and send to simulated queue', exact: true });
    await expect(send).toBeDisabled();
    await pageA.getByRole('checkbox', { name: 'I approve sharing exactly this information', exact: false }).check();
    const sent = pageA.waitForResponse(response => response.url().endsWith('/api/care-requests') && response.request().method() === 'POST');
    await send.click();
    const saved = await payload(await sent); createdId = saved.id;
    expect(saved.coordination.allowReplies).toBe(true);
    const grantedIds = chosen.map(item => item.record.id).sort();
    expect(Date.parse(saved.coordination.expiresAt) - Date.parse(saved.coordination.approvedAt)).toBeGreaterThan(50 * 60_000);
    expect(Date.parse(saved.coordination.expiresAt) - Date.parse(saved.coordination.approvedAt)).toBeLessThanOrEqual(61 * 60_000);
    await expect(pageA.getByRole('heading', { name: 'Request and permissions', exact: true })).toBeVisible();
    await pageA.screenshot({ path: testInfo.outputPath('02-mother-sent.png'), fullPage: true });
    await pageB.goto('/provider');
    // Queue is intentionally sorted by access ending soonest, not newest request.
    const entry = pageB.getByRole('button').filter({ hasText: saved.message });
    for (let count = 0; count < 30; count++) {
      if (await entry.count()) break;
      const more = pageB.getByRole('button', { name: 'Load more requests', exact: true });
      if (await more.isVisible()) await more.click(); else await pageB.waitForTimeout(500);
    }
    await entry.click();
    const projection = await payload(await provider.request.get(`/api/care-requests/${createdId}/coordination`));
    expect(projection.request.consentedRecords.map((item: { id: string }) => item.id).sort()).toEqual(grantedIds);
    for (const selected of chosen) {
      const shown = projection.request.consentedRecords.find((item: { id: string }) => item.id === selected.record.id);
      expect(shown.fields).toEqual(selected.record.fields);
    }
    expect(projection.grants).toEqual([]); expect(projection.audit).toEqual([]);
    await pageB.getByRole('button', { name: 'Acknowledge simulated request', exact: true }).click();
    await expect(pageB.getByLabel('Follow-up message', { exact: true })).toBeVisible();
    await pageB.screenshot({ path: testInfo.outputPath('05-provider-exact-records.png'), fullPage: true });
    await pageA.getByRole('button', { name: 'Refresh current access', exact: true }).click();
    await expect(pageA.getByRole('heading', { name: 'Acknowledged by simulated provider', exact: true })).toBeVisible();
    await expect(pageA.getByText(/A provider account opened this request/).first()).toBeVisible();
    await pageB.getByLabel('Follow-up message', { exact: true }).fill('Please bring your ANC card (demo)');
    await pageB.getByRole('checkbox', { name: 'I reviewed this message.', exact: false }).check();
    const replied = pageB.waitForResponse(response => response.url().endsWith(`/api/provider/requests/${createdId}/respond`) && response.request().method() === 'POST');
    await pageB.getByRole('button', { name: 'Send reviewed message', exact: true }).click(); await payload(await replied);
    await pageA.getByRole('button', { name: 'Refresh current access', exact: true }).click();
    await expect(pageA.getByText('Please bring your ANC card (demo)', { exact: true })).toBeVisible();
    await pageA.getByRole('button', { name: 'Stop sharing', exact: true }).click();
    const dialog = pageA.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Keep current settings', exact: true })).toBeFocused();
    const revoked = pageA.waitForResponse(response => response.url().endsWith(`/api/care-requests/${createdId}/revoke`) && response.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Stop sharing', exact: true }).click();
    const withdrawn = await payload(await revoked); expect(withdrawn.request.coordination.revokedAt).toBeTruthy(); stopped = true;
    await expect(pageA.getByText('Sharing stopped. The server confirmed withdrawal of this request’s access.', { exact: true })).toBeVisible();
    await expect(pageA.getByRole('img', { name: 'Nothing is shared for this request now.', exact: true })).toBeVisible();
    await pageA.screenshot({ path: testInfo.outputPath('09-mother-stopped.png'), fullPage: true });
    await pageB.getByRole('button', { name: 'Refresh current access', exact: true }).click();
    await expect(pageB.getByRole('heading', { name: 'Access ended or unavailable', exact: true })).toBeVisible();
    await expect(pageB.getByText('Please bring your ANC card (demo)', { exact: true })).toHaveCount(0);
    expect((await provider.request.get(`/api/care-requests/${createdId}/coordination`)).status()).toBe(404);
    await pageB.screenshot({ path: testInfo.outputPath('10-provider-access-ended.png'), fullPage: true });
    for (const page of [pageA, pageB]) {
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
      await page.waitForURL('**/sign-in?status=signed-out');
      await page.goBack();
      await expect(page.getByRole('heading', { name: 'Request and permissions', exact: true })).toHaveCount(0);
      await expect(page.getByText('Please bring your ANC card (demo)', { exact: true })).toHaveCount(0);
      expect([401, 403]).toContain((await page.request.get('/api/care-requests')).status());
    }
  } finally {
    let cleanupFailed = false;
    if (createdId && !stopped) {
      const cleanup = await mother.request.post(`/api/care-requests/${createdId}/revoke`, { headers: { origin, 'Idempotency-Key': randomUUID() } });
      cleanupFailed = !cleanup.ok();
    }
    await mother.close(); await provider.close();
    if (cleanupFailed) throw new Error('Proof run could not withdraw its synthetic request. Check that request with the demo mother account.');
  }
});
