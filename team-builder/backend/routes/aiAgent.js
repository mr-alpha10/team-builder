const router = require('express').Router();
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

// ── AI Provider ──
async function callAI(prompt) {
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'gemini') {
    const model = 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });
    const data = await res.json();
    if (data.error) {
      console.error('Gemini error:', data.error.message);
      return `AI Error: ${data.error.message}`;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI unavailable';
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 2048 })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'AI unavailable';
  }

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CLAUDE_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'AI unavailable';
  }

  return 'No AI provider configured';
}

// ── AI Chat ──
router.post('/chat', auth, async (req, res) => {
  try {
    console.log('AI chat hit:', req.body.message);
    const { message, context } = req.body;
    const currentUser = await User.findById(req.userId).select('-password');
    const availableUsers = await User.find({ _id: { $ne: req.userId }, availability: 'available' })
      .select('name skills college year bio').limit(30);
    const openProjects = await Project.find({ status: 'open' })
      .populate('creator', 'name').select('title description skillsNeeded domain teamSize').limit(20);

    const prompt = `You are an AI Team Building Concierge for a hackathon platform.

CURRENT USER:
- Name: ${currentUser.name}
- Skills: ${currentUser.skills.join(', ') || 'Not specified'}
- College: ${currentUser.college || 'Not specified'}

AVAILABLE PEOPLE:
${availableUsers.map((u, i) => `${i + 1}. ${u.name} | Skills: ${u.skills.join(', ')} | College: ${u.college} | Year: ${u.year} | Bio: ${u.bio || 'N/A'}`).join('\n')}

OPEN PROJECTS:
${openProjects.map((p, i) => `${i + 1}. "${p.title}" by ${p.creator?.name} | Needs: ${p.skillsNeeded.join(', ')} | Domain: ${p.domain}`).join('\n')}

USER'S REQUEST: ${message}
${context ? `CONTEXT: ${context}` : ''}

RULES:
- Recommend REAL people from the list by name with clear reasons.
- Always explain WHY each person fits.
- Never take action without asking user to approve first.
- Keep responses concise with clear formatting.
- If asked to draft a message, write a short friendly intro.`;

    console.log('Calling AI with provider:', process.env.AI_PROVIDER);
    console.log('API key exists:', !!process.env.GEMINI_API_KEY);
    const aiResponse = await callAI(prompt);
    console.log('AI response:', aiResponse.substring(0, 100));
    const mentionedUsers = availableUsers.filter(u => aiResponse.toLowerCase().includes(u.name.toLowerCase()));

    res.json({
      response: aiResponse,
      mentionedUsers: mentionedUsers.map(u => ({ id: u._id, name: u.name, skills: u.skills }))
    });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// ── AI Draft Message ──
router.post('/draft', auth, async (req, res) => {
  try {
    const { receiverId, projectContext } = req.body;
    const sender = await User.findById(req.userId);
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'User not found' });

    const prompt = `Draft a short friendly hackathon team invite from ${sender.name} (skills: ${sender.skills.join(', ')}) to ${receiver.name} (skills: ${receiver.skills.join(', ')}).
${projectContext ? `Project: ${projectContext}` : ''}
Keep it under 3 sentences. Mention why their skills match. Return ONLY the message text.`;

    const draft = await callAI(prompt);
    res.json({ draft, receiverName: receiver.name });
  } catch (err) {
    res.status(500).json({ error: 'Draft failed' });
  }
});

module.exports = router;
