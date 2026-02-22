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
  contents: read
  pull-requests: write

jobs:
  review:
    name: Review
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Code Review
        uses: tarmojussila/minimax-code-review@v0.1.0
        with:
          MINIMAX_API_KEY: ${{ secrets.MINIMAX_API_KEY }}
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `MINIMAX_API_KEY` | Yes | — | Your MiniMax API key |
| `MINIMAX_MODEL` | No | `MiniMax-M2.5` | MiniMax model to use for review |

## Configuration

To use this action, you must add your MiniMax API key as a GitHub secret.

### 1️⃣ Get your MiniMax API key

Generate an API key from your MiniMax dashboard.

### 2️⃣ Add the API key to your repository

1. Go to your GitHub repository  
2. Click **Settings**  
3. Navigate to **Secrets and variables → Actions**  
4. Click **New repository secret**  
5. Add:

   - **Name:** `MINIMAX_API_KEY`  
   - **Value:** your MiniMax API key  

6. Click **Save**

## Contributing

Contributions are welcome. See the [CONTRIBUTING](CONTRIBUTING.md) file for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.