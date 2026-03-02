# MiniMax Code Review

AI-powered GitHub Pull Request code review using MiniMax models. Automatic PR comments, bug detection, and improvement suggestions via GitHub Actions.

## Features

- 🚀 Detect bugs
- 🔍 Suggest improvements
- 🧠 AI-driven PR feedback
- ⚡ Works with GitHub Actions

## Quickstart

Add this to your `.github/workflows/code-review.yml`:

```yaml
name: AI Code Review with MiniMax

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write

jobs:
  review:
    name: Review
    runs-on: ubuntu-latest
    steps:
      - name: Code Review
        uses: tarmojussila/minimax-code-review@v0.3.0
        with:
          MINIMAX_API_KEY: ${{ secrets.MINIMAX_API_KEY }}
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `MINIMAX_API_KEY` | Yes | — | Your MiniMax API key |
| `MINIMAX_MODEL` | No | `MiniMax-M2.5` | MiniMax model to use for review |
| `MINIMAX_SYSTEM_PROMPT` | No | See below | Custom system prompt for the AI reviewer |
| `MINIMAX_REVIEWER_NAME` | No | `MiniMax Code Review` | Name shown in the review comment header |

The default system prompt is:

> You are an expert code reviewer. Review the provided code changes and give clear, actionable feedback.

You can override it to focus on specific concerns, enforce coding standards, or adjust the review tone, e.g.:

> You are a security-focused code reviewer. Identify vulnerabilities, unsafe patterns, and authentication issues. Skip style comments.

## Configuration

To use this action, you must add your MiniMax API key as a GitHub secret.

### 1️⃣ Get your MiniMax API key

Generate an API key from your MiniMax dashboard.

### 2️⃣ Add the API key to your repository

1. Go to your GitHub repository
2. Click **Settings**
3. Navigate to **Secrets and variables → Actions**  
4. Click **New repository secret** and add:

   - **Name:** `MINIMAX_API_KEY` — **Value:** your MiniMax API key

## Advanced configuration

Instead of using default values for `MINIMAX_MODEL`, `MINIMAX_SYSTEM_PROMPT`, and `MINIMAX_REVIEWER_NAME`, you can override them, and manage them as GitHub Actions variables. This lets you update the model, review prompt, or reviewer name without touching the workflow file.

### 1️⃣ Add the variables to your repository

1. Go to your GitHub repository
2. Click **Settings**
3. Navigate to **Secrets and variables → Actions**
4. Click the **Variables** tab
5. Click **New repository variable** and add:

   - **Name:** `MINIMAX_MODEL` — **Value:** e.g. `MiniMax-M2.5`
   - **Name:** `MINIMAX_SYSTEM_PROMPT` — **Value:** your custom system prompt
   - **Name:** `MINIMAX_REVIEWER_NAME` — **Value:** e.g. `AI Code Review`

### 2️⃣ Reference them in your workflow

```yaml
      - name: Code Review
        uses: tarmojussila/minimax-code-review@v0.3.0
        with:
          MINIMAX_API_KEY: ${{ secrets.MINIMAX_API_KEY }}
          MINIMAX_MODEL: ${{ vars.MINIMAX_MODEL }}
          MINIMAX_SYSTEM_PROMPT: ${{ vars.MINIMAX_SYSTEM_PROMPT }}
          MINIMAX_REVIEWER_NAME: ${{ vars.MINIMAX_REVIEWER_NAME }}
```

## Contributing

Contributions are welcome. See the [CONTRIBUTING](CONTRIBUTING.md) file for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.