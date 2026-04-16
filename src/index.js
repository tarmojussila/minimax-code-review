const core = require('@actions/core');
const github = require('@actions/github');

const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/chat/completions';
const COMMENT_MARKER = '<!-- minimax-code-review -->';
const MAX_RESPONSE_SIZE = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 300_000;

function matchesPattern(filename, pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\x00')
    .replace(/\*/g, '[^/]*')
    .replace(/\x00/g, '.*');
  const regex = new RegExp(`^${escaped}$`);
  const basename = filename.split('/').pop();
  return regex.test(filename) || regex.test(basename);
}

function filterFiles(files, excludePatterns) {
  if (!excludePatterns || excludePatterns.length === 0) {
    return files;
  }
  return files.filter(f => !excludePatterns.some(p => matchesPattern(f.filename, p)));
}

async function getChangedFiles(octokit, owner, repo, pullNumber) {
  const files = [];
  let page = 1;
  while (true) {
    const { data } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
      page,
    });
    files.push(...data);
    if (data.length < 100) {
      break;
    }
    page++;
  }
  return files;
}

function buildPrompt(files, maxDiffChars) {
  const patchableFiles = files.filter(f => f.patch);
  const includedDiffs = [];
  const skippedFiles = [];
  let totalChars = 0;

  for (const f of patchableFiles) {
    const entry = `### ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``;
    if (maxDiffChars > 0 && totalChars + entry.length > maxDiffChars) {
      skippedFiles.push(f.filename);
    } else {
      includedDiffs.push(entry);
      totalChars += entry.length;
    }
  }

  let diffs = includedDiffs.join('\n\n');

  if (skippedFiles.length > 0) {
    diffs += `\n\n> **Note:** The following files were excluded because the diff exceeded the \`MAX_DIFF_CHARS\` limit:\n${skippedFiles.map(f => `> - ${f}`).join('\n')}`;
  }

  return diffs;
}

async function reviewWithMiniMax(apiKey, model, systemPrompt, diff) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please review this pull request:\n\n${diff}` },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('MiniMax API request timed out.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${error.slice(0, 200)}`);
  }

  const text = await response.text();
  if (text.length > MAX_RESPONSE_SIZE) {
    throw new Error('MiniMax API response exceeded size limit.');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('MiniMax API returned invalid JSON.');
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('MiniMax API returned an empty response.');
  }
  return content;
}

async function run() {
  const apiKey = core.getInput('MINIMAX_API_KEY', { required: true });
  core.setSecret(apiKey);
  const model = core.getInput('MINIMAX_MODEL');
  const systemPrompt = core.getInput('MINIMAX_SYSTEM_PROMPT');
  const reviewerName = core.getInput('MINIMAX_REVIEWER_NAME');
  const excludePatterns = core.getInput('EXCLUDE_PATTERNS')
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  const maxDiffChars = parseInt(core.getInput('MAX_DIFF_CHARS'), 10) || 0;
  const token = core.getInput('GITHUB_TOKEN');
  core.setSecret(token);

  const octokit = github.getOctokit(token);
  const { context } = github;

  if (context.eventName !== 'pull_request') {
    core.setFailed('This action only works on pull_request events.');
    return;
  }

  const { owner, repo } = context.repo;
  const pull_number = context.payload.pull_request.number;

  core.info(`Reviewing PR #${pull_number} with model ${model}...`);

  const files = await getChangedFiles(octokit, owner, repo, pull_number);
  const filteredFiles = filterFiles(files, excludePatterns);

  if (excludePatterns.length > 0) {
    const excluded = files.length - filteredFiles.length;
    if (excluded > 0) {
      core.info(`Excluded ${excluded} file(s) matching EXCLUDE_PATTERNS.`);
    }
  }

  if (!filteredFiles.some(f => f.patch)) {
    core.info('No diff found — skipping review.');
    return;
  }

  const diff = buildPrompt(filteredFiles, maxDiffChars);
  const review = await reviewWithMiniMax(apiKey, model, systemPrompt, diff);
  const body = `## ${reviewerName}\n\n${review}\n\n${COMMENT_MARKER}`;

  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: pull_number,
  });

  const existing = comments.find(c => c.body?.includes(COMMENT_MARKER));

  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body,
    });
  }

  core.info('Code review posted successfully.');
}

run().catch(err => core.setFailed(err.message));
