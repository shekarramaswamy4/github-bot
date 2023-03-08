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
