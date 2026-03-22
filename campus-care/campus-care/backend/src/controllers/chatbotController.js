const https = require("https");
const Alert = require("../models/Alert");

const TRIGGER_WORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "don't want to live", "dont want to live", "no reason to live",
  "better off dead", "end it all", "hurt myself", "self harm", "selfharm",
  "cut myself", "overdose", "jump off", "hang myself", "ending my life",
  "take my life", "worthless", "can't go on", "cant go on", "give up on life",
  "life is not worth", "nobody cares if i die", "disappear forever",
];

const detectTriggers = (message) => {
  const lower = message.toLowerCase();
  return TRIGGER_WORDS.filter(word => lower.includes(word));
};

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required." });
    }

    // Check latest user message for trigger words
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      const found = detectTriggers(lastUserMsg.content);
      if (found.length > 0) {
        await Alert.create({
          student: req.user._id,
          studentName: req.user.name,
          studentEmail: req.user.email,
          rollNumber: req.user.rollNumber || "",
          triggerMessage: lastUserMsg.content,
          triggerWords: found,
          severity: found.some(w => ["suicide", "suicidal", "kill myself", "end my life", "want to die", "hang myself", "overdose"].includes(w)) ? "critical" : "high",
        });
        console.log(`CRISIS ALERT — Student: ${req.user.name} (${req.user.email})`);
      }
    }

    const payload = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are CareBot, a compassionate mental health support assistant for college students at Campus Care.
Provide empathetic, supportive first-aid emotional guidance in 2-4 concise sentences.
You are NOT a therapist. Always suggest professional counselling for serious concerns. Never diagnose.
Focus on coping strategies, validation, and encouragement.
IMPORTANT: If a student expresses thoughts of suicide, self-harm, or ending their life, respond with deep empathy,
take it seriously, remind them they are not alone, and STRONGLY encourage them to immediately contact a counsellor
or call iCall helpline at 9152987821. Always provide this number for crisis situations.`,
      messages,
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => (data += chunk));
      apiRes.on("end", () => {
  try {
    const parsed = JSON.parse(data);
    console.log("Anthropic response:", JSON.stringify(parsed).slice(0, 300));
    if (parsed.error) {
      console.error("Anthropic API error:", parsed.error);
      return res.status(500).json({ error: parsed.error.message || "AI error." });
    }
    const reply = parsed.content?.[0]?.text || "I'm here for you. Could you share more?";
    res.json({ reply });
  } catch (e) {
    console.error("Parse error:", e.message, "Raw:", data.slice(0, 200));
    res.status(500).json({ error: "Failed to parse AI response." });
  }
});
    });

    apiReq.on("error", () => res.status(500).json({ error: "AI service unavailable." }));
    apiReq.write(payload);
    apiReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};