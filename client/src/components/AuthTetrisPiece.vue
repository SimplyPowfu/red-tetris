<script setup lang="ts">
import { computed } from 'vue'
import { Tetriminos, BlockColor } from '@red/shared/types/PieceType'

const props = defineProps<{
  type: string
  row: number
  col: number
  rotate: number
}>()

const shape = computed(() => Tetriminos[props.type as keyof typeof Tetriminos])
const CELL_SIZE = 20

const dynamicStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${shape.value[0]!.length}, ${CELL_SIZE}px)`,
  top: `${props.row * CELL_SIZE}px`,
  left: `${props.col * CELL_SIZE}px`,
  width: `${shape.value[0]!.length * CELL_SIZE}px`,
  height: `${shape.value.length * CELL_SIZE}px`,
  transform: `rotate(${props.rotate}deg)`,
  position: 'absolute' as const
}))
</script>

<template>
  <div :style="dynamicStyle" class="moving-piece">
    <div 
      v-for="(cell, i) in shape.flat()" 
      :key="i" 
      class="piece-block"
      :style="{ backgroundColor: cell ? BlockColor[cell as keyof typeof BlockColor] : 'transparent' }"
      :data-filled="!!cell"
    />
  </div>
</template>

<style scoped>
.moving-piece {
  display: grid;
  position: absolute;
  transform-origin: center center;
}

.piece-block {
  width: 20px;
  height: 20px;
  box-sizing: border-box;
}

/* Applica bordi e ombre al blocco solo se contiene colore (data-filled="true") */
.piece-block[data-filled="true"] {
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.5);
}
</style>