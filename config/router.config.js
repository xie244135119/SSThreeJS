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
    name: '一级主页',
    path: '/test',
    component: './pages/demo/test'
  },
  {
    component: './pages/404'
  }
];
