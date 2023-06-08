/*
 * Author  Murphy.xie
 * Date  2023-04-11 18:00:50
 * LastEditors  Murphy.xie
 * LastEditTime  2023-06-08 17:42:51
 * Description
 */
import React, { useEffect } from 'react';
import SSThreejs from 'ss-threejs';

export default function ParentIndex(props) {
  // eslint-disable-next-line react/prop-types
  const { children } = props;

  useEffect(() => {
    // const js = new SSThreejs();
  }, []);

  return (
    <div>
      <span>三级页面</span>
      {children}
    </div>
  );
}
