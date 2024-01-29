import type { App, Component } from 'vue'

import { SvgIcon } from './SvgIcon'
import { SearchForm } from './SearchForm'
import { ProTable } from './ProTable'
import { Auth } from './Auth'
import { SwitchDark } from './SwitchDark'
import { IconifyIcon } from './IconifyIcon'
import { CategorySelector } from './CategorySelector'
import XtxSkeleton from '@/components/skeletion/index.vue'
const Components: {
  [propName: string]: Component
} = {
  SvgIcon,
  SearchForm,
  ProTable,
  Auth,
  SwitchDark,
  IconifyIcon,
  CategorySelector,
  XtxSkeleton
}

export default {
  install: (app: App) => {
    Object.keys(Components).forEach((key) => {
      app.component(key, Components[key])
    })
  },
}
