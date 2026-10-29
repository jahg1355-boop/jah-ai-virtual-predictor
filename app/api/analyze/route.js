
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image.arrayBuffer !== "function") {
      return Response.json(
        { error: "Please upload a screenshot." },
        { status: 400 }
      );
    }

    if (!image.type?.startsWith("image/") || image.size > 8 * 1024 * 1024) {
      return Response.json(
        { error: "Upload an image smaller than 8 MB." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const imageData = bytes.toString("base64");

    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [{
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Analyze this SportyBet virtual football screenshot. Extract only visible team names, score, match time and odds. Mark unreadable details as unclear. Then give cautious possible outcome analysis based only on visible information. Do not claim random virtual results can be reliably predicted, and do not invent statistics or certainty. Clearly separate extracted facts from speculation."
              },
              {
                type: "input_image",
                image_url: `data:${image.type};base64,${imageData}`
              }
            ]
          }]
        })
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return Response.json(
        { error: data.error?.message || "AI analysis failed." },
        { status: 502 }
      );
    }

    const analysis = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return Response.json({ analysis });
  } catch {
    return Response.json(
      { error: "Unable to analyze this image. Please try again." },
      { status: 500 }
    );
  }
}
