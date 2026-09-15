<!--
  [公共组件] components/KpiCard.vue —— 首页数据总览 / 运营看板
  说明：KPI 指标卡片，数值使用 GSAP 滚动计数动画，支持环比趋势标识
-->
<template>
  <div class="kpi-card gg-card">
    <!-- 指标名称 -->
    <div class="kpi-label">{{ label }}</div>
    <!-- 数值 + 单位（GSAP 数字滚动） -->
    <div class="kpi-value">
      <span class="kpi-num">{{ displayValue }}</span>
      <span class="kpi-unit">{{ unit }}</span>
    </div>
    <!-- 环比备注 -->
    <div class="kpi-remark" :class="remarkClass">
      <component :is="trendIcon" v-if="trend !== 0" />
      <span>{{ remark }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/* [模块] 组件状态与 GSAP 数字滚动 */
import { computed, ref, toRefs, watch } from 'vue'
import gsap from 'gsap'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  label: string
  value: number
  unit: string
  remark: string
  trend: number // 1 上升 / 0 持平 / -1 下降
}>()

const { value } = toRefs(props)

/* 数字滚动：从当前值过渡到目标值 */
const displayValue = ref(0)
watch(
  value,
  (target) => {
    const proxy = { num: Number(displayValue.value) || 0 }
    gsap.to(proxy, {
      num: target,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        displayValue.value = Number(proxy.num.toFixed(target % 1 ? 1 : 0))
      }
    })
  },
  { immediate: true }
)

/* 趋势图标与颜色 */
const trendIcon = computed(() =>
  props.trend > 0 ? ArrowUpOutlined : props.trend < 0 ? ArrowDownOutlined : MinusOutlined
)
const remarkClass = computed(() => ({
  'is-up': props.trend > 0,
  'is-down': props.trend < 0,
  'is-flat': props.trend === 0
}))
</script>

<style lang="scss" scoped>
/* KPI 卡片：撑满列高等高对齐 + 悬浮上浮效果 */
.kpi-card {
  height: 100%;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  cursor: default;

  &:hover {
    -webkit-transform: translateY(-2px);
    transform: translateY(-2px);
    -webkit-box-shadow: $shadow-card-hover;
    box-shadow: $shadow-card-hover;
  }
}

.kpi-label {
  font-size: 13px;
  color: $color-text-secondary;
}

.kpi-value {
  margin: 8px 0 6px;
  @include flex-between;
  -webkit-box-pack: start;
  -webkit-justify-content: flex-start;
  justify-content: flex-start;

  .kpi-num {
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .kpi-unit {
    margin-left: 6px;
    font-size: 13px;
    color: $color-text-secondary;
  }
}

/* 环比备注：贴底对齐，保证多卡片水平一致 */
.kpi-remark {
  margin-top: auto;
  padding-top: 4px;
  font-size: 12px;

  &.is-up {
    color: $color-primary;
  }

  &.is-down {
    color: $color-danger;
  }

  &.is-flat {
    color: $color-text-weak;
  }
}
</style>
