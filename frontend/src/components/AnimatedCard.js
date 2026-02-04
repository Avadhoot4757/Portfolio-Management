import React from "react";
import { motion } from "framer-motion";

const AnimatedCard = ({ children, className, delay = 0 }) => {
  const classes = className ? `card ${className}` : "card";

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
