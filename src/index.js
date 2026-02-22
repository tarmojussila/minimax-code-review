const core = require('@actions/core');
const github = require('@actions/github');

const MINIMAX_API_URL = 'https://api.minimaxi.chat/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert code reviewer. Review the following pull request diff and provide constructive feedback.
Focus on:
- Bugs and logical errors
- Security vulnerabilities
- Performance issues
- Code quality and readability
- Best practices

Be concise, specific, and actionable. Reference file names and line numbers where relevant.`;

async function getDiff(octokit, owner, repo, pull_number) {
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  return files
    .filter(f => f.patch)
    .map(f => `### ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');
}

async function reviewWithMiniMax(apiKey, model, diff) {
  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Please review this pull request:\n\n${diff}` },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function postReview(octokit, owner, repo, pull_number, review) {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body: `## AI Code Review (MiniMax)\n\n${review}`,
  });
}

async function run() {
  try {
    const apiKey = core.getInput('MINIMAX_API_KEY', { required: true });
    const model = core.getInput('MINIMAX_MODEL') || 'MiniMax-M2.5';
    const token = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN;

    const octokit = github.getOctokit(token);
    const context = github.context;

    if (context.eventName !== 'pull_request') {
      core.setFailed('This action only works on pull_request events.');
      return;
    }

    const { owner, repo } = context.repo;
    const pull_number = context.payload.pull_request.number;

    core.info(`Reviewing PR #${pull_number} with model ${model}...`);

    const diff = await getDiff(octokit, owner, repo, pull_number);

    if (!diff) {
      core.info('No diff found — skipping review.');
      return;
    }

    const review = await reviewWithMiniMax(apiKey, model, diff);
    await postReview(octokit, owner, repo, pull_number, review);

    core.info('Code review posted successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
