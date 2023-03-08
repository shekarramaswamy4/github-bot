import { Probot } from "probot";

// @ts-ignore
export default (app: Probot, { getRouter }) => {
  app.on("pull_request.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this pull request!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

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
7. use shekar-bot on demand instead of for every PR (probably just watching something)

outstanding questions
1. how does deployment work?
- https://probot.github.io/docs/deployment/
 */
