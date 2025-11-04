'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence 
      mode="wait" // Počká, až stará stránka zmizí, než se objeví nová
    >
      <motion.div
        key={pathname} // Musí tu být, aby AnimatePresence věděl, že se stránka změnila
        
        // Animace pro novou stránku (přichází)
        initial={{ opacity: 0, y: 15 }} // Začne průhledná a 15px níže
        animate={{ opacity: 1, y: 0 }} // Stane se viditelnou na pozici 0
        
        // Animace pro starou stránku (odchází)
        exit={{ opacity: 0, y: -15 }} // Zmizí a posune se 15px nahoru
        
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}