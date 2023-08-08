import React, { useEffect } from 'react';
import SSEditor from '../../editor/index';

export default function DebugEditor(prpps) {
  useEffect(() => {
    const editor = new SSEditor('editorcontainer');
  });

  return (
    <div style={{ height: '100vh' }}>
      <span style={{ textAlign: 'center', height: 50 }}>编排场景调试</span>
      <div id="editorcontainer" style={{ height: 'calc(100% - 50px)', border: '1px solid blue' }} />
    </div>
  );
}
