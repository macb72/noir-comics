import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import './ComicPanel.css';

export default function ComicPanel({ panel, size = 'standard', index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [panel.image_url]);

  const isLarge = size === 'hero' || size === 'wide';

  return (
    <div className={`cpanel cpanel--${size}`}>
      <div className="cpanel__image-wrap">
        {!imgLoaded && !imgError && (
          <div className="cpanel__loading">
            <div className="cpanel__loading-bars">
              <span /><span /><span />
            </div>
          </div>
        )}

        {imgError && (
          <div className="cpanel__fallback">
            <div className="cpanel__fallback-icon">&#9632;</div>
            <p className="cpanel__fallback-scene">{panel.scene_desc}</p>
          </div>
        )}

        <motion.img
          src={panel.image_url}
          alt={panel.scene_desc || 'Comic panel'}
          className={`cpanel__img ${imgLoaded ? 'cpanel__img--visible' : ''}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1.0 }}
          transition={{ duration: 12, ease: 'easeOut' }}
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
          <TypewriterText
            text={panel.caption}
            delay={200}
            speed={isLarge ? 20 : 18}
          />
        </div>
      </div>
    </div>
  );
}
