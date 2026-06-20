# Commit Command

Create a commit message and commit flow from staged changes only.
When this command is invoked from the prompt, follow the workflow below end-to-end until the commit is created and, if approved, pushed.

---

# Commit Generation Instructions

Always generate commit messages in english using conventional commits based only on staged changes.

## Rules

- Use only staged changes as source of truth.
- Ignore all unstaged changes.
- Keep all text in lowercase.
- Convert component names from pascalcase/camelcase to kebab-case.
- Keep the title objective and concise.
- Write a maximum of 3 concrete change bullets.
- Use this structure:

```text
prefix(scope): message
- first concrete change.
- second concrete change.
- third concrete change.
```

## Prefixes

- feat: new feature.
- fix: bug fix.
- refactor: code change with no feature or bug fix.
- chore: maintenance and tooling.
- docs: documentation only.
- test: tests only.
- style: formatting or non-functional styling adjustments.
- perf: performance improvements.
- build: build system or dependency changes.
- ci: ci/cd pipeline changes.
- revert: revert previous commit.
- hotfix: critical production fix.
- deps: dependency updates.
- security: security-related changes.
- config: configuration changes.
- release: versioning and release changes.
- init: initial project setup.
- merge: branch merge commits.
- wip: work in progress changes.
- ux: user experience improvements.
- ui: interface-related changes.
- api: api contract or integration changes.
- db: database schema or migration changes.
- infra: infrastructure-related updates.
- types: type definitions or typing improvements.
- i18n: internationalization and localization changes.
- logs: logging and observability updates.

## Output Quality

- Keep the title objective and concise.
- Write 2 to 4 bullet points when describing the changes, but never exceed 3 concrete change bullets in the final message.
- Each bullet must describe one concrete change from staged files.
- Do not mention files that are not staged.
- Do not use emojis.

## Step 1: Check Git Status

1. Run `git status --porcelain` to check for any changes in the working directory.
2. Run `git diff --cached --name-only` to list staged files.
3. If the output of `git diff --cached --name-only` is empty, inform the user: "No staged changes to commit" and exit.
4. If unstaged changes exist, ignore them completely for commit generation.

## Step 2: Generate Commit Message

1. Get the diff of staged changes: `git diff --cached`.
2. Analyze only the staged changes.
3. Generate a commit message in english following conventional commits and the rules above.
4. Prefer the most specific prefix and an optional scope derived from the staged files.
5. Convert any component or package names to kebab-case when used in the scope.

### Commit Message Example

```text
feat(commands): add prompt-driven branch and pull request flows
- add branch command instructions for issue-based branch naming.
- add pull request command guidance for release-targeted reviews.
- add prompt-triggered workflow notes to command files.
```

## Step 3: Human-in-the-Loop Approval

1. Display the generated commit message to the user in a clear format:
   ```text
   Proposed commit message:
   [commit message here]
   ```
2. Ask for confirmation: "Is this commit message OK? (yes/no/edit)"
3. Handle user response:
   - If user says "yes" or "y": proceed to Step 4.
   - If user says "no" or "n": exit without committing and inform: "Commit cancelled".
   - If user says "edit" or "e": ask "What would you like to change?" and regenerate the message based on feedback, then return to Step 3.
   - If user provides specific edits: apply the edits and return to Step 3 for approval.

## Step 4: Create Commit

1. After user approval, execute: `git commit -m "<approved_message>"`
2. If the commit succeeds, display: "Commit created successfully: [commit hash]"
3. Get the commit hash using: `git rev-parse HEAD`
4. If the commit fails, display the error message and exit.

## Step 5: Push Changes

1. After a successful commit, ask the user: "Would you like to push the changes to remote? (yes/no)"
2. Handle user response:
   - If user says "yes" or "y": execute `git push origin HEAD` and display the result.
   - If user says "no" or "n": inform the user: "Changes committed locally but not pushed".
3. If push fails, display the error message and suggest possible solutions, such as pulling first or force pushing if appropriate.
4. When pushing via terminal, use `required_permissions: ["all"]` to avoid ssl certificate verification errors in sandboxed environments.

## Important Notes

- Never commit without explicit user approval.
- Never push without explicit user approval.
- Always check for staged changes first.
- Follow conventional commits strictly.
- Handle edge cases gracefully, including no staged changes, user rejection, and push failures.
