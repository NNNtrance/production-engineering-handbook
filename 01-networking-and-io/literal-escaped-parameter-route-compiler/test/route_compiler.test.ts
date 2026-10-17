import test from 'node:test';
import assert from 'node:assert/strict';
import { compileRoutePath, escapeRegex } from '../src/route_compiler.ts';

test('route with dot literal (/v1.0/[id]) matches exact dot and rejects wildcard matches (/v1x0/[id])', () => {
  const { regex, paramNames } = compileRoutePath('/v1.0/[id]');

  assert.deepEqual(paramNames, ['id']);

  // Matches exact dot
  assert.equal(regex.test('/v1.0/42'), true);

  // Rejects when character replaces dot
  assert.equal(regex.test('/v1x0/42'), false);
  assert.equal(regex.test('/v1-0/42'), false);
});

test('route with parenthesis literal (/(draft)/[slug]) treats parentheses literally without capturing groups', () => {
  const { regex, paramNames } = compileRoutePath('/posts/(draft)/[slug]');

  // Only [slug] is registered as a parameter; (draft) is not a capturing group
  assert.deepEqual(paramNames, ['slug']);

  // Matches exact literal parentheses
  const match = regex.exec('/posts/(draft)/my-first-post');
  assert.notEqual(match, null);
  assert.equal(match![1], 'my-first-post');
  assert.equal(match!.length, 2); // full match + 1 capture group

  // Rejects when literal parentheses are omitted
  assert.equal(regex.test('/posts/draft/my-first-post'), false);
  assert.equal(regex.test('/posts/published/my-first-post'), false);
});

test('escapeRegex escapes all standard regex metacharacters', () => {
  const raw = 'api.v1+user[id]*(draft)?^${}|\\';
  const escaped = escapeRegex(raw);
  assert.equal(escaped, 'api\\.v1\\+user\\[id\\]\\*\\(draft\\)\\?\\^\\$\\{\\}\\|\\\\');
});
