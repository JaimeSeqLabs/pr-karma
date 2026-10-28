import { expect, mock, test } from 'claude-code/testing'

// Wednesday 2026-10-28 12:00 local time; its week starts on Monday 2026-10-26.
const NOW = new Date(2026, 9, 28, 12).getTime()
const MINUTE = 60 * 1000

// Stubs gh (9 opened, 3 reviewed) and the store, and records what the mod did.
function stubs(on, saved) {
  const calls = { gh: 0, stored: undefined, clock: mock.clock(on, { now: NOW }) }
  on('session.start', () => ({ cwd: '/work' }))
  on('store.get', () => ({ value: saved }))
  on('store.set', ($, e) => {
    calls.stored = e.value
    return { value: undefined }
  })
  on('process.run', ($, e) => {
    calls.gh += 1
    return { value: { exitCode: 0, stdout: e.argv[2].includes('reviewed-by') ? '3\n' : '9\n', stderr: '' } }
  })
  return calls
}

test('a fresh entry from another session is used without asking GitHub', async ($, on) => {
  const calls = stubs(on, { opened: 1, reviewed: 2, week: '2026-10-26', at: NOW - 5 * MINUTE })
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  // refresh runs in the background; let it finish before checking
  await calls.clock.settle()
  expect(calls.gh).toBe(0)
  expect(calls.stored).toBeUndefined()
})

test('an entry older than ten minutes is fetched again and shared', async ($, on) => {
  const calls = stubs(on, { opened: 1, reviewed: 2, week: '2026-10-26', at: NOW - 11 * MINUTE })
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  // refresh runs in the background; let it finish before checking
  await calls.clock.settle()
  expect(calls.gh).toBe(2)
  expect(calls.stored).toEqual({ opened: 9, reviewed: 3, week: '2026-10-26', at: NOW })
})

test('an entry from last week is fetched again even when it is recent', async ($, on) => {
  const calls = stubs(on, { opened: 1, reviewed: 2, week: '2026-10-19', at: NOW - MINUTE })
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  // refresh runs in the background; let it finish before checking
  await calls.clock.settle()
  expect(calls.gh).toBe(2)
})
