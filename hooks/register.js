import { dial, karma } from './dial.js'

// GitHub search allows 30 requests a minute; ten minutes keeps the dial fresh enough.
const REFRESH_MS = 10 * 60 * 1000
// Reading the shared store is cheap, so every session picks up another session's fetch within a minute.
const CHECK_MS = 60 * 1000

let counts = null

// Monday 00:00 local time, as YYYY-MM-DD.
function weekStart(now) {
  const d = new Date(now)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toLocaleDateString('en-CA')
}

async function searchCount($, query) {
  const { exitCode, stdout } = await $.process.run(['gh', 'api', 'search/issues?q=' + query, '-q', '.total_count'])
  return exitCode === 0 ? Number(stdout.trim()) : null
}

// $.store is this plugin's own, shared by all its sessions on the machine, so only one of them asks GitHub per period.
async function refresh($) {
  const now = await $.clock.now()
  const week = weekStart(now)
  const saved = await $.store.get('counts')
  if (saved?.week === week && now - saved.at < REFRESH_MS) {
    counts = saved
  } else {
    // shortcut: two sessions that check at the same moment can both fetch; harmless at this request rate.
    const opened = await searchCount($, `type:pr+author:@me+created:>=${week}`)
    // shortcut: counts PRs I reviewed at any time that got activity this week; GraphQL contributions hide private repos.
    const reviewed = await searchCount($, `type:pr+reviewed-by:@me+-author:@me+updated:>=${week}`)
    if (opened === null || reviewed === null) return
    counts = { opened, reviewed, week, at: now }
    await $.store.set('counts', counts)
  }
  $.ui.invalidate('ui.render')
}

export function register(on) {
  on('session.start', async ($, e, next) => {
    refresh($)
    $.clock.every(CHECK_MS, () => refresh($))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!counts) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const { p, label, good } = karma(counts.opened, counts.reviewed)
    const captions = [
      Text({ color: good ? 'green' : 'red', children: [good ? ' good karma' : ' bad karma'] }),
      Text({ dimColor: true, children: [` ${label}  ${counts.reviewed} reviewed / ${counts.opened} opened`] }),
    ]
    const lines = dial(p).map((cells, row) =>
      Box({ key: 'row' + row, flexDirection: 'row', children: cells.map((c) => Text({ color: c.color, children: [c.char] })) }),
    )
    // Dial and captions are two columns, so captions of different lengths cannot shift the dial rows apart.
    const others = await next(e)
    const meter = Box({
      key: 'karma',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      children: [
        Box({ key: 'dial', flexDirection: 'column', children: lines }),
        Box({ key: 'captions', flexDirection: 'column', children: captions }),
      ],
    })
    return Box({ flexDirection: 'column', children: others ? [others, meter] : [meter] })
  })
}
