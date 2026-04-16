# Security Policy

## Supported Versions

Only the latest release of this action is actively maintained and receives security fixes.

See the [releases page](../../releases) for latest available version.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Use [GitHub's private vulnerability reporting](https://github.com/tarmojussila/minimax-code-review/security/advisories/new) to submit a report.

When reporting, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Any suggested fix if you have one

## Security Considerations for Users

### API Key Handling

- Store your `MINIMAX_API_KEY` exclusively as a [GitHub Actions secret](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) — never as a plain variable or hardcoded in the workflow file.
- Restrict secret access to only the workflows that need it.

### Action Permissions

This action requires the following minimum permissions to write PR comments:

```yaml
permissions:
  pull-requests: write
```

Do not grant broader permissions than what is listed above.

### Pinning to a Specific Version

For supply chain security, pin the action to a specific release tag rather than a mutable branch name:

```yaml
uses: tarmojussila/minimax-code-review@v0.4.0
```

Avoid using branch names such as `@main` in production workflows.
