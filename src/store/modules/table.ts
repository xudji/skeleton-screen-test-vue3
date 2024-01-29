/*
 * @Author: 
 * @Date: 2023-02-24 11:28:38
 * @LastEditors: 1547702880@@qq.com
 * @LastEditTime: 2023-03-15 09:43:13
 * @Description: 系统设置
 */

import { defineStore } from 'pinia'
export const useTableStore = defineStore({
  id: 'app-table',
  state: () => ({
    loadingIndexs: false,
  }),

  actions: {
    changeLoading() {
      this.loadingIndexs = !this.loadingIndexs
    },

  },

})
