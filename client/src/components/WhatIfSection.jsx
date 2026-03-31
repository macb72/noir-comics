import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import './WhatIfSection.css';

export default function WhatIfSection({ scenarios, onSelect }) {
  if (!scenarios?.length) return null;

  return (
    <motion.section
      className="whatif"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
    >
      <div className="whatif__inner">
        <div className="whatif__header">
          <GitBranch size={20} className="whatif__icon" />
          <h2 className="whatif__title">Explore What Could Have Happened</h2>
          <p className="whatif__subtitle">
            Choose an alternate scenario to generate a new comic
          </p>
        </div>

        <div className="whatif__cards">
          {scenarios.map((scenario, i) => (
            <motion.button
              key={scenario.id}
              className="whatif__card"
              onClick={() => onSelect(scenario)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="whatif__card-number">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="whatif__card-title">{scenario.title}</h3>
              <p className="whatif__card-desc">{scenario.description}</p>
              <span className="whatif__card-cta">Generate this timeline &rarr;</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
