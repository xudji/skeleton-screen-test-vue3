<template>
  <div class="home container">


    <el-card shadow="hover">
      <div class="page-header">
        <el-avatar :size="60" :src="userInfo?.avatar" />
        <div class="page-header-tip">
          <p class="page-header-tip-title">
            {{ timeFix() }}{{ userInfo?.name }}，{{ welcome() }}
          </p>
          <p class="page-header-tip-desc">后台管理系统</p>
        </div>
      </div>
    </el-card>


    <div v-if="loadingIndex">
      <ProTable :loadingIndex="loadingIndex" @change="handleValueChanged" ref="proTable" :dataCallback="dataCallback"
        :columns="columns" :requestApi="getSkuList">

        <template #operation="scope">
          <el-button type="primary" link icon="View" v-auth="['btn.User.update']" @click="openDrawer('编辑', scope.row)">
            查看
          </el-button>
        </template>
      </ProTable>
    </div>
    <div v-else>
      <el-skeleton animated />
      <br />
      <el-skeleton style="--el-skeleton-circle-size: 100px" animated>
        <template #template>
          <el-skeleton-item variant="circle" animated />
        </template>
      </el-skeleton>
    </div>


  </div>
</template>

<script setup lang="tsx">

import { useUserStore } from '@/store/modules/user'
import { timeFix, welcome } from '@/utils/index'
import SvgIcon from '@/components/SvgIcon/src/SvgIcon.vue'
import { useTableStore } from '@/store/modules/table'
import { getSkuList } from '@/api'
import { ref } from 'vue'
import { ColumnProps } from '@/components/ProTable/src/types'
import { Order } from '@/api/order/types'
const useTable = useTableStore()
const userStore = useUserStore()
const userInfo = userStore.userInfo
let loadingIndex = ref(false)
// *表格配置项
const columns: ColumnProps[] = [
  { type: 'index', label: '#', width: 50 },
  { prop: 'id', label: 'id', width: 50 },
  { prop: 'skuName', label: '商品名称' },
  { prop: 'skuDesc', label: '商品描述' },
  {
    prop: 'skuDefaultImg',
    label: '商品图片',
    render: ({ row }) => {
      return (
        <>
          <el-image
            src={row.skuDefaultImg}
            style="height: 100px; width: 100px;"
            fit="cover"
          />
        </>
      )
    },
  },
  { prop: 'price', label: '商品价格（¥）', width: 120 },
  { prop: 'createTime', label: '创建时间', sortable: true, width: 110 },
  { prop: 'operation', label: '操作', fixed: 'right', width: 100 },
]
// *获取 ProTable 元素，调用其获取刷新数据方法
const proTable = ref()

// 处理返回的数据格式
const dataCallback = (data: any) => {
  console.log(data)
  if (data) {
    loadingIndex.value = true
  }
  console.log(loadingIndex.value)
  return {
    list: data?.records,
    total: data?.total,
  }

}
function handleValueChanged(newValue: any) {
  loadingIndex.value = newValue;
}
// *新增、编辑
const drawerRef = ref()
const openDrawer = async (
  title: string,
  rowData: Partial<Order.ResOrderList> = {},
) => {
  let params = {
    title,
    rowData: { ...rowData },
    api: '',
    getTableList: proTable.value.getTableList,
  }
  drawerRef.value.acceptParams(params)
}
</script>

<style scoped lang="scss">
.home {
  height: 100%;

  .page-header {
    display: flex;
    align-items: center;

    .page-header-tip {
      flex: 1;
      margin-left: 20px;
    }

    .page-header-tip-title {
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: 700;
      color: #3c4a54;
    }

    .page-header-tip-desc {
      min-height: 20px;
      font-size: 14px;
      color: #808695;
    }
  }

  .welcome {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>
