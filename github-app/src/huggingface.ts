import fetch from "node-fetch";

export async function summarizePython(diff: string) {
  const model =
    "SEBIS/code_trans_t5_large_source_code_summarization_python_multitask_finetune";
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const data = {
    inputs: diff,
    options: { wait_for_model: true },
  };

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
    method: "POST",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // Sometimes huggingface is a little finicky
  try {
    return result[0].summary_text;
  } catch (e) {
    console.log(result);
    console.error(e);
    return "No summary generated";
  }
}
