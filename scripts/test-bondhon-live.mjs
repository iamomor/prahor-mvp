import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Explicit opt-in: synthetic account credentials come only from the invoking environment.
const origin = process.env.PROHOR_TEST_URL;
const motherPassword = process.env.PROHOR_TEST_MOTHER_PASSWORD;
const providerPassword = process.env.PROHOR_TEST_PROVIDER_PASSWORD;
if (!origin || !motherPassword || !providerPassword) throw new Error('Set test URL and both synthetic test passwords.');
let server;
if (process.argv.includes('--serve')) {
  const url = new URL(origin);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'Managed test server must be local.');
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', url.port], {
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: origin }, stdio: 'ignore',
  });
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if ((await fetch(origin + '/bondhon', { signal: AbortSignal.timeout(3000) })).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) { server.kill(); throw new Error('Local test server did not start.'); }
}
const evidence = process.env.PROHOR_TEST_EVIDENCE ?? 'test-results/bondhon-live';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const mother = await browser.newContext({ baseURL: origin });
const provider = await browser.newContext({ baseURL: origin });
const guest = await browser.newContext({ baseURL: origin });
for (const context of [mother, provider, guest]) await context.addInitScript(() => {
  if (!localStorage.getItem('prohor-access-preferences-v1'))
    localStorage.setItem('prohor-access-preferences-v1', JSON.stringify({ language: 'en' }));
});
const results = [];
const created = [];
async function check(name, action) {
  try { await action(); results.push({ name, status: 'pass' }); console.log('PASS:', name); }
  catch (error) {
    results.push({ name, status: 'fail', error: error.message }); console.log('FAIL:', name, error.message);
    const page = mother.pages().at(-1);
    if (page) {
      await page.screenshot({ path: `${evidence}/failure-${results.length}.png`, fullPage: true }).catch(() => {});
      const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].map(el => ({
        tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 80),
        right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width,
      })).filter(el => el.right > innerWidth + 1)).catch(() => []);
      await writeFile(`${evidence}/failure-${results.length}.json`, JSON.stringify(overflow, null, 2));
    }
  }
}
async function post(context, path, data, key = randomUUID()) {
  return context.request.post(path, { headers: { origin, 'Idempotency-Key': key }, ...(data === undefined ? {} : { data }) });
}
async function data(response, status = 200) { assert.equal(response.status(), status); return (await response.json()).data; }
async function signIn(context, email, password) {
  const response = await context.request.post('/auth/sign-in', { headers: { origin }, data: { email, password, next: '/app' } });
  if (response.status() !== 200) {
    const body = await response.json().catch(() => ({}));
    await writeFile(`${evidence}/setup-failure.json`, JSON.stringify({ path: '/auth/sign-in', status: response.status(), code: body.code }, null, 2));
    assert.fail(`Sign-in returned ${response.status()} (${body.code ?? 'unknown'}).`);
  }
}
async function detail(context, id) { return data(await context.request.get(`/api/care-requests/${id}/coordination`)); }
let recipient;
function payload(patch = {}) {
  return { recipientUserId: recipient, message: 'Synthetic Bondhon verification', purpose: 'Synthetic routine visit', method: 'text',
    consentGrantIds: [], reviewConfirmed: true, coordination: { termsVersion: 'bondhon-demo-2026-11-19',
      expiresAt: new Date(Date.now() + 3600000).toISOString(), allowReplies: true, language: 'en', accommodations: [], records: [], ...patch } };
}
async function create(input = payload(), key = randomUUID()) {
  const row = await data(await post(mother, '/api/care-requests', input, key), 201); created.push(row.id); return row;
}
try {
  await signIn(mother, process.env.PROHOR_TEST_MOTHER_EMAIL ?? 'test.mother@prohor.demo', motherPassword);
  await signIn(provider, process.env.PROHOR_TEST_PROVIDER_EMAIL ?? 'test.provider@prohor.demo', providerPassword);
  const providerMe = await data(await provider.request.get('/api/me'));
  recipient = providerMe.id;
  await check('trusted roles and approved named recipient', async () => {
    assert.equal(providerMe.role, 'provider');
    assert.equal((await data(await mother.request.get('/api/me'))).role, 'mother');
    assert.ok((await data(await mother.request.get('/api/care-recipients'))).some(row => row.id === recipient));
  });
  if (!process.argv.includes('--ui-only')) {
  await check('anonymous and cross-role access denied', async () => {
    assert.equal((await guest.request.get('/api/care-requests')).status(), 401);
    assert.equal((await provider.request.get('/api/care-records')).status(), 403);
    assert.equal((await mother.request.get('/api/provider/requests')).status(), 403);
  });
  await check('missing permission is rejected by HTTP', async () => {
    const { coordination, ...input } = payload(); void coordination;
    const response = await post(mother, '/api/care-requests', input);
    if (response.status() === 201) created.push((await data(response, 201)).id);
    assert.equal(response.status(), 400);
  });
  await check('expiry, diary and unknown record rejected', async () => {
    for (const patch of [{ expiresAt: new Date(Date.now() - 86400000).toISOString() },
      { expiresAt: new Date(Date.now() + 31 * 86400000).toISOString() },
      { records: [{ type: 'wellness_diary_entry', id: randomUUID(), fields: ['text'] }] },
      { records: [{ type: 'pregnancy_record', id: randomUUID(), fields: ['label'] }] }]) {
      const response = await post(mother, '/api/care-requests', payload(patch));
      if (response.status() === 201) {
        const row = await data(response, 201); created.push(row.id);
        assert.fail(`Unexpected creation for ${JSON.stringify(patch)}; database approvedAt=${row.coordination.approvedAt}`);
      }
      assert.ok([400, 404].includes(response.status()), `${response.status()} ${JSON.stringify(patch)}`);
    }
  });
  await check('create, replay, changed retry, acknowledge, reply, follow-up and refresh', async () => {
    const input = payload(); const key = randomUUID(); const row = await create(input, key);
    assert.ok(row.coordination.approvedAt);
    assert.equal((await data(await post(mother, '/api/care-requests', input, key), 201)).id, row.id);
    assert.equal((await post(mother, '/api/care-requests', { ...input, message: 'Changed' }, key)).status(), 409);
    assert.equal((await detail(provider, row.id)).request.id, row.id);
    const ack = await data(await post(provider, `/api/provider/requests/${row.id}/acknowledge`, { expectedRevision: row.revision }));
    const reply = await data(await post(provider, `/api/provider/requests/${row.id}/respond`, { expectedRevision: ack.revision, message: 'Synthetic provider reply' }));
    const follow = await data(await post(mother, `/api/care-requests/${row.id}/messages`, { expectedRevision: reply.revision, message: 'Synthetic follow-up' }));
    assert.ok(follow.messages.some(item => item.message === 'Synthetic provider reply'));
    assert.equal((await post(mother, `/api/care-requests/${row.id}/messages`, { expectedRevision: row.revision, message: 'Stale' })).status(), 409);
    assert.ok((await detail(mother, row.id)).messages.some(item => item.message === 'Synthetic follow-up'));
    await data(await post(mother, `/api/care-requests/${row.id}/revoke`));
    await data(await post(mother, `/api/care-requests/${row.id}/revoke`));
    assert.equal((await provider.request.get(`/api/care-requests/${row.id}/coordination`)).status(), 404);
    assert.equal((await post(provider, `/api/provider/requests/${row.id}/acknowledge`, { expectedRevision: row.revision })).status(), 404);
  });
  await check('view-only blocks original and follow-up replies; closure removes access', async () => {
    const row = await create(payload({ allowReplies: false }));
    const ack = await data(await post(provider, `/api/provider/requests/${row.id}/acknowledge`, { expectedRevision: row.revision }));
    assert.equal((await post(provider, `/api/provider/requests/${row.id}/respond`, { expectedRevision: ack.revision, message: 'Denied' })).status(), 403);
    assert.equal((await post(mother, `/api/care-requests/${row.id}/messages`, { expectedRevision: ack.revision, message: 'Denied' })).status(), 403);
    await data(await post(mother, `/api/care-requests/${row.id}/close`, { expectedRevision: ack.revision }));
    assert.equal((await provider.request.get(`/api/care-requests/${row.id}/coordination`)).status(), 404);
  });
  await check('owner pagination has no duplicate requests', async () => {
    const ids = new Set(); let cursor; let pages = 0;
    do {
      const page = await data(await mother.request.get('/api/care-requests?limit=5' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')));
      for (const item of page.items) {
        assert.ok(!ids.has(item.id)); ids.add(item.id);
        // Close leftovers from interrupted runs of this exact synthetic runner.
        if (item.message === 'Synthetic Bondhon verification' && item.purpose === 'Synthetic routine visit') created.push(item.id);
      }
      cursor = page.nextCursor; assert.ok(++pages < 100);
    } while (cursor);
  });
  await check('natural hosted expiry denies reads and writes without changing database rows', async () => {
    const clock = await create();
    const expiresAt = new Date(Date.parse(clock.coordination.approvedAt) + 16000).toISOString();
    const row = await create(payload({ expiresAt }));
    await detail(provider, row.id);
    await new Promise(resolve => setTimeout(resolve, 18000));
    assert.equal((await provider.request.get(`/api/care-requests/${row.id}/coordination`)).status(), 404);
    assert.equal((await post(provider, `/api/provider/requests/${row.id}/acknowledge`, { expectedRevision: row.revision })).status(), 404);
    assert.equal((await detail(mother, row.id)).request.id, row.id);
  });
  await check('Bujhi reviewed save, repeat save, Jibonrekha persistence and exact-field sharing', async () => {
    const existing = await mother.request.get('/api/jibonrekha'); assert.equal(existing.status(), 200);
    let pregnancyId = (await existing.json()).pregnancies[0]?.id;
    if (!pregnancyId) {
      const response = await post(mother, '/api/jibonrekha', { type: 'pregnancy', record: {
        label: 'Synthetic Bondhon verification pregnancy', estimatedDueDate: null, lastMenstrualPeriodDate: null,
      } }); assert.equal(response.status(), 201); pregnancyId = (await response.json()).id;
    }
    const input = { reportId: randomUUID(), pregnancyId, sourceSha256: 'b'.repeat(64), rawLabel: 'Hemoglobin',
      rawValue: '11.4', rawUnit: 'g/dL', reviewedValue: '11.4', reviewedUnit: 'g/dL', observedOn: '2026-11-18', confirmSave: true };
    const response = await post(mother, '/api/reports/commit', input); assert.equal(response.status(), 200);
    const saved = await response.json(); assert.ok(saved.saved);
    const retry = await post(mother, '/api/reports/commit', input); assert.equal(retry.status(), 200);
    assert.equal((await retry.json()).observationId, saved.observationId);
    const records = await (await mother.request.get('/api/jibonrekha')).json();
    assert.ok(records.observations.some(item => item.id === saved.observationId && item.verification === 'user_verified'));
    const row = await create(payload({ records: [{ type: 'maternal_observation', id: saved.observationId, fields: ['measurement'] }] }));
    const shown = (await detail(provider, row.id)).request.consentedRecords;
    assert.deepEqual(Object.keys(shown[0].fields), ['measurement']);
    assert.deepEqual(shown[0].fields.measurement, { kind: 'hemoglobin', value: '11.4', unit: 'g/dL' });
  });
  await check('provider browser acknowledges and sends a persisted reviewed reply', async () => {
    const purpose = 'Synthetic provider UI ' + randomUUID().slice(0, 8);
    const row = await create({ ...payload(), purpose });
    const providerPage = await provider.newPage();
    await providerPage.goto('/provider/bondhon');
    const entry = providerPage.getByRole('button', { name: new RegExp(purpose) });
    for (let i = 0; i < 20; i++) {
      if (await entry.count()) break;
      const more = providerPage.getByRole('button', { name: 'Load more requests' });
      if (await more.count()) await more.click(); else await providerPage.waitForTimeout(500);
    }
    await entry.click();
    await providerPage.getByRole('button', { name: 'Acknowledge simulated request' }).click();
    await providerPage.getByLabel('Follow-up message', { exact: true }).fill('Synthetic browser provider reply');
    await providerPage.getByRole('checkbox', { name: 'I reviewed this message.', exact: false }).check();
    const response = providerPage.waitForResponse(r => r.url().endsWith(`/api/provider/requests/${row.id}/respond`) && r.request().method() === 'POST');
    await providerPage.getByRole('button', { name: 'Send reviewed message' }).click();
    await data(await response);
    await providerPage.getByRole('listitem').filter({ hasText: 'Synthetic browser provider reply' }).waitFor();
    assert.ok((await detail(mother, row.id)).messages.some(item => item.message === 'Synthetic browser provider reply'));
    const axe = await new AxeBuilder({ page: providerPage }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(axe.violations.map(item => item.id), []);
    await providerPage.screenshot({ path: `${evidence}/provider-replied.png`, fullPage: true });
    await providerPage.close();
  });
  }
  if (!process.argv.includes('--api-only')) {
  const page = await mother.newPage();
  await check('mother form loads with no selected record or reply permission', async () => {
    await page.goto('/app/bondhon');
    await page.getByRole('button', { name: 'Create a reviewed request', exact: true }).click();
    await page.getByLabel('Named simulated recipient').selectOption(recipient);
    assert.equal(await page.locator('input[type=checkbox]:checked').count(), 0);
    await page.getByLabel('Purpose of this request').fill('Synthetic browser journey');
    await page.getByLabel('Message for this recipient').fill('Synthetic browser message');
    await page.screenshot({ path: `${evidence}/mother-compose.png`, fullPage: true });
  });
  await check('keyboard review focus, unchecked approval and accessible review', async () => {
    const review = page.getByRole('button', { name: 'Review information and permissions', exact: true });
    await review.focus(); await page.keyboard.press('Enter');
    const heading = page.getByRole('heading', { name: 'Review your sharing decision' });
    await heading.waitFor(); assert.equal(await heading.evaluate(el => el === document.activeElement), true);
    assert.equal(await page.getByRole('button', { name: 'Approve and send to simulated queue' }).isDisabled(), true);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    await writeFile(`${evidence}/axe-review.json`, JSON.stringify(axe.violations, null, 2));
    assert.deepEqual(axe.violations.map(item => item.id), []);
    await page.screenshot({ path: `${evidence}/mother-review.png`, fullPage: true });
  });
  await writeFile(`${evidence}/page-text.txt`, await page.locator('main').innerText());
  async function preferences(values) {
    await page.evaluate(values => {
      const key = 'prohor-access-preferences-v1';
      const prefs = { ...JSON.parse(localStorage.getItem(key) ?? '{}'), ...values };
      localStorage.setItem(key, JSON.stringify(prefs));
      document.documentElement.lang = prefs.language;
      document.documentElement.dataset.theme = prefs.theme;
      document.documentElement.dataset.contrast = prefs.highContrast ? 'more' : 'standard';
      document.documentElement.dataset.layout = prefs.layoutDensity;
      document.documentElement.dataset.motion = prefs.reducedMotion ? 'reduce' : 'full';
      window.dispatchEvent(new CustomEvent('prohor-preferences-change', { detail: prefs }));
    }, values);
  }
  await check('English/Bangla review reflows at all required widths and 200% text', async () => {
    for (const language of ['en', 'bn']) {
      await preferences({ language });
      for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const scale of ['100%', '200%']) {
          await page.evaluate(scale => { document.documentElement.style.fontSize = scale; }, scale);
          const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el =>
            el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed').map(el => ({
              tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width,
            })).slice(-15));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${language} ${width} ${scale} ${JSON.stringify(overflow)}`);
        }
      }
      await page.setViewportSize({ width: 320, height: 900 });
      await page.screenshot({ path: `${evidence}/review-${language}-320-200.png`, fullPage: true });
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await preferences({ language: 'en' });
  });
  await check('themes, contrast, spacious layout and reduced motion preserve review', async () => {
    for (const theme of ['quiet-garden', 'original-rose', 'morning-mist']) {
      for (const highContrast of [false, true]) {
        await preferences({ theme, highContrast, layoutDensity: 'spacious', reducedMotion: true });
        assert.equal(await page.getByRole('heading', { name: 'Review your sharing decision' }).count(), 1);
        assert.ok((await page.locator('main').innerText()).includes('Synthetic browser message'));
        // Language/voice loading changes disabled state; wait for its finite opacity transition.
        await page.waitForFunction(() => {
          const button = document.querySelector('button[aria-label="Read my sharing summary"]');
          return button && !button.disabled && Number(getComputedStyle(button).opacity) === 1;
        });
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        await writeFile(`${evidence}/axe-${theme}-${highContrast}.json`, JSON.stringify(axe.violations, null, 2));
        assert.deepEqual(axe.violations.map(item => item.id), [], `${theme}/${highContrast}`);
      }
    }
    await preferences({ theme: 'quiet-garden', highContrast: false });
  });
  await check('keyboard approval submits once and shows persisted receipt', async () => {
    const approval = page.getByRole('checkbox', { name: 'I approve sharing exactly this information', exact: false });
    await approval.focus(); await page.keyboard.press('Space');
    const response = page.waitForResponse(r => r.url().endsWith('/api/care-requests') && r.request().method() === 'POST');
    await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    const row = await data(await response, 201); created.push(row.id);
    assert.ok(row.coordination.approvedAt);
    await page.getByRole('button', { name: 'Revoke future access', exact: true }).waitFor();
    await page.screenshot({ path: `${evidence}/mother-saved.png`, fullPage: true });
  });
  await check('Shonket draft, method, editing and explicit reviewed permission survive', async () => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.goto('/app/care');
    await page.getByLabel('Your message', { exact: true }).fill('Synthetic Shonket draft');
    await page.getByRole('radio', { name: /AAC-friendly/ }).focus(); await page.keyboard.press('Space');
    await page.getByRole('link', { name: 'Review message' }).click();
    const message = page.getByLabel('Message for this recipient');
    await message.waitFor(); assert.equal(await message.inputValue(), 'Synthetic Shonket draft');
    assert.equal(await page.getByLabel('Preferred communication').inputValue(), 'aac');
    await message.fill(''); assert.equal(await message.count(), 1, 'clearing the draft must keep the editor mounted');
    await message.fill('Synthetic edited Shonket draft');
    await page.getByRole('link', { name: 'Human help', exact: true }).click();
    assert.equal(await page.getByLabel('Your message', { exact: true }).inputValue(), 'Synthetic edited Shonket draft');
    await page.getByRole('link', { name: 'Review message' }).click();
    await page.getByLabel('Named simulated recipient').selectOption(recipient);
    await page.getByLabel('Purpose of this request').fill('Synthetic Shonket regression');
    await page.getByRole('button', { name: 'Review information and permissions' }).click();
    assert.equal(await page.getByRole('button', { name: 'Approve and send to simulated queue' }).isDisabled(), true);
    await page.getByRole('checkbox', { name: 'I approve sharing exactly this information', exact: false }).check();
    const response = page.waitForResponse(r => r.url().endsWith('/api/care-requests') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Approve and send to simulated queue' }).click();
    const row = await data(await response, 201); created.push(row.id);
    await page.waitForURL('**/app/care/status?id=*');
    await page.getByText('Permission ends', { exact: true }).waitFor();
    assert.ok(!(await page.locator('main').innerText()).includes('after 7 days'));
    await page.screenshot({ path: `${evidence}/shonket-status.png`, fullPage: true });
  });
  await check('Bangla composition, review, approval and saved receipt', async () => {
    await preferences({ language: 'bn' });
    await page.goto('/app/bondhon');
    await page.getByRole('button', { name: 'পর্যালোচনা করে অনুরোধ তৈরি করুন' }).click();
    await page.getByLabel('নামসহ সিমুলেটেড প্রাপক').selectOption(recipient);
    await page.getByLabel('এই অনুরোধের উদ্দেশ্য').fill('নমুনা নিয়মিত সাক্ষাতের প্রস্তুতি');
    await page.getByLabel('এই প্রাপকের জন্য বার্তা').fill('এটি পরীক্ষার নমুনা বার্তা।');
    await page.getByRole('button', { name: 'তথ্য ও অনুমতি পর্যালোচনা করুন' }).click();
    await page.getByRole('heading', { name: 'তথ্য শেয়ারের সিদ্ধান্ত পর্যালোচনা করুন' }).waitFor();
    await page.getByRole('checkbox', { name: 'উল্লিখিত সময় পর্যন্ত', exact: false }).check();
    const response = page.waitForResponse(r => r.url().endsWith('/api/care-requests') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'অনুমতি দিয়ে সিমুলেটেড তালিকায় পাঠান' }).click();
    const row = await data(await response, 201); created.push(row.id); assert.equal(row.coordination.language, 'bn');
    await page.getByRole('heading', { name: 'অনুরোধ ও অনুমতি' }).waitFor();
    await page.screenshot({ path: `${evidence}/bangla-saved.png`, fullPage: true });
  });
  await check('public emergency link reaches the care section and Barta stays grounded', async () => {
    await preferences({ language: 'en' });
    await page.goto('/app/bondhon');
    await page.getByRole('link', { name: 'Open emergency and care information' }).click();
    await page.waitForURL('**/poth#poth-sos'); assert.equal(await page.locator('#poth-sos').count(), 1);
    const response = await guest.request.post('/api/ai/chat', { data: { question: 'What happens at ANC visits?', language: 'en', retention: { mode: 'ephemeral' } } });
    assert.equal(response.status(), 200);
    const answer = await response.json();
    await writeFile(`${evidence}/barta-regression.json`, JSON.stringify(answer, null, 2));
    assert.ok(answer.status !== 'not_connected');
    assert.equal((await guest.request.get('/api/poth/facilities')).status(), 200);
  });
  await check('network failure retains the exact reviewed payload and retry key', async () => {
    await page.goto('/app/bondhon');
    await page.getByRole('button', { name: 'Create a reviewed request' }).click();
    await page.getByLabel('Named simulated recipient').selectOption(recipient);
    await page.getByLabel('Purpose of this request').fill('Synthetic network retry');
    await page.getByLabel('Message for this recipient').fill('Synthetic preserved draft');
    await page.getByRole('button', { name: 'Review information and permissions' }).click();
    await page.getByRole('checkbox', { name: 'I approve sharing exactly this information', exact: false }).check();
    let first;
    const path = '**/api/care-requests';
    await page.route(path, async route => {
      if (route.request().method() === 'POST') {
        first = { key: route.request().headers()['idempotency-key'], body: route.request().postData() };
        await route.abort('failed');
      } else await route.continue();
    });
    await page.getByRole('button', { name: 'Approve and send to simulated queue' }).click();
    await page.getByRole('alert').filter({ hasText: 'Submission unconfirmed' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Back to edit' }).isDisabled(), true);
    await page.unroute(path);
    const response = page.waitForResponse(r => r.url().endsWith('/api/care-requests') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Retry the same request' }).click();
    const sent = await response;
    assert.equal(sent.request().headers()['idempotency-key'], first.key);
    assert.equal(sent.request().postData(), first.body);
    const row = await data(sent, 201); created.push(row.id);
  });
  }
} catch (error) {
  results.push({ name: 'live session setup or unhandled workflow', status: 'fail', error: error.message });
  console.log('FAIL: live workflow', error.message);
} finally {
  const cleanupFailures = [];
  for (const id of new Set(created)) {
    try { const row = (await detail(mother, id)).request;
      if (row.status !== 'closed') {
        const closed = await data(await post(mother, `/api/care-requests/${id}/close`, { expectedRevision: row.revision }));
        assert.equal(closed.status, 'closed');
      }
    } catch { cleanupFailures.push(id); }
  }
  await check('all synthetic requests from this run are closed', async () => { assert.equal(cleanupFailures.length, 0); });
  await writeFile(`${evidence}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
  server?.kill();
}
console.log(JSON.stringify({ passed: results.filter(r => r.status === 'pass').length, failed: results.filter(r => r.status === 'fail').length }));
if (results.some(r => r.status === 'fail')) process.exitCode = 1;
