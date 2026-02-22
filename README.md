# MiniMax Code Review

AI-powered GitHub Pull Request code review using MiniMax models. Automatic PR comments, bug detection, and improvement suggestions via GitHub Actions.

## Features

- 🚀 Detect bugs
- 🔍 Suggest improvements
- 🧠 AI-driven PR feedback
- ⚡ Works with GitHub Actions

## Quickstart

Add this to your `.github/workflows/ai-review.yml`:

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: tarmojussila/minimax-code-review@v1
        with:
          api_key: ${{ secrets.MINIMAX_API_KEY }}
```

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

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
