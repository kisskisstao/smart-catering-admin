<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-title">菜品管理</div>
        <div class="page-desc">维护菜品基础信息、上下架状态和不同规格价格。</div>
      </div>
      <el-button type="primary" @click="openCreate">新增菜品</el-button>
    </div>

    <div class="panel">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="搜索菜品名称" clearable style="width: 240px" @keyup.enter="loadDishes" />
        <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" @change="loadDishes">
          <el-option label="上架" value="ON" />
          <el-option label="下架" value="OFF" />
        </el-select>
        <el-button @click="loadDishes">查询</el-button>
      </div>

      <el-table :data="dishes" v-loading="loading" row-key="id">
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image class="dish-image" :src="row.imageUrl" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜名" min-width="140" />
        <el-table-column label="基础价" width="110">
          <template #default="{ row }">{{ money(row.price) }}</template>
        </el-table-column>
        <el-table-column label="规格价格" min-width="220">
          <template #default="{ row }">
            <div v-if="row.specs?.length" class="spec-tags">
              <el-tag v-for="spec in row.specs" :key="`${row.id}-${spec.name}`" size="small" :type="spec.status === 'ON' ? 'success' : 'info'">
                {{ spec.name }} {{ money(spec.price) }}
              </el-tag>
            </div>
            <span v-else class="muted">未设置</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesCount" label="销量" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ON' ? 'success' : 'info'">{{ row.status === 'ON' ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeDish(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑菜品' : '新增菜品'" width="820px">
      <el-form :model="form" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="菜名">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基础价">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分类 ID">
              <el-input-number v-model="form.categoryId" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="上架" value="ON" />
                <el-option label="下架" value="OFF" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="图片">
          <el-upload :auto-upload="false" :show-file-list="false" :on-change="handleImageChange">
            <el-button>选择图片</el-button>
          </el-upload>
          <el-input v-model="form.imageUrl" placeholder="图片 URL 或上传后的地址" style="margin-top: 10px" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="口味">
              <el-input v-model="form.spicyOptions" placeholder="不辣,微辣,中辣" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标签">
              <el-input v-model="form.tasteTags" placeholder="招牌,下饭" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="推荐">
              <el-switch v-model="form.recommended" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="规格价格">
          <div class="spec-editor">
            <div v-for="(spec, index) in form.specs" :key="index" class="spec-row">
              <el-input v-model="spec.name" placeholder="规格，如小份" />
              <el-input-number v-model="spec.price" :min="0" :precision="2" placeholder="价格" />
              <el-input-number v-model="spec.sort" :min="0" placeholder="排序" />
              <el-select v-model="spec.status" placeholder="状态">
                <el-option label="启用" value="ON" />
                <el-option label="停用" value="OFF" />
              </el-select>
              <el-button type="danger" plain @click="removeSpec(index)">删除</el-button>
            </div>
            <el-button type="primary" plain @click="addSpec">新增规格</el-button>
            <div class="spec-hint">未设置规格时，小程序按基础价显示和计价；设置后按用户选择的规格价格计价。</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDish">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createDish, deleteDish, fetchDishes, updateDish, uploadDishImage } from '@/api/dishes'
import { money, normalizeList } from '@/utils/format'

const storeId = 1
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dishes = ref([])
const query = reactive({
  keyword: '',
  status: ''
})
const form = reactive(defaultForm())

function defaultForm() {
  return {
    id: null,
    storeId,
    categoryId: 1,
    name: '',
    imageUrl: '',
    price: 0,
    description: '',
    stock: 100,
    status: 'ON',
    tasteTags: '',
    spicyOptions: '',
    sizeOptions: '',
    recommended: false,
    recommendWeight: 0,
    specs: []
  }
}

function normalizeSpecs(specs = []) {
  return specs.map((item, index) => ({
    id: item.id || null,
    name: item.name || '',
    price: Number(item.price || 0),
    sort: Number(item.sort ?? index),
    status: item.status || 'ON'
  }))
}

function resetForm(data = {}) {
  Object.assign(form, defaultForm(), data, {
    price: Number(data.price || 0),
    specs: normalizeSpecs(data.specs)
  })
}

async function loadDishes() {
  loading.value = true
  try {
    const data = await fetchDishes({
      storeId,
      pageNo: 1,
      pageSize: 100,
      keyword: query.keyword,
      status: query.status || undefined
    })
    dishes.value = normalizeList(data)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  resetForm(row)
  dialogVisible.value = true
}

function addSpec() {
  form.specs.push({
    name: '',
    price: Number(form.price || 0),
    sort: form.specs.length,
    status: 'ON'
  })
}

function removeSpec(index) {
  form.specs.splice(index, 1)
}

async function handleImageChange(uploadFile) {
  try {
    const data = await uploadDishImage(uploadFile.raw)
    form.imageUrl = data.url || data
    ElMessage.success('上传成功')
  } catch {
    form.imageUrl = URL.createObjectURL(uploadFile.raw)
  }
}

function buildPayload() {
  const specs = form.specs
    .filter(item => item.name && item.price !== null && item.price !== undefined)
    .map((item, index) => ({
      name: item.name.trim(),
      price: Number(item.price || 0),
      sort: Number(item.sort ?? index),
      status: item.status || 'ON'
    }))

  return {
    ...form,
    price: Number(form.price || 0),
    sizeOptions: specs.length ? specs.map(item => item.name).join(',') : form.sizeOptions,
    specs
  }
}

async function saveDish() {
  if (!form.name) {
    ElMessage.warning('请填写菜名')
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    if (form.id) {
      await updateDish(form.id, payload)
    } else {
      await createDish(payload)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await loadDishes()
  } finally {
    saving.value = false
  }
}

async function removeDish(row) {
  await ElMessageBox.confirm(`确定删除菜品“${row.name}”吗？`, '删除确认', { type: 'warning' })
  await deleteDish(row.id, { storeId })
  ElMessage.success('删除成功')
  loadDishes()
}

onMounted(loadDishes)
</script>

<style scoped>
.page-desc {
  margin-top: 6px;
  color: #8b98a5;
  font-size: 13px;
}

.dish-image {
  width: 54px;
  height: 54px;
  border-radius: 6px;
  background: #eef2f7;
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.muted,
.spec-hint {
  color: #8b98a5;
  font-size: 13px;
}

.spec-editor {
  width: 100%;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr 150px 110px 110px 72px;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.spec-hint {
  margin-top: 8px;
}
</style>
