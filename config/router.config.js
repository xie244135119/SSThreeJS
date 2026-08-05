export default [
  {
    path: '/directory',
    component: './pages/directory/index'
  },
  {
    path: '/',
    redirect: '/directory'
  },
  {
    name: '场景调试',
    path: '/scene',
    component: './pages/scene'
  },
  {
    name: 'PLY 查看器',
    path: '/plyloader',
    component: './pages/plyloader'
  },
  {
    name: '热力图测试',
    path: '/heatmap',
    component: './pages/heatmap'
  },
  {
    component: './pages/404'
  }
];
