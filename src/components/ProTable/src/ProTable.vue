<template>
  <SearchForm v-show="isShowSearch" :columns="searchColumns" :searchParam="searchParam" :searchCol="searchCol"
    :search="search" :reset="reset" />
  <div class="card table" ref="tableCard">
    <!-- 表格头部 操作按钮 -->
    <div class="table-header">
      <div class="header-left">
        <slot name="tableHeader" :selectedListIds="selectedListIds" :selectedList="selectedList" :isSelected="isSelected">
        </slot>
      </div>
      <div class="header-right" v-if="toolButton">
        <el-tooltip content="刷新表格">
          <el-icon size="18" @click="getTableList">
            <Refresh />
          </el-icon>
        </el-tooltip>
        <el-tooltip v-if="false" effect="dark" :content="!isFullscreen ? '全屏' : '收起'" placement="bottom">
          <SvgIcon size="18" name="full-screen" v-if="!isFullscreen" @click="toggle" />
          <SvgIcon size="18" name="exit-full" v-else @click="toggle" />
        </el-tooltip>
        <el-tooltip content="列设置">
          <el-icon size="18" v-if="columns.length" @click="openColSetting">
            <Setting />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <!-- 表格主体 -->
    <el-table ref="tableRef" v-bind="$attrs" v-loading="loading" :data="tableData" :row-key="getRowKeys" :border="border"
      @selection-change="selectionChange">
      <!-- default slot -->
      <slot></slot>
      <!-- render columns -->
      <template v-for="item in tableColumns" :key="item">
        <!-- selection || index -->
        <el-table-column v-bind="item" :align="item.align ?? 'center'" :reserve-selection="item.type == 'selection'"
          v-if="item.type == 'selection' || item.type == 'index'"></el-table-column>
        <!-- expend -->
        <el-table-column v-bind="item" :align="item.align ?? 'center'" v-if="item.type == 'expand'" v-slot="scope">
          <component :is="item.render" :row="scope.row" v-if="item.render"></component>
          <slot :name="item.type" :row="scope.row" v-else></slot>
        </el-table-column>
        <!-- other columns -->
        <TableColumn :column="item" v-if="!item.type && item.prop">
          <template v-for="slot in Object.keys($slots)" :key="slot" #[slot]="scope">
            <slot :name="slot" :row="scope.row"></slot>
          </template>
        </TableColumn>
      </template>
      <!-- 插入表格最后一行之后的插槽 -->
      <template #append>
        <slot name="append"></slot>
      </template>
      <!-- noData -->
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <img src="./assets/images/notData.png" alt="noData" />
            <div>暂无数据</div>
          </slot>
        </div>
      </template>
    </el-table>
    <!-- 分页组件 -->
    <slot name="pagination">
      <Pagination v-if="pagination" :pageable="pageable" :handleSizeChange="handleSizeChange"
        :handleCurrentChange="handleCurrentChange" />
    </slot>
  </div>
  <ColSetting v-if="toolButton" ref="colRef" v-model:colSetting="colSetting" />
</template>

<script lang="ts" setup name="ProTable">
import { ref, provide, watch,onMounted } from 'vue'
import { useFullscreen } from '@vueuse/core'

import { useTable } from './hooks/useTable'
import { useSelection } from './hooks/useSelection'
import { ElTable, TableProps } from 'element-plus'
import type { ColumnProps, BreakPoint } from './types'
import SearchForm from '@/components/SearchForm'
import TableColumn from './components/TableColumn.vue'
import Pagination from './components/Pagination.vue'
import ColSetting from './components/ColSetting.vue'
/**
 * @description: props类型定义
 * @param columns       - 列配置项
 * @param requestApi    - 请求表格数据的api ==> 必传
 * @param dataCallback  - 返回数据的回调函数，可以对数据进行处理 ==> 非必传
 * @param title         - 表格标题，目前只在打印的时候用到 ==> 非必传
 * @param pagination    - 是否需要分页组件 ==> 非必传（默认为true）
 * @param initParam     - 初始化请求参数 ==> 非必传（默认为{}）
 * @param border        - 是否带有纵向边框 ==> 非必传（默认为true）
 * @param toolButton    - 是否显示表格功能按钮 ==> 非必传（默认为true）
 * @param selectId      - 当表格数据多选时，所指定的字段名 ==> 非必传（默认为 id）
 * @param searchCol     - 表格搜索项 每列占比配置 ==> 非必传 { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
 */


interface ProTableProps extends Partial<Omit<TableProps<any>, 'data'>> {
  columns: ColumnProps[]
  requestApi: (params: any) => Promise<any>
  dataCallback?: (data: any) => any
  title?: string
  pagination?: boolean
  initParam?: any
  border?: boolean
  toolButton?: boolean
  selectId?: string
  searchCol?: number | Record<BreakPoint, number>
}


const emit = defineEmits(['change']);
function handleChange() {
  // 修改父组件传入的值
  const newValue = '新的值'; // 这里根据实际情况计算新值
  emit('change', newValue);
}
// 🌟组件props的ts定义必须在组件中声明
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  pagination: true,
  initParam: {},
  border: true,
  toolButton: true,
  selectId: 'id',
  loadingIndex: false,
  searchCol: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
})

// --------------------表格-----------------------
const tableCard = ref()

// 表格 DOM 元素
const tableRef = ref<InstanceType<typeof ElTable>>()

// 表格全屏
const { isFullscreen, toggle } = useFullscreen(tableCard)

// 接收 columns 并设置为响应式
const tableColumns = ref<ColumnProps[]>(props.columns)


// 表格操作 Hooks
const {
  tableData,
  pageable,
  searchParam,
  loading,
  search,
  reset,
  getTableList,
  handleSizeChange,
  handleCurrentChange,
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
)

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true })

//* --------------------表格多选-----------------------

// 表格多选 Hooks
const {
  selectionChange,
  getRowKeys,
  selectedList,
  selectedListIds,
  isSelected,
} = useSelection(props.selectId)

// 清空选中数据列表
const clearSelection = () => tableRef.value!.clearSelection()

// --------------------搜索-----------------------
// 是否显示搜索模块
const isShowSearch = ref(true)

// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map<string, { [key: string]: any }[]>())
provide('enumMap', enumMap)

const setEnumMap = async (col: ColumnProps) => {
  if (!col.enum) return
  if (typeof col.enum !== 'function')
    return enumMap.value.set(col.prop!, col.enum!)
  const { data } = await col.enum()
  enumMap.value.set(col.prop!, data)
}

// 扁平化 columns
const flatColumnsFunc = (
  columns: ColumnProps[],
  flatArr: ColumnProps[] = [],
) => {
  columns.forEach(async (col) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children))
    flatArr.push(col)

    // 给每一项 column 添加 isShow && isFilterEnum 默认属性
    col.isShow = col.isShow ?? true
    col.isFilterEnum = col.isFilterEnum ?? true

    setEnumMap(col)
  })
  return flatArr.filter((item) => !item._children?.length)
}
const flatColumns = ref<ColumnProps[]>()
flatColumns.value = flatColumnsFunc(tableColumns.value)

// 过滤需要搜索的配置项
const searchColumns = flatColumns.value.filter((item) => item.search?.el)

// 列设置 ==> 过滤掉不需要设置显隐的列
const colRef = ref()
const colSetting = tableColumns.value!.filter((item) => {
  return (
    item.type !== 'selection' &&
    item.type !== 'index' &&
    item.type !== 'expand' &&
    item.prop !== 'operation'
  )
})
const openColSetting = () => colRef.value.openColSetting()

defineExpose({
  element: tableRef,
  tableData,
  searchParam,
  pageable,
  enumMap,
  isSelected,
  selectedList,
  selectedListIds,
  reset,
  getTableList,
  clearSelection,
})
</script>

<style lang="scss" scoped>
@import './style/index';
</style>
