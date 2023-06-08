/*
 * Author  xie244135119
 * Date  2023-04-11 18:00:50
 * LastEditors  xie244135119
 * LastEditTime  2023-06-08 15:56:16
 * Description
 */
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function ParentIndex() {
  useEffect(() => {}, []);

  return (
    <div>
      <span>父类页面</span>
      <Outlet />
    </div>
  );
}
