export const ART_STYLES = {
  'neo-noir': {
    label: 'Neo Noir',
    imagePrefix: 'neo noir style, dark moody atmosphere, neon glow accents, cyberpunk noir, high contrast shadows, cinematic',
    cssFilter: 'contrast(1.2) brightness(0.88) saturate(0.35)',
    narrationTone: 'hardboiled noir detective narration, gritty urban atmosphere',
  },
  'bw-silhouette': {
    label: 'B&W Silhouette',
    imagePrefix: 'black and white silhouette art, ink wash painting, extreme high contrast, minimal detail, dramatic shadow play, graphic novel',
    cssFilter: 'grayscale(100%) contrast(1.4) brightness(0.8)',
    narrationTone: 'stark minimalist narration, poetic and sparse',
  },
  'colorful': {
    label: 'Colorful Comic',
    imagePrefix: 'vibrant comic book art, bold saturated colors, dynamic composition, pop art style, retro comic illustration',
    cssFilter: 'contrast(1.1) saturate(1.25) brightness(0.98)',
    narrationTone: 'energetic comic book narration, vivid and punchy',
  },
};

export function getStyle(styleId) {
  return ART_STYLES[styleId] || ART_STYLES['neo-noir'];
}

export function getStyleIds() {
  return Object.keys(ART_STYLES);
}
