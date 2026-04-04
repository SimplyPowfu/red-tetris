/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // This defines the variable 'component' as a Vue component type
  const component: DefineComponent<{}, {}, any>;
  export default component;
}