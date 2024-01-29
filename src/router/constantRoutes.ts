/*
 * @Author: 
 * @Date: 2023-02-25 09:19:28
 * @LastEditors: 1547702880@@qq.com
 * @LastEditTime: 2023-03-17 16:17:16
 * @Description: 静态路由
 */

import { RouteRecordRaw } from 'vue-router'
import { HOME_URL, LOGIN_URL } from '@/config/config'
import Layout from '@/layouts/index.vue' // 直接导入Layout组件
import Login from '@/views/login/index.vue' // 直接导入Login组件
import Error404 from '@/views/error/error-404.vue' // 直接导入404错误页组件
import Home from '@/views/home/index.vue' // 直接导入首页组件
import DataScreen from '@/views/data-screen/index.vue' // 直接导入数据大屏组件

/**
 * @description 静态路由
 */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: LOGIN_URL,
    name: 'login',
    meta: {
      isHide: true,
    },
    component: Login,
  },
  {
    path: '/404',
    name: '404',
    meta: {
      isHide: true,
    },
    component: Error404,
  },
  {
    path: '/',
    name: 'LAYOUT',
    component: Layout,
    redirect: HOME_URL,
    meta: {
      title: '首页',
      icon: 'HomeFilled',
    },
    children: [
      {
        path: '/index',
        name: 'Index',
        component: Home,
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          affix: true,
        },
      },
    ],
  },
  {
    path: '/data-screen',
    name: 'DataScreen',
    component: DataScreen,
    meta: {
      icon: 'DataLine',
      title: '数据大屏',
    },
  },
  // 此路由防止控制台出现No match found for location with path的警告
  {
    path: '/:catchAll(.*)',
    meta: {
      isHide: true,
    },
    component: Error404,
  },
]

/**
 * @description 路由未找到
 */
export const notFoundRouter = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  redirect: '/404',
}