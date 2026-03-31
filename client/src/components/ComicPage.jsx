import { motion } from 'framer-motion';
import ComicPanel from './ComicPanel';
import './ComicPage.css';

const LAYOUTS = {
  'hero-top': {
    areas: `"a a" "b c" "d d"`,
    rows: '2.2fr 1.6fr 1.2fr',
  },
  'staggered': {
    areas: `"a b" "c b" "d d"`,
    rows: '1fr 1fr 1.4fr',
  },
  'bottom-focus': {
    areas: `"a a" "b c" "d d"`,
    rows: '1.2fr 1.4fr 2fr',
  },
};

const AREA_NAMES = ['a', 'b', 'c', 'd'];

const LAYOUTS_3 = {
  'hero-top': {
    areas: `"a a" "b c"`,
    rows: '2fr 1.5fr',
  },
  'staggered': {
    areas: `"a b" "c c"`,
    rows: '1.5fr 2fr',
  },
  'bottom-focus': {
    areas: `"a b" "c c"`,
    rows: '1.2fr 2fr',
  },
};

const LAYOUTS_2 = {
  'hero-top': { areas: `"a b"`, rows: '1fr' },
  'staggered': { areas: `"a" "b"`, rows: '1fr 1fr', cols: '1fr' },
  'bottom-focus': { areas: `"a b"`, rows: '1fr' },
};

function getLayout(layoutName, panelCount) {
  if (panelCount <= 2) return LAYOUTS_2[layoutName] || LAYOUTS_2['hero-top'];
  if (panelCount === 3) return LAYOUTS_3[layoutName] || LAYOUTS_3['hero-top'];
  return LAYOUTS[layoutName] || LAYOUTS['hero-top'];
}

function getPanelSize(layoutName, areaIndex, panelCount) {
  if (panelCount <= 2) return 'standard';

  const sizeMap = {
    'hero-top': ['hero', 'standard', 'standard', 'wide'],
    'staggered': ['standard', 'tall', 'standard', 'wide'],
    'bottom-focus': ['wide', 'standard', 'standard', 'hero'],
  };

  const sizes = sizeMap[layoutName] || sizeMap['hero-top'];
  return sizes[areaIndex] || 'standard';
}

export default function ComicPage({ page, pageIndex, totalPages }) {
  const panels = page.panels || [];
  const layoutName = page.layout || 'hero-top';
  const layout = getLayout(layoutName, panels.length);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className={`comic-page comic-page--${layoutName}`}
      style={{
        gridTemplateAreas: layout.areas,
        gridTemplateRows: layout.rows,
        gridTemplateColumns: layout.cols || '1fr 1fr',
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {panels.map((panel, i) => (
        <motion.div
          key={`${pageIndex}-${i}`}
          className="comic-page__cell"
          style={{ gridArea: AREA_NAMES[i] }}
          variants={panelVariants}
        >
          <ComicPanel
            panel={panel}
            size={getPanelSize(layoutName, i, panels.length)}
            index={pageIndex * 4 + i}
          />
        </motion.div>
      ))}

      <div className="comic-page__page-number">
        {String(pageIndex + 1).padStart(2, '0')}
      </div>
    </motion.div>
  );
}
