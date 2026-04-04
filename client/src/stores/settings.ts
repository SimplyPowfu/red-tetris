import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', {
	state: () => ({
		isMobile: false,
		gesturesEnabled:false,
		tileSize: 30, // Default size in pixels
		volume: 0.5,

	}),
	actions: {
		setTileSize(size: number) {
			if (size < 0) return ;
			this.tileSize = size;
		},
		toggleGestures() {
			this.gesturesEnabled = !this.gesturesEnabled;
		},
		setVolume(volume: number) {
			if (volume < 0) return
			this.volume = volume;
		}
	}
});