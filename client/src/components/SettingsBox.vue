<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings' // Assume you have/will create this

const settingsStore = useSettingsStore()
const isOpen = ref(false)

const toggleModal = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="settings-container">
    <button class="gear-btn" @click="toggleModal" title="Settings">
      ⚙️
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="toggleModal">
        <div class="retro-box settings-modal">
          <div class="retro-box-title pixelated">
            <span>SETTINGS</span>
            <button class="close-btn" @click="toggleModal">X</button>
          </div>

          <div class="settings-content">
            <div class="setting-row">
              <label>TOUCH GESTURES</label>
              <button 
                @click="settingsStore.toggleGestures()" 
                :class="['toggle-btn', { active: settingsStore.gesturesEnabled }]"
              >
                {{ settingsStore.gesturesEnabled ? 'ON' : 'OFF' }}
              </button>
            </div>

            <div class="setting-row">
              <label>BOARD SCALE: {{ settingsStore.tileSize }}px</label>
                <input 
                type="range" 
                min="10" 
                max="60" 
                step="1"
                v-model.number="settingsStore.tileSize"
                class="retro-slider"
                />
            </div>

            <!-- Volume Slider -->
            <div class="setting-row">
              <label>MAIN VOLUME: {{ Math.round(settingsStore.volume * 100) }}%</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                v-model.number="settingsStore.volume"
                class="retro-slider"
              />
            </div>

            <p class="hint">* Gestures enabled on mobile only.</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 1. The Floating Gear Button */
.gear-btn {
  background: #222;
  border: 2px solid #444;
  color: white;
  font-size: 1.5rem;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
  transition: transform 0.3s ease;
}
.gear-btn:hover {
  transform: rotate(45deg);
  border-color: var(--blue-shallow);
}

/* 2. The Modal Backdrop */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Above everything */
}

/* 3. The Modal Box */
.settings-modal {
  width: 90%;
  max-width: 400px;
  background: #111;
  border: 3px solid #444;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.retro-box-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
  padding: 8px 15px;
  color: var(--red-chill);
  border-bottom: 2px solid #444;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-weight: bold;
}
.close-btn:hover { color: white; }

.settings-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-row {
  display: flex;
  align-items: center; /* Vertical center */
  gap: 10px;
}

.setting-row label {
  font-family: 'Silkscreen', sans-serif;
  font-size: 0.75rem;
  color: #ccc;
  
  /* The Fixes: */
  width: 150px;           /* Slightly wider to accommodate "BOARD SCALE: 60px" */
  white-space: nowrap;    /* Forces text to stay on one line */
  flex-shrink: 0;         /* Prevents the slider from squishing the label */
  text-align: left;
}

/* 4. Retro Toggle Style */
.toggle-btn {
  background: #333;
  border: 2px solid #555;
  color: white;
  padding: 5px 15px;
  min-width: 80px;
  font-family: 'Silkscreen', sans-serif;
  cursor: pointer;
}
.toggle-btn.active {
  background: var(--blue-shallow);
  border-color: #00d4ff;
  color: #000;
}

.retro-slider {
  appearance: none;
  background: #333;
  height: 6px;
  border-radius: 3px;
  outline: none;
  flex: 1;
  margin-left: 15px;
}

.retro-slider::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  background: var(--blue-shallow);
  cursor: pointer;
  border: 2px solid #000;
}

.hint {
  font-size: 0.6rem;
  color: #555;
  text-align: center;
  margin-top: 10px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>