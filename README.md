# karma-meter

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
/plugin marketplace add /path/to/pr-karma
/plugin install karma-meter@pr-karma
```

To install from GitHub, replace `/path/to/pr-karma` with `<owner>/pr-karma`. Start a new session. The dial appears above the prompt after the first fetch.

## Uninstall

```
/plugin uninstall karma-meter@pr-karma
/plugin marketplace remove pr-karma
```

The second command is optional. It removes the marketplace entry.
