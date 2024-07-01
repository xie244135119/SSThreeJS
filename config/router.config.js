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
  // {
  //   name: '场景编排',
  //   path: '/editor',
  //   component: './pages/editor'
  // },
  {
    component: './pages/404'
  }
];
