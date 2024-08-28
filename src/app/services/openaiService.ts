import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY? process.env.OPENAI_API_KEY : "",
});

const isValidationEnabled = process.env.IS_OPENAI_ENABLED === "true";

export const openaiService = {
  async aiAssistantForJob(data: { title: string; description: string }) {
    console.log("openaiService started");
    try {
      if (!isValidationEnabled) {
        return { status: "success" };
      }
      const message = `Job Title: ${data.title}\nJob Description: ${data.description}`;
      const response: any = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Given a job posting validate Title and Description that it is appropriate and doesn't have any offensive language. Return a json object with a status=success if it's okay or a status=invalid and a message that is a one sentence explanation of the issue found.",
          },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error: any) {
      console.log("openaiService error", error);
      return { status: "valid" };
    }
  },
};
