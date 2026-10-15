import React from 'react';
import { useOSStore } from '../../store/useOSStore';

export const BrightnessFilter: React.FC = () => {
  const brightness = useOSStore((state) => state.brightness);

  // Calculate overlay opacity based on brightness (10% to 100%)
  // Lower brightness = higher dark overlay opacity
  const dimOpacity = Math.max(0, (100 - brightness) / 100) * 0.85;

  if (dimOpacity <= 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] bg-black transition-opacity duration-200"
      style={{ opacity: dimOpacity }}
    />
  );
};
