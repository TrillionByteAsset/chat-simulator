import React from 'react';
import './skins/default.css';

export default function ExampleTool({ manifest, themeName }: { manifest: any, themeName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 rounded-lg example-tool-container transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-4 example-tool-title">{manifest.name}</h1>
      <p className="example-tool-desc mb-6">{manifest.seo.description}</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="p-4 rounded border example-border text-center">
          <span className="font-semibold block mb-2">Render Mode</span>
          <code>{manifest.type}</code>
        </div>
        <div className="p-4 rounded border example-border text-center">
          <span className="font-semibold block mb-2">Active Theme</span>
          <code>{themeName || 'N/A'}</code>
        </div>
        <div className="p-4 rounded border example-border text-center col-span-2">
          <span className="font-semibold block mb-2">Active Skin Preset</span>
          <code>{manifest.config.skin_preset}</code>
        </div>
      </div>
    </div>
  );
}
