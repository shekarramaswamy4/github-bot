import { Probot } from "probot";
import fetch from "node-fetch";
import parse from "parse-diff";
import { summarizePython } from "./huggingface";

// @ts-ignore
export default (app: Probot, { getRouter }) => {
  app.on("pull_request.opened", async (context) => {
    const diffUrl = context.payload.pull_request.diff_url;
    let response = await fetch(diffUrl);
    let diffData = await response.text();

    // Construct per file summaries
    const fileDiff = parse(diffData);
    const summaries = [];
    for (const f of fileDiff) {
      let additions = "";
      for (const c of f.chunks) {
        for (const change of c.changes) {
          if (change.type === "add") {
            additions += change.content;
          }
        }
      }

      const summary = await summarizePython(additions);
      summaries.push({ filename: f.to, summary });
    }

    let prCommentText = `Thanks for opening pull request #${context.payload.number}, @${context.payload.pull_request.user.login}!\n\nHere's a per-file summary of what you did:\n`;
    for (const s of summaries) {
      prCommentText += `**${s.filename}**: ${s.summary}\n`;
    }

    const prComment = context.issue({
      body: prCommentText,
    });

    await context.octokit.issues.createComment(prComment);
  });

  app.on("issue_comment.created", async (context) => {
    const comment = context.payload.comment;
    // Easy way to check if comment is a pull request
    if (!comment.html_url.includes("pull")) {
      return;
    }

    if (!comment.body.includes("shekar-bot review")) {
      return;
    }

    // For now, just approve the PR with a comment
    const prCommentText = "This looks great!";
    const approval = context.issue({
      body: prCommentText,
      event: "APPROVE",
      pull_number: context.payload.issue.number,
    });
    // @ts-ignore
    await context.octokit.pulls.createReview(approval);
  });

  // Can tack on arbitrary endpoints here
  const router = getRouter("/my-example-app");
  // @ts-ignore
  router.get("/healthcheck", (_: any, res: any) => {
    res.send("healthy");
  });
};

/**
General plan:
1. Explicitly handle PR opens
2. Get the diff of the PR
3. Parse the diff for files that were changed - support python only
4. Use this https://huggingface.co/SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune for per file summaries
5. Post the summary as a comment on the PR
7. use shekar-bot on demand "review" instead of for every PR (probably just watching something) // how to @ mention bots in comments?

8. create demo / diagram for how this works
8. create plan for an enterprise deployment

outstanding questions
1. how does deployment work?
- https://probot.github.io/docs/deployment/

Known limiations
1. cant @ mention bots in comments
 */
