import React, { useEffect } from 'react';
// import SSEditor from '../../editor/index';

export default function DebugEditor(prpps) {
  useEffect(() => {
    // const editor = new SSEditor('editorcontainer');
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* <span
        style={{
          textAlign: 'center',
          display: 'inline-block',
          height: 35,
          lineHeight: '35px'
        }}
      >
        三维编排工具
      </span> */}
      <div id="editorcontainer" style={{ flex: 1 }} />
    </div>
  );
}
