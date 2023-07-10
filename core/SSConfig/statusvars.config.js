/*
 * Author  Murphy.xie
 * Date  2023-06-14 14:17:34
 * LastEditors  Murphy.xie
 * LastEditTime  2023-06-15 14:10:20
 * Description key配置
 */
import * as THREE from 'three';

/**
 * 转化数组
 * @param {Array} list
 * @returns Array
 */
// const convertList = (list) =>
//   list.map((e) => ({
//     label: e,
//     value: THREE[e]
//   }));
const convertList = (list) => list;

/**
 *
 */
const NormalMapTypes = convertList(['TangentSpaceNormalMap', 'ObjectSpaceNormalMap']);
/**
 * blendDst
 */
const BlendingDstFactor = convertList([
  'ZeroFactor',
  'OneFactor',
  'SrcColorFactor',
  'OneMinusSrcColorFactor',
  'SrcAlphaFactor',
  'OneMinusSrcColorFactor',
  'OneMinusSrcAlphaFactor',
  'DstAlphaFactor',
  'OneMinusDstAlphaFactor',
  'DstColorFactor',
  'OneMinusDstColorFactor'
]);
const BlendingEquation = convertList([
  'AddEquation',
  'SubtractEquation',
  'ReverseSubtractEquation',
  'MinEquation',
  'MaxEquation'
]);

const Blending = convertList([
  'NoBlending',
  'NormalBlending',
  'AdditiveBlending',
  'SubtractiveBlending',
  'MultiplyBlending',
  'CustomBlending'
]);
const BlendingSrcFactor = convertList(['SrcAlphaSaturateFactor']);

const DepthModes = convertList([
  'NeverDepth',
  'AlwaysDepth',
  'LessDepth',
  'LessEqualDepth',
  'EqualDepth',
  'GreaterEqualDepth',
  'GreaterDepth',
  'NotEqualDepth'
]);

const StencilFunc = convertList([
  'NeverStencilFunc',
  'LessStencilFunc',
  'EqualStencilFunc',
  'LessEqualStencilFunc',
  'GreaterStencilFunc',
  'NotEqualStencilFunc',
  'GreaterEqualStencilFunc',
  'AlwaysStencilFunc'
]);

const StencilOp = convertList([
  'ZeroStencilOp',
  'KeepStencilOp',
  'ReplaceStencilOp',
  'IncrementStencilOp',
  'DecrementStencilOp',
  'IncrementWrapStencilOp',
  'DecrementWrapStencilOp',
  'InvertStencilOp'
]);

const Side = convertList([
  'FrontSide',
  'BackSide',
  'DoubleSide'
  // "TwoPassDoubleSide",
]);

const WebGL2PixelFormat = convertList([
  'AlphaFormat',
  'RGBAFormat',
  'LuminanceFormat',
  'LuminanceAlphaFormat',
  'DepthFormat',
  'DepthStencilFormat',
  'RedFormat',
  'RedIntegerFormat',
  'RGFormat',
  'RGIntegerFormat',
  'RGBAIntegerFormat'
  // "_SRGBAFormat
]);

const ColorSpace = ['', 'srgb', 'srgb-linear', 'display-p3'];

// 基础实例配置
export const LIGHT_TYPE = [
  'SpotLight',
  'PointLight',
  'DirectionalLight',
  'AmbientLight',
  'HemisphereLight',
  'RectAreaLight'
];

// key值处理
export const normalMapType = NormalMapTypes;
export const blendDst = BlendingDstFactor;
export const blendEquation = BlendingEquation;
export const blending = Blending;
export const blendSrc = [...BlendingSrcFactor, ...BlendingDstFactor];

export const depthFunc = DepthModes;
export const precision = convertList(['highp', 'mediump', 'lowp']);
export const side = Side;
export const shadowSide = Side;
export const format = WebGL2PixelFormat;
export const stencilFunc = StencilFunc;
export const stencilFail = StencilOp;
export const stencilZFail = StencilOp;
export const stencilZPass = StencilOp;
export const wireframeLinejoin = convertList(['round', 'bevel', 'miter']);
export const wireframeLinecap = convertList(['butt', 'round', 'square']);
export const outputColorSpace = convertList(ColorSpace);
