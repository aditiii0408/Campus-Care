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

    // Crisis detection
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
          severity: found.some(w =>
            ["suicide","suicidal","kill myself","end my life","want to die","hang myself","overdose"].includes(w)
          ) ? "critical" : "high",
        });
      }
    }

    // Build Gemini conversation
    const systemPrompt = `You are CareBot, a compassionate mental health support assistant for college students at Campus Care. 
Provide empathetic, supportive emotional guidance in 2-4 concise sentences.
You are NOT a therapist. Always suggest professional counselling for serious concerns. Never diagnose.
Focus on coping strategies, validation, and encouragement.
If a student expresses thoughts of suicide or self-harm, respond with deep empathy, remind them they are not alone, 
and STRONGLY encourage them to contact a counsellor or call iCall helpline at 9152987821.`;

    // Convert messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Add system prompt as first user message if not present
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'm CareBot, here to support students. How can I help?" }] },
      ...geminiMessages,
    ];

    const payload = JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const apiKey = process.env.GEMINI_API_KEY;
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = "";
      apiRes.on("data", chunk => data += chunk);
      apiRes.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.error("Gemini error:", parsed.error);
            return res.status(500).json({ error: "AI service error." });
          }
          const reply = parsed.candidates?.[0]?.content?.parts?.[0]?.text
            || "I'm here for you. Would you like to share more about how you're feeling?";
          res.json({ reply });
        } catch (e) {
          console.error("Parse error:", e.message);
          res.status(500).json({ error: "Failed to parse AI response." });
        }
      });
    });

    apiReq.on("error", (e) => {
      console.error("Gemini request error:", e.message);
      res.status(500).json({ error: "AI service unavailable." });
    });

    apiReq.write(payload);
    apiReq.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};