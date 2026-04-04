<template>
  <div class="retro-box">
    <div class="retro-box-title">{{ title }}</div>
    <div class="retro-box-content">
      <slot /> </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.retro-box {
  border: 4px solid #444;
  background: #2c3e50;
  margin-bottom: 20px;
  position: relative;
}
.retro-box-title {
  background: #444;
  color: #f24;
  padding: 2px 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: bold;
}
.retro-box-content {
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>