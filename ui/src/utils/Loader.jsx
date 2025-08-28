import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="">
      <div className="relative w-8 h-8">
        <motion.div
          className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default Loader;
