# pr-karma-meter

> [!WARNING]
> This plugin was written with AI (Claude Code). Read the code before you install it.

A Claude Code plugin that shows a small analog dial above the prompt. The dial compares the pull requests you reviewed this week with the pull requests you opened this week.

- The needle points straight up when you reviewed as many PRs as you opened.
- The needle moves right (green) when you review more, and left (red) when you open more. At 4x in either direction, the needle stops at the end.
- The week starts on Monday at 00:00 local time.
- The plugin asks GitHub for new counts every 10 minutes at most. All Claude Code sessions on the machine share the same counts.

"Reviewed" counts PRs by other authors that you reviewed and that had activity this week. A review from an earlier week can count if the PR changed this week.

## Requirements

- Claude Code with plugin mods (hook modules) support.
- The [GitHub CLI](https://cli.github.com/) (`gh`) on your `PATH`.
- `gh` logged in to your GitHub account: run `gh auth login`, then check with `gh auth status`.

If `gh` fails, the dial does not appear.

## Install

```
/plugin marketplace add JaimeSeqLabs/pr-karma
/plugin install pr-karma-meter@pr-karma
```

To install from a local clone, replace `JaimeSeqLabs/pr-karma` with the path to the clone. Start a new session. The dial appears above the prompt after the first fetch.

## Uninstall

```
/plugin uninstall pr-karma-meter@pr-karma
/plugin marketplace remove pr-karma
```

The second command is optional. It removes the marketplace entry.

## Development

`tsconfig.json` extends `.claude-plugin/types/tsconfig.json`. Claude Code writes that folder each time it loads the plugin from a local folder, so git ignores it. On a fresh clone, install the plugin from the clone (see [Install](#install)) and start a session once before you type-check.
