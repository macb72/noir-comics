import { fetchTopicContent } from './wikipedia.js';
import { callLLM, isLLMAvailable } from './llm.js';
import { getStyle } from './styles.js';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function buildImageUrls(sceneDesc, styleId, seed = 42) {
  const style = getStyle(styleId);
  const prompt = `${style.imagePrefix}, ${sceneDesc}`.substring(0, 240);
  const encoded = encodeURIComponent(prompt);
  const hash = simpleHash(sceneDesc + seed);

  return {
    primary: `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&seed=${seed}&nologo=true`,
    fallback: `https://picsum.photos/seed/${hash}/768/512${styleId === 'bw-silhouette' ? '?grayscale' : ''}`,
  };
}

function buildSystemPrompt(mode, depth, wikiContent, styleId) {
  const style = getStyle(styleId);
  const depthGuide = {
    kid: 'Explain for a 10-year-old. Simple words, fun analogies.',
    normal: 'General audience. Clear and engaging.',
    expert: 'Expert-level depth with technical accuracy.',
    quick: 'Ultra-concise summary.',
  };

  const wikiBlock = wikiContent?.content
    ? `\n\nREFERENCE MATERIAL (base ALL facts on this):\n---\n${wikiContent.content.substring(0, 2500)}\n---`
    : '';

  return `You are a visual storytelling engine. Create comic panels with ${style.narrationTone}. ${depthGuide[depth] || depthGuide.normal} Base all facts on the reference material provided. Do NOT invent facts for educational/news content.${wikiBlock}`;
}

function buildUserPrompt(prompt, mode, panelCount, styleId) {
  return `Create a comic about: "${prompt}"

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "title": "Dramatic engaging title",
  "panels": [
    {
      "caption": "Narration text (max 30 words, atmospheric and factual)",
      "dialogue": "Character speech or empty string (max 15 words)",
      "scene_desc": "Visual scene for image generation (max 15 words)"
    }
  ],
  "what_if_scenarios": [
    {
      "id": "1",
      "title": "Short what-if title (max 8 words)",
      "description": "One sentence describing this alternate scenario",
      "change_point": "What key event/decision changes"
    }
  ]
}

RULES:
- EXACTLY ${panelCount} panels
- EXACTLY 3 what_if_scenarios
- Each caption: vivid narration, factual, under 30 words
- Each scene_desc: concrete visual (e.g. "scientist gazing at star chart under dim light") max 15 words
- Dialogue: use on only 2-3 panels for impact
- What-if scenarios: realistic alternatives based on key decision points in the story
- Build narrative arc: setup → development → climax → resolution
- Tell the REAL story of "${prompt}"`;
}

function distributeToPages(panels) {
  const pages = [];
  const layouts = ['hero-top', 'staggered', 'bottom-focus'];
  let idx = 0;

  while (idx < panels.length) {
    const remaining = panels.length - idx;
    const pageSize = remaining <= 4 ? remaining : Math.min(4, remaining);
    pages.push({
      layout: layouts[pages.length % layouts.length],
      panels: panels.slice(idx, idx + pageSize),
    });
    idx += pageSize;
  }
  return pages;
}

const NOIR_TEMPLATES = [
  (fact) => `It started in the shadows — ${fact}`,
  (fact) => `The deeper you look, the clearer it gets. ${fact}`,
  (fact) => `Nobody saw it coming. ${fact}`,
  (fact) => `The evidence doesn't lie. ${fact}`,
  (fact) => `Here's where it gets interesting. ${fact}`,
  (fact) => `They tried to keep it quiet, but — ${fact}`,
  (fact) => `The turning point hit like a freight train. ${fact}`,
  (fact) => `And when the dust settled — ${fact}`,
  (fact) => `The truth was hiding in plain sight. ${fact}`,
  (fact) => `This changed everything. ${fact}`,
];

const SCENE_HINTS = [
  'mysterious figure studying documents under desk lamp',
  'dramatic cityscape at night with neon reflections in rain',
  'shadowy laboratory with scientific diagrams on wall',
  'intense figure at desk with scattered newspaper clippings',
  'dramatic cosmic scene with swirling nebula and stars',
  'two silhouetted figures in heated discussion in smoke-filled room',
  'explosive revelation moment with dramatic spotlight beam',
  'lone figure walking into foggy dawn on empty street',
  'close-up of hands writing notes under flickering lamp',
  'rain-soaked alleyway with single streetlight casting long shadows',
  'figure standing before massive wall of connected evidence',
  'crowded newsroom with urgent activity and harsh lighting',
];

function generateFallbackWhatIfs(prompt, wikiTitle) {
  const topic = wikiTitle || prompt;
  return [
    {
      id: '1',
      title: `What if ${topic} never happened?`,
      description: `Explore an alternate timeline where the key events of ${topic} were prevented entirely.`,
      change_point: 'The triggering event is removed',
    },
    {
      id: '2',
      title: `What if the outcome was reversed?`,
      description: `Imagine the opposite result — every major consequence of ${topic} flipped on its head.`,
      change_point: 'The final outcome changes dramatically',
    },
    {
      id: '3',
      title: `What if it happened 50 years later?`,
      description: `${topic} occurs in a completely different era with modern technology and politics.`,
      change_point: 'The time period shifts dramatically',
    },
  ];
}

function buildFallbackPanels(prompt, wikiContent, mode, styleId) {
  const content = wikiContent?.content || '';
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
  const targetCount = mode === 'news' ? 6 : 8;

  if (sentences.length >= 4) {
    const count = Math.min(targetCount, sentences.length);
    const chunk = Math.max(1, Math.floor(sentences.length / count));
    const panels = [];

    for (let i = 0; i < count; i++) {
      const start = i * chunk;
      const raw = sentences.slice(start, start + chunk).join('. ');
      const fact = raw.substring(0, 120) + (raw.length > 120 ? '...' : '.');
      const template = NOIR_TEMPLATES[i % NOIR_TEMPLATES.length];
      const caption = template(fact).substring(0, 160);
      const hasDialogue = i === 1 || i === 4;

      const urls = buildImageUrls(SCENE_HINTS[i % SCENE_HINTS.length], styleId, i * 111 + 7);
      panels.push({
        caption,
        dialogue: hasDialogue ? `"${sentences[start]?.substring(0, 45)}..."` : '',
        scene_desc: SCENE_HINTS[i % SCENE_HINTS.length],
        image_url: urls.primary,
        fallback_url: urls.fallback,
      });
    }
    return panels;
  }

  const genericScenes = [
    { tpl: 0, scene: 0, dlg: '' },
    { tpl: 1, scene: 1, dlg: `"Where do we even begin with ${prompt}?"` },
    { tpl: 2, scene: 2, dlg: '' },
    { tpl: 3, scene: 3, dlg: `"You can't ignore this."` },
    { tpl: 4, scene: 4, dlg: '' },
    { tpl: 5, scene: 5, dlg: '' },
    { tpl: 6, scene: 6, dlg: `"Print everything."` },
    { tpl: 7, scene: 7, dlg: '' },
  ];

  return genericScenes.slice(0, targetCount).map((s, i) => {
    const caption = NOIR_TEMPLATES[s.tpl](`The story of ${prompt} was about to unfold.`);
    const urls = buildImageUrls(SCENE_HINTS[s.scene], styleId, i * 111 + 7);
    return {
      caption,
      dialogue: s.dlg,
      scene_desc: SCENE_HINTS[s.scene],
      image_url: urls.primary,
      fallback_url: urls.fallback,
    };
  });
}

export async function generateComic(prompt, mode = 'education', depth = 'normal', styleId = 'neo-noir') {
  const wikiContent = await fetchTopicContent(prompt, mode);
  const panelCount = mode === 'news' ? 6 : 8;
  const style = getStyle(styleId);

  let panels = null;
  let title = null;
  let whatIfs = null;

  if (isLLMAvailable()) {
    try {
      const content = await callLLM([
        { role: 'system', content: buildSystemPrompt(mode, depth, wikiContent, styleId) },
        { role: 'user', content: buildUserPrompt(prompt, mode, panelCount, styleId) },
      ], { temperature: 0.7, maxTokens: 3000 });

      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.panels?.length) {
            title = parsed.title;
            panels = parsed.panels.map((p, i) => {
              const urls = buildImageUrls(p.scene_desc || SCENE_HINTS[i % SCENE_HINTS.length], styleId, i * 111 + 7);
              return {
                caption: p.caption || '',
                dialogue: p.dialogue || '',
                scene_desc: p.scene_desc || '',
                image_url: urls.primary,
                fallback_url: urls.fallback,
              };
            });
            if (parsed.what_if_scenarios?.length === 3) {
              whatIfs = parsed.what_if_scenarios;
            }
          }
        }
      }
    } catch (err) {
      console.error('LLM generation failed:', err.message);
    }
  }

  if (!panels) {
    title = wikiContent.title ? `The ${wikiContent.title} Dossier` : `The ${prompt} Files`;
    panels = buildFallbackPanels(prompt, wikiContent, mode, styleId);
  }

  if (!whatIfs) {
    whatIfs = generateFallbackWhatIfs(prompt, wikiContent.title);
  }

  return {
    title,
    mode,
    styleId,
    cssFilter: style.cssFilter,
    source: wikiContent.source,
    sourceUrl: wikiContent.url || '',
    sourceTitle: wikiContent.title || prompt,
    totalPanels: panels.length,
    pages: distributeToPages(panels),
    what_if_scenarios: whatIfs,
  };
}

export async function generateWhatIfComic(originalPrompt, scenario, mode, styleId = 'neo-noir') {
  const wikiContent = await fetchTopicContent(originalPrompt, mode);
  const style = getStyle(styleId);

  let panels = null;
  let title = null;

  if (isLLMAvailable()) {
    try {
      const systemPrompt = `You are a visual storytelling engine creating an ALTERNATE HISTORY comic with ${style.narrationTone}.

ORIGINAL TOPIC: "${originalPrompt}"
WHAT-IF SCENARIO: "${scenario.title}" — ${scenario.description}
CHANGE POINT: ${scenario.change_point}

${wikiContent?.content ? `REFERENCE MATERIAL:\n---\n${wikiContent.content.substring(0, 1500)}\n---` : ''}

Create a comic that explores what would happen if this alternate scenario played out. Keep it grounded and logical.`;

      const content = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an alternate history comic for: "${scenario.title}"

Respond with ONLY valid JSON:
{
  "title": "Dramatic alternate title",
  "panels": [
    { "caption": "Narration (max 30 words)", "dialogue": "Speech or empty", "scene_desc": "Visual scene (max 15 words)" }
  ]
}

Create EXACTLY 6 panels. Show how history diverges from the change point.` },
      ]);

      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.panels?.length) {
            title = parsed.title;
            panels = parsed.panels.map((p, i) => {
              const urls = buildImageUrls(p.scene_desc || SCENE_HINTS[i % SCENE_HINTS.length], styleId, i * 200 + 13);
              return { caption: p.caption || '', dialogue: p.dialogue || '', scene_desc: p.scene_desc || '', image_url: urls.primary, fallback_url: urls.fallback };
            });
          }
        }
      }
    } catch (err) {
      console.error('What-if LLM failed:', err.message);
    }
  }

  if (!panels) {
    title = `Alternate: ${scenario.title}`;
    const altNarration = [
      `In this timeline, everything changed. ${scenario.description}`,
      `The moment of divergence — ${scenario.change_point}. Nothing would be the same.`,
      `Without the original outcome, new forces took shape. The world adjusted, but not easily.`,
      `Consequences rippled outward. Some predicted this, but most were caught off guard.`,
      `The alternate path revealed truths the original timeline had buried deep.`,
      `And so a different story was written. Whether better or worse — that's for you to decide.`,
    ];

    panels = altNarration.map((caption, i) => {
      const urls = buildImageUrls(SCENE_HINTS[(i + 3) % SCENE_HINTS.length], styleId, i * 200 + 13);
      return {
        caption,
        dialogue: i === 1 ? `"Everything we knew... was wrong."` : '',
        scene_desc: SCENE_HINTS[(i + 3) % SCENE_HINTS.length],
        image_url: urls.primary,
        fallback_url: urls.fallback,
      };
    });
  }

  return {
    title,
    mode,
    styleId,
    cssFilter: style.cssFilter,
    source: wikiContent.source,
    sourceUrl: wikiContent.url || '',
    sourceTitle: wikiContent.title || originalPrompt,
    totalPanels: panels.length,
    pages: distributeToPages(panels),
    what_if_scenarios: [],
    isAlternate: true,
    originalScenario: scenario,
  };
}
