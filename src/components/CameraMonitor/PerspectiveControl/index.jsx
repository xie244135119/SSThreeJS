/*
 * Author  hailie.pan
 * Date  2023-08-12 11:15:17
 * LastEditors  Murphy.xie
 * LastEditTime  2023-08-25 10:58:48
 * Description  视角控制组件——圆盘
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import shijiaoPng from '../assets/shijiao.png';

const borderColor = 'rgb(88, 176, 227)';

const direction = [
  { id: 'top', command: { tilt: 1 } },
  { id: 'left', command: { pan: 1 } },
  { id: 'right', command: { pan: 2 } },
  { id: 'bottom', command: { tilt: 2 } }
];

export default function PerspectiveControl({ className, style, onSelect, onDeselect }) {
  // svg
  const svgRef = useRef();

  useEffect(() => {
    direction.forEach((e) => {
      const element = svgRef.current.getElementById(e.id);
      element.addEventListener('mouseover', () => {
        element.setAttribute('stroke', borderColor);
        element.setAttribute('strokeWidth', 2);
        element.setAttribute('scale', 1.5);
        element.setAttribute('cursor', 'pointer');
      });
      element.addEventListener('mouseout', () => {
        element.setAttribute('stroke', 'rgba(0,0,0,0)');
        element.setAttribute('scale', 1);
        element.setAttribute('strokeWidth', 0);
      });
      element.addEventListener('pointerdown', () => {
        // console.log(' this ', onSelect);
        onSelect?.(e.id);
      });
      element.addEventListener('pointerup', () => {
        onDeselect?.(e.id);
      });
    });
  }, []);

  return (
    <div className={className} style={style}>
      <svg ref={svgRef}>
        <image xlinkHref={shijiaoPng} />
        <g id="top" transform="translate(-610,-300)">
          <path
            cursor="pointer"
            fill="rgba(0,0,0,0)"
            d="M633.4,312.3c0,0,36.7-26.9,74.5,0.9l-22.8,24.2c0,0-14.6-8.9-27.1,0L633.4,312.3z"
          />
        </g>
        <g id="bottom" transform="translate(-610,-300)">
          <path
            cursor="pointer"
            fill="rgba(0,0,0,0)"
            d="M661.2,386.4c0,0,10.3,4.3,18.7,0l24.4,24.2c0,0-28.3,25.5-67.2,0L661.2,386.4z"
          />
        </g>
        <g id="left" transform="translate(-610,-300)">
          <path
            cursor="pointer"
            fill="rgba(0,0,0,0)"
            d="M620.4,326.6c0,0-26,39.7,2.7,71.8l24.2-23.9c0,0-6.8-11.2-1.6-23L620.4,326.6z"
          />
        </g>
        <g id="right" transform="translate(-610,-300)">
          <path
            cursor="pointer"
            fill="rgba(0,0,0,0)"
            d="M696.3,350.8l24.4-24.2c0,0,27.3,37.6-2.3,71.8l-23.9-23.7C694.5,374.7,700.7,366.5,696.3,350.8z"
          />
        </g>
        <g id="center" transform="translate(-610,-300)">
          <polygon
            cursor="pointer"
            fill="rgba(0,0,0,0)"
            points="670.7,343.7 654.6,361 670.7,377.2 687.7,361 	"
          />
        </g>
      </svg>
    </div>
  );
}

PerspectiveControl.propTypes = {
  /**
   * 样式
   */
  className: PropTypes.string,
  /**
   * 样式
   */
  style: PropTypes.object,
  /**
   * 选中
   */
  onSelect: PropTypes.func,
  /**
   * 取消选中
   */
  onDeselect: PropTypes.func
};
