import React from 'react';
import { WindowProcess } from '../../store/useWindowStore';
import { getApp } from '../../registry/appRegistry';

interface AppRegistryProps {
  window: WindowProcess;
}

export const AppRegistry: React.FC<AppRegistryProps> = ({ window: win }) => {
  const { appId, initialData, id: windowId } = win;

  // Normalize aliases
  const normalizedAppId =
    appId === 'notepad' ? 'notes' :
    appId === 'imageview' ? 'gallery' :
    appId === 'musicplayer' ? 'music' : appId;

  const appManifest = getApp(normalizedAppId);

  if (appManifest) {
    const Component = appManifest.component;
    return <Component initialData={initialData} windowId={windowId} />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-slate-400 font-sans">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-500 font-mono text-lg font-bold">
        ?
      </div>
      <p className="text-sm font-semibold text-slate-200">App "{appId}" not found in registry</p>
      <p className="text-xs text-slate-500 mt-1">Please register this module in appRegistry.ts</p>
    </div>
  );
};
