import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignal, createEffect, batch } from '../src/nested_batching.ts';

test('nested batching coalesces multiple writes into a single effect execution', () => {
  const [getX, setX] = createSignal(0);
  const [getY, setY] = createSignal(0);
  const [getZ, setZ] = createSignal(0);

  let effectRuns = 0;
  let observedSum = 0;

  createEffect(() => {
    effectRuns++;
    observedSum = getX() + getY() + getZ();
  });

  // Initial effect execution on registration
  assert.equal(effectRuns, 1);
  assert.equal(observedSum, 0);

  // 3 writes inside nested batch
  batch(() => {
    setX(10);
    batch(() => {
      setY(20);
      setZ(30);
    });
    // Inner batch should NOT have flushed prematurely
    assert.equal(effectRuns, 1);
  });

  // Exactly 1 additional effect run after outermost batch finishes
  assert.equal(effectRuns, 2);
  assert.equal(observedSum, 60);
});

test('Object.is short-circuits identical writes without triggering effects', () => {
  const [getVal, setVal] = createSignal(100);
  let runs = 0;

  createEffect(() => {
    runs++;
    getVal();
  });

  assert.equal(runs, 1);

  // Write identical primitive value
  setVal(100);
  assert.equal(runs, 1);

  // NaN equality via Object.is
  const [getNaN, setNaN] = createSignal(NaN);
  let nanRuns = 0;
  createEffect(() => {
    nanRuns++;
    getNaN();
  });
  assert.equal(nanRuns, 1);
  setNaN(NaN);
  assert.equal(nanRuns, 1);
});
