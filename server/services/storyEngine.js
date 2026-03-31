import { fetchTopicContent } from './wikipedia.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const NOIR_STYLE = 'noir comic, black and white ink art, high contrast, dramatic shadows, graphic novel';

function buildImageUrl(sceneDesc, seed = 42) {
  const prompt = `${NOIR_STYLE}, ${sceneDesc}`.substring(0, 250);
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&seed=${seed}&nologo=true`;
}

function buildSystemPrompt(mode, depth, wikiContent) {
  const depthGuide = {
    kid: 'Explain for a 10-year-old. Simple words, fun analogies.',
    normal: 'General audience. Clear and engaging.',
    expert: 'Expert-level depth with technical accuracy.',
    quick: 'Ultra-concise summary.',
  };

  const wikiSection = wikiContent?.content
    ? `\n\nREFERENCE MATERIAL (use this as your primary source of facts):\n---\n${wikiContent.content.substring(0, 2500)}\n---\n\nYou MUST base your comic panels on the facts from this reference material. Do NOT invent facts.`
    : '';

  const modeGuide = {
    education: `You are a noir-style visual storytelling engine that turns educational topics into compelling comic narratives. ${depthGuide[depth] || depthGuide.normal} Use dramatic noir narration while keeping all facts accurate.${wikiSection}`,
    news: `You are a noir-style news comic generator. Transform events into gripping noir comic panels. Present facts clearly with cinematic tension.${wikiSection}`,
    story: `You are a noir fiction generator. Create an immersive noir short story from the given premise. Use vivid imagery and dark, mysterious atmosphere. You may use creative license but ground the story in real concepts.${wikiSection}`,
  };

  return modeGuide[mode] || modeGuide.education;
}

function buildUserPrompt(prompt, mode, panelCount) {
  return `Create a noir comic about: "${prompt}"

You MUST respond with ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "title": "A dramatic noir-style title for the comic",
  "panels": [
    {
      "caption": "Noir narration (max 30 words, atmospheric and factual)",
      "dialogue": "Character speech or empty string (max 15 words)",
      "scene_desc": "Brief visual scene (max 15 words, for image generation)"
    }
  ]
}

STRICT RULES:
- Create EXACTLY ${panelCount} panels
- Base ALL facts on the reference material provided
- Each caption: noir narrator voice, factual content, under 30 words
- Each scene_desc: concrete visual scene description, under 15 words (e.g. "detective studying galaxy map under desk lamp")
- dialogue: use sparingly, only 3-4 panels should have dialogue
- Build narrative arc: setup → development → climax → resolution
- Tell the REAL story of "${prompt}", not a generic detective story`;
}

function distributeToPages(panels) {
  const pages = [];
  const layouts = ['hero-top', 'staggered', 'bottom-focus'];
  let idx = 0;

  while (idx < panels.length) {
    const remaining = panels.length - idx;
    const pageSize = remaining <= 4 ? remaining : Math.min(4, remaining);
    const pagePanels = panels.slice(idx, idx + pageSize);

    pages.push({
      layout: layouts[pages.length % layouts.length],
      panels: pagePanels,
    });

    idx += pageSize;
  }

  return pages;
}

function generateFallbackPanels(prompt, wikiContent, mode) {
  const content = wikiContent?.content || '';
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
  const targetCount = mode === 'news' ? 6 : 8;
  console.log(`Fallback: ${sentences.length} sentences from ${content.length} chars of wiki content`);

  const sceneHints = [
    `mysterious figure studying documents under desk lamp`,
    `dramatic cityscape at night with neon reflections`,
    `shadowy laboratory with scientific diagrams on wall`,
    `noir detective at desk with scattered newspaper clippings`,
    `dramatic cosmic scene with swirling nebula darkness`,
    `two silhouetted figures in heated discussion in smoke`,
    `explosive revelation moment with dramatic spotlight`,
    `lone figure walking into foggy dawn on empty street`,
    `close up of hands writing notes under dim lamp`,
    `rain soaked alleyway with single streetlight glow`,
  ];

  if (sentences.length >= 4) {
    const count = Math.min(targetCount, sentences.length);
    const chunk = Math.max(1, Math.floor(sentences.length / count));
    const panels = [];

    for (let i = 0; i < count; i++) {
      const start = i * chunk;
      const raw = sentences.slice(start, start + chunk).join('. ');
      const caption = raw.substring(0, 140) + (raw.length > 140 ? '...' : '.');
      const hasDialogue = i === 1 || i === 4;

      panels.push({
        caption,
        dialogue: hasDialogue ? `"${sentences[start]?.substring(0, 50)}..."` : '',
        scene_desc: sceneHints[i % sceneHints.length],
        image_url: buildImageUrl(sceneHints[i % sceneHints.length], i * 111 + 7),
      });
    }

    return panels;
  }

  const defaultScenes = [
    { caption: `It began, as these things do, in darkness. The story of ${prompt} — waiting to be told.`, scene: `dark cityscape silhouette figure looking at sky`, dialogue: '' },
    { caption: `The clues were scattered like broken glass. Each piece reflecting a different truth about ${prompt}.`, scene: `detective examining scattered papers under desk lamp`, dialogue: `"Where do we even begin?"` },
    { caption: `Deeper I went. The evidence painted a picture no one expected to see.`, scene: `wall covered with connected photographs and red string`, dialogue: '' },
    { caption: `Every expert had a theory. None of them agreed. But the facts didn't lie.`, scene: `two silhouettes arguing in smoky room`, dialogue: `"You can't ignore the evidence."` },
    { caption: `Then came the breakthrough — the single thread that tied everything together.`, scene: `dramatic close-up of hand holding key document dramatic light`, dialogue: '' },
    { caption: `The picture became clear. What seemed impossible was simply misunderstood.`, scene: `figure standing before massive revelation display wall`, dialogue: '' },
    { caption: `Word spread like wildfire. The world would never see ${prompt} the same way again.`, scene: `newspaper printing press running dramatic noir angle`, dialogue: `"Print it. All of it."` },
    { caption: `And so the story was written — not in ink, but in truth. Some mysteries only deepen with time.`, scene: `lone figure walking into foggy dawn on empty street`, dialogue: '' },
  ];

  return defaultScenes.slice(0, targetCount).map((s, i) => ({
    caption: s.caption,
    dialogue: s.dialogue,
    scene_desc: s.scene,
    image_url: buildImageUrl(s.scene, i * 111 + 7),
  }));
}

export async function generateComic(prompt, mode = 'education', depth = 'normal') {
  const wikiContent = await fetchTopicContent(prompt, mode);
  const panelCount = mode === 'news' ? 6 : 8;

  let panels;
  let title;

  if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Noir Comics Generator',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick:free',
          messages: [
            { role: 'system', content: buildSystemPrompt(mode, depth, wikiContent) },
            { role: 'user', content: buildUserPrompt(prompt, mode, panelCount) },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.panels?.length) throw new Error('No panels');

      title = parsed.title;
      panels = parsed.panels.map((p, i) => ({
        caption: p.caption || '',
        dialogue: p.dialogue || '',
        scene_desc: p.scene_desc || '',
        image_url: buildImageUrl(p.scene_desc || `noir scene panel ${i + 1}`, i * 111 + 7),
      }));
    } catch (err) {
      console.error('LLM failed, using fallback:', err.message);
      panels = null;
    }
  }

  if (!panels) {
    title = wikiContent.title
      ? `The ${wikiContent.title} Dossier`
      : `The ${prompt} Files`;
    panels = generateFallbackPanels(prompt, wikiContent, mode);
  }

  const pages = distributeToPages(panels);

  return {
    title,
    mode,
    source: wikiContent.source,
    sourceUrl: wikiContent.url || '',
    sourceTitle: wikiContent.title || prompt,
    totalPanels: panels.length,
    pages,
  };
}
