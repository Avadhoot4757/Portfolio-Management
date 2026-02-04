import React from "react";
import AnimatedCard from "./AnimatedCard";

const SummaryCards = ({ cards }) => {
  return (
    <div className="summary-grid">
      {cards.map((card, index) => (
        <AnimatedCard key={card.label} className="summary-card" delay={0.2 + index * 0.05}>
          <div className="kpi-row">
            <div className="kpi-icon" aria-hidden="true">
              ◈
            </div>
            <div>
              <div className="summary-label">{card.label}</div>
              <div className="summary-value">{card.value}</div>
            </div>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
};

export default SummaryCards;
