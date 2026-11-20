import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = stripTypeScriptTypes(readFileSync(new URL('../../src/features/bondhon/bondhon-journey.ts', import.meta.url), 'utf8'));
const { composeIssue, recordDescription, reconcileSelection } = await import('data:text/javascript,' + encodeURIComponent(source));
const record = (id, fields, type = 'maternal_observation') => ({ record: { type, id, fields } });
test('whitespace-only messages cannot leave the compose step', () => {
  assert.equal(composeIssue(0, { purpose: ' \n ', message: 'hello', recipient: '' }, []), 'message');
  assert.equal(composeIssue(0, { purpose: 'Visit', message: '\t', recipient: '' }, []), 'message');
  assert.equal(composeIssue(0, { purpose: 'সাক্ষাৎ', message: 'সহায়তা চাই', recipient: '' }, []), null);
});
test('a recipient removed during refresh must be selected again, without blocking optional support', () => {
  const draft = { purpose: 'Visit', message: 'Help', recipient: 'removed' };
  assert.equal(composeIssue(1, draft, [{ id: 'available' }]), 'recipient');
  assert.equal(composeIssue(1, { ...draft, recipient: 'available' }, [{ id: 'available' }]), null);
  assert.equal(composeIssue(2, draft, []), null);
});
test('refresh removes inaccessible selections and never adds newly available fields', () => {
  const selection = { 'maternal_observation/a': ['measurement', 'note', 'measurement'], 'baby_record/gone': ['label'] };
  const original = structuredClone(selection);
  assert.deepEqual(reconcileSelection(selection, [record('a', { measurement: {}, provenance: {} })]), { 'maternal_observation/a': ['measurement'] });
  assert.deepEqual(selection, original);
  assert.deepEqual(reconcileSelection(selection, []), {});
});
test('records with the same id but different types cannot acquire each other’s fields', () => {
  assert.deepEqual(reconcileSelection({ 'baby_record/a': ['label'] }, [record('a', { label: 'Mother' }, 'pregnancy_record')]), {});
});
test('measurement titles are bilingual descriptions of stored kinds, without inferred diagnoses', () => {
  assert.equal(recordDescription(record('a', { measurement: { kind: 'hemoglobin', value: '11.4' } }).record, 'en'), 'Haemoglobin');
  assert.equal(recordDescription(record('a', { measurement: { kind: 'systolic_blood_pressure' } }).record, 'bn'), 'রক্তচাপ · সিস্টোলিক');
  assert.equal(recordDescription(record('a', { measurement: { kind: 'unknown_kind' } }).record, 'en'), null);
  assert.equal(recordDescription(record('a', { measurement: 'bad' }).record, 'en'), null);
});
test('labels remain source text; no sample patient or measurement is fabricated', () => {
  assert.equal(recordDescription(record('a', { label: 'My chosen label' }, 'pregnancy_record').record, 'en'), 'My chosen label');
  assert.equal(recordDescription(record('a', {}).record, 'bn'), null);
  assert.deepEqual(reconcileSelection({}, [record('a', { measurement: {} })]), {});
});
