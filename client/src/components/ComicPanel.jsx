import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import './ComicPanel.css';

const FALLBACK_TIMEOUT_MS = 10000;

export default function ComicPanel({ panel, size = 'standard', index, cssFilter }) {
  const [imgState, setImgState] = useState('loading');
  const [activeSrc, setActiveSrc] = useState(panel.image_url);
  const fallbackTimer = useRef(null);
  const attempts = useRef(0);

  useEffect(() => {
    setImgState('loading');
    setActiveSrc(panel.image_url);
    attempts.current = 0;

    fallbackTimer.current = setTimeout(() => {
      if (attempts.current === 0 && panel.fallback_url) {
        setActiveSrc(panel.fallback_url);
        attempts.current = 1;
      }
    }, FALLBACK_TIMEOUT_MS);

    return () => clearTimeout(fallbackTimer.current);
  }, [panel.image_url, panel.fallback_url]);

  const handleLoad = () => { clearTimeout(fallbackTimer.current); setImgState('loaded'); };
  const handleError = () => {
    if (attempts.current === 0 && panel.fallback_url) {
      attempts.current = 1;
      setActiveSrc(panel.fallback_url);
    } else {
      setImgState('error');
    }
  };

  const isLarge = size === 'hero' || size === 'wide';
  const imgFilter = cssFilter || 'grayscale(100%) contrast(1.3) brightness(0.85)';

  return (
    <div className={`cpanel cpanel--${size}`}>
      <div className="cpanel__image-wrap">
        {imgState === 'loading' && (
          <div className="cpanel__loading">
            <div className="cpanel__loading-bars"><span /><span /><span /></div>
          </div>
        )}

        {imgState === 'error' && (
          <div className="cpanel__fallback">
            <div className="cpanel__fallback-art">
              <div className="cpanel__fallback-circle" />
              <div className="cpanel__fallback-lines"><span /><span /><span /></div>
            </div>
            <p className="cpanel__fallback-scene">{panel.scene_desc}</p>
          </div>
        )}

        <motion.img
          src={activeSrc}
          alt={panel.scene_desc || 'Comic panel'}
          className={`cpanel__img ${imgState === 'loaded' ? 'cpanel__img--visible' : ''}`}
          style={{ filter: imgFilter }}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          draggable={false}
        />

        <div className="cpanel__img-overlay" />
        <div className="cpanel__panel-num">{String(index + 1).padStart(2, '0')}</div>

        {panel.dialogue && (
          <div className="cpanel__speech-bubble">
            <div className="cpanel__speech-tail" />
            <TypewriterText text={panel.dialogue} delay={400} speed={25} />
          </div>
        )}
      </div>

      <div className="cpanel__caption-bar">
        <div className="cpanel__caption-inner">
          <TypewriterText text={panel.caption} delay={200} speed={isLarge ? 18 : 15} />
        </div>
      </div>
    </div>
  );
}
