// vite.preload.config.ts
import { defineConfig, mergeConfig } from "file:///D:/Workspace/naive-mqtt/node_modules/vite/dist/node/index.js";

// vite.base.config.ts
import { builtinModules } from "node:module";

// package.json
var package_default = {
  name: "naive-mqtt",
  productName: "Naive MQTT",
  version: "1.0.0",
  description: "",
  keywords: [],
  license: "MIT",
  type: "module",
  main: ".vite/build/main.mjs",
  scripts: {
    start: "electron-forge start",
    package: "electron-forge package",
    make: "electron-forge make",
    publish: "electron-forge publish",
    prepare: "husky",
    postinstall: "patch-package"
  },
  "nano-staged": {
    "src/**/*.{js,ts,json,css,scss,vue,html,md}": "prettier --write"
  },
  dependencies: {
    "@iconify/json": "^2.2.252",
    "@iconify/utils": "^2.1.33",
    "@iconify/vue": "^4.1.2",
    "@vueuse/core": "^11.1.0",
    "date-fns": "^2.30.0",
    "electron-squirrel-startup": "^1.0.1",
    "electron-store": "^10.0.0",
    "es-toolkit": "^1.27.0",
    localforage: "^1.10.0",
    "monaco-editor": "^0.52.0",
    mqtt: "^5.10.1",
    "naive-ui": "^2.40.1",
    nanoid: "^5.0.7",
    overlayscrollbars: "^2.10.0",
    "overlayscrollbars-vue": "^0.5.9",
    pinia: "^2.2.2",
    "pinia-plugin-persistedstate": "^4.1.2",
    vue: "^3.5.12",
    "vue-i18n": "^10.0.3",
    "vue-router": "^4.4.5"
  },
  devDependencies: {
    "@electron-forge/cli": "^7.5.0",
    "@electron-forge/maker-squirrel": "^7.5.0",
    "@electron-forge/plugin-auto-unpack-natives": "^7.5.0",
    "@electron-forge/plugin-fuses": "^7.5.0",
    "@electron-forge/plugin-vite": "^7.5.0",
    "@electron/fuses": "^1.8.0",
    "@vitejs/plugin-vue": "^5.1.5",
    "@vitejs/plugin-vue-jsx": "^4.0.1",
    electron: "^33.2.0",
    husky: "^9.1.6",
    "nano-staged": "^0.8.0",
    "patch-package": "^8.0.0",
    prettier: "^3.3.3",
    sass: "^1.79.3",
    "sass-embedded": "^1.79.3",
    "ts-node": "^10.9.2",
    typescript: "^5.6.2",
    "unplugin-auto-import": "^0.18.3",
    "unplugin-vue-components": "^0.27.4",
    vite: "^5.4.11",
    "vite-plugin-vue-devtools": "^7.6.4"
  }
};

// vite.base.config.ts
var builtins = ["electron", ...builtinModules.map((m) => [m, `node:${m}`]).flat()];
var external = [
  ...builtins,
  ...Object.keys("dependencies" in package_default ? package_default.dependencies : {})
];
var esModule = package_default.type === "module";
function getBuildConfig(env) {
  const { root, mode, command } = env;
  return {
    root,
    mode,
    build: {
      emptyOutDir: false,
      watch: command === "serve" ? {} : null,
      outDir: ".vite/build",
      minify: command === "build"
    }
  };
}
function pluginHotRestart(command) {
  return {
    name: "@electron-forge/plugin-vite:hot-restart",
    closeBundle() {
      if (command === "reload") {
        for (const server of Object.values(process.viteDevServers)) {
          server.ws.send({ type: "full-reload" });
        }
      } else {
        process.stdin.emit("data", "rs");
      }
    }
  };
}

// vite.preload.config.ts
var vite_preload_config_default = defineConfig((env) => {
  const forgeEnv = env;
  const { forgeConfigSelf } = forgeEnv;
  const ext = esModule ? "mjs" : "js";
  const config = {
    build: {
      rollupOptions: {
        watch: false,
        external,
        input: forgeConfigSelf.entry,
        output: {
          format: "cjs",
          inlineDynamicImports: true,
          entryFileNames: `[name].${ext}`,
          chunkFileNames: `[name].${ext}`,
          assetFileNames: "[name].[ext]"
        }
      }
    },
    plugins: [pluginHotRestart("reload")]
  };
  return mergeConfig(getBuildConfig(forgeEnv), config);
});
export {
  vite_preload_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5wcmVsb2FkLmNvbmZpZy50cyIsICJ2aXRlLmJhc2UuY29uZmlnLnRzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFdvcmtzcGFjZVxcXFxuYWl2ZS1tcXR0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxXb3Jrc3BhY2VcXFxcbmFpdmUtbXF0dFxcXFx2aXRlLnByZWxvYWQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Xb3Jrc3BhY2UvbmFpdmUtbXF0dC92aXRlLnByZWxvYWQuY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBDb25maWdFbnYsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHsgZ2V0QnVpbGRDb25maWcsIGV4dGVybmFsLCBlc01vZHVsZSwgcGx1Z2luSG90UmVzdGFydCB9IGZyb20gJy4vdml0ZS5iYXNlLmNvbmZpZydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhlbnYgPT4ge1xyXG5cdGNvbnN0IGZvcmdlRW52ID0gZW52IGFzIENvbmZpZ0VudjwnYnVpbGQnPlxyXG5cdGNvbnN0IHsgZm9yZ2VDb25maWdTZWxmIH0gPSBmb3JnZUVudlxyXG5cdGNvbnN0IGV4dCA9IGVzTW9kdWxlID8gJ21qcycgOiAnanMnXHJcblx0Y29uc3QgY29uZmlnOiBVc2VyQ29uZmlnID0ge1xyXG5cdFx0YnVpbGQ6IHtcclxuXHRcdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRcdHdhdGNoOiBmYWxzZSxcclxuXHRcdFx0XHRleHRlcm5hbCxcclxuXHRcdFx0XHRpbnB1dDogZm9yZ2VDb25maWdTZWxmLmVudHJ5ISxcclxuXHRcdFx0XHRvdXRwdXQ6IHtcclxuXHRcdFx0XHRcdGZvcm1hdDogJ2NqcycsXHJcblx0XHRcdFx0XHRpbmxpbmVEeW5hbWljSW1wb3J0czogdHJ1ZSxcclxuXHRcdFx0XHRcdGVudHJ5RmlsZU5hbWVzOiBgW25hbWVdLiR7ZXh0fWAsXHJcblx0XHRcdFx0XHRjaHVua0ZpbGVOYW1lczogYFtuYW1lXS4ke2V4dH1gLFxyXG5cdFx0XHRcdFx0YXNzZXRGaWxlTmFtZXM6ICdbbmFtZV0uW2V4dF0nLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cdFx0cGx1Z2luczogW3BsdWdpbkhvdFJlc3RhcnQoJ3JlbG9hZCcpXSxcclxuXHR9XHJcblxyXG5cdHJldHVybiBtZXJnZUNvbmZpZyhnZXRCdWlsZENvbmZpZyhmb3JnZUVudiksIGNvbmZpZylcclxufSlcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxXb3Jrc3BhY2VcXFxcbmFpdmUtbXF0dFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcV29ya3NwYWNlXFxcXG5haXZlLW1xdHRcXFxcdml0ZS5iYXNlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovV29ya3NwYWNlL25haXZlLW1xdHQvdml0ZS5iYXNlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGJ1aWx0aW5Nb2R1bGVzIH0gZnJvbSAnbm9kZTptb2R1bGUnXHJcbmltcG9ydCB0eXBlIHsgQWRkcmVzc0luZm8gfSBmcm9tICdub2RlOm5ldCdcclxuaW1wb3J0IHR5cGUgeyBDb25maWdFbnYsIFBsdWdpbiwgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBwa2cgZnJvbSAnLi9wYWNrYWdlLmpzb24nXHJcblxyXG5leHBvcnQgY29uc3QgYnVpbHRpbnMgPSBbJ2VsZWN0cm9uJywgLi4uYnVpbHRpbk1vZHVsZXMubWFwKG0gPT4gW20sIGBub2RlOiR7bX1gXSkuZmxhdCgpXVxyXG5cclxuZXhwb3J0IGNvbnN0IGV4dGVybmFsID0gW1xyXG5cdC4uLmJ1aWx0aW5zLFxyXG5cdC4uLk9iamVjdC5rZXlzKCdkZXBlbmRlbmNpZXMnIGluIHBrZyA/IChwa2cuZGVwZW5kZW5jaWVzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA6IHt9KSxcclxuXVxyXG5cclxuZXhwb3J0IGNvbnN0IGVzTW9kdWxlID0gcGtnLnR5cGUgPT09ICdtb2R1bGUnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVpbGRDb25maWcoZW52OiBDb25maWdFbnY8J2J1aWxkJz4pOiBVc2VyQ29uZmlnIHtcclxuXHRjb25zdCB7IHJvb3QsIG1vZGUsIGNvbW1hbmQgfSA9IGVudlxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0cm9vdCxcclxuXHRcdG1vZGUsXHJcblx0XHRidWlsZDoge1xyXG5cdFx0XHRlbXB0eU91dERpcjogZmFsc2UsXHJcblx0XHRcdHdhdGNoOiBjb21tYW5kID09PSAnc2VydmUnID8ge30gOiBudWxsLFxyXG5cdFx0XHRvdXREaXI6ICcudml0ZS9idWlsZCcsXHJcblx0XHRcdG1pbmlmeTogY29tbWFuZCA9PT0gJ2J1aWxkJyxcclxuXHRcdH0sXHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmaW5lS2V5cyhuYW1lczogc3RyaW5nW10pIHtcclxuXHRjb25zdCBkZWZpbmU6IHsgW25hbWU6IHN0cmluZ106IFZpdGVQbHVnaW5SdW50aW1lS2V5cyB9ID0ge31cclxuXHJcblx0cmV0dXJuIG5hbWVzLnJlZHVjZSgoYWNjLCBuYW1lKSA9PiB7XHJcblx0XHRjb25zdCBOQU1FID0gbmFtZS50b1VwcGVyQ2FzZSgpXHJcblx0XHRjb25zdCBrZXlzOiBWaXRlUGx1Z2luUnVudGltZUtleXMgPSB7XHJcblx0XHRcdFZJVEVfREVWX1NFUlZFUl9VUkw6IGAke05BTUV9X1ZJVEVfREVWX1NFUlZFUl9VUkxgLFxyXG5cdFx0XHRWSVRFX05BTUU6IGAke05BTUV9X1ZJVEVfTkFNRWAsXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHsgLi4uYWNjLCBbbmFtZV06IGtleXMgfVxyXG5cdH0sIGRlZmluZSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1aWxkRGVmaW5lKGVudjogQ29uZmlnRW52PCdidWlsZCc+KSB7XHJcblx0Y29uc3QgeyBjb21tYW5kLCBmb3JnZUNvbmZpZyB9ID0gZW52XHJcblx0Y29uc3QgbmFtZXMgPSBmb3JnZUNvbmZpZy5yZW5kZXJlci5maWx0ZXIoKHsgbmFtZSB9KSA9PiBuYW1lICE9IG51bGwpLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUhKVxyXG5cdGNvbnN0IGRlZmluZUtleXMgPSBnZXREZWZpbmVLZXlzKG5hbWVzKVxyXG5cdGNvbnN0IGRlZmluZSA9IE9iamVjdC5lbnRyaWVzKGRlZmluZUtleXMpLnJlZHVjZShcclxuXHRcdChhY2MsIFtuYW1lLCBrZXlzXSkgPT4ge1xyXG5cdFx0XHRjb25zdCB7IFZJVEVfREVWX1NFUlZFUl9VUkwsIFZJVEVfTkFNRSB9ID0ga2V5c1xyXG5cdFx0XHRjb25zdCBkZWYgPSB7XHJcblx0XHRcdFx0W1ZJVEVfREVWX1NFUlZFUl9VUkxdOiBjb21tYW5kID09PSAnc2VydmUnID8gSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnZbVklURV9ERVZfU0VSVkVSX1VSTF0pIDogdW5kZWZpbmVkLFxyXG5cdFx0XHRcdFtWSVRFX05BTUVdOiBKU09OLnN0cmluZ2lmeShuYW1lKSxcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4geyAuLi5hY2MsIC4uLmRlZiB9XHJcblx0XHR9LFxyXG5cdFx0e30gYXMgUmVjb3JkPHN0cmluZywgYW55PixcclxuXHQpXHJcblxyXG5cdHJldHVybiBkZWZpbmVcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBsdWdpbkV4cG9zZVJlbmRlcmVyKG5hbWU6IHN0cmluZyk6IFBsdWdpbiB7XHJcblx0Y29uc3QgeyBWSVRFX0RFVl9TRVJWRVJfVVJMIH0gPSBnZXREZWZpbmVLZXlzKFtuYW1lXSlbbmFtZV1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6ICdAZWxlY3Ryb24tZm9yZ2UvcGx1Z2luLXZpdGU6ZXhwb3NlLXJlbmRlcmVyJyxcclxuXHRcdGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuXHRcdFx0cHJvY2Vzcy52aXRlRGV2U2VydmVycyA/Pz0ge31cclxuXHRcdFx0cHJvY2Vzcy52aXRlRGV2U2VydmVyc1tuYW1lXSA9IHNlcnZlclxyXG5cclxuXHRcdFx0c2VydmVyLmh0dHBTZXJ2ZXI/Lm9uY2UoJ2xpc3RlbmluZycsICgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBhZGRyZXNzSW5mbyA9IHNlcnZlci5odHRwU2VydmVyIS5hZGRyZXNzKCkgYXMgQWRkcmVzc0luZm9cclxuXHRcdFx0XHRwcm9jZXNzLmVudltWSVRFX0RFVl9TRVJWRVJfVVJMXSA9IGBodHRwOi8vbG9jYWxob3N0OiR7YWRkcmVzc0luZm8/LnBvcnR9YFxyXG5cdFx0XHR9KVxyXG5cdFx0fSxcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwbHVnaW5Ib3RSZXN0YXJ0KGNvbW1hbmQ6ICdyZWxvYWQnIHwgJ3Jlc3RhcnQnKTogUGx1Z2luIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0bmFtZTogJ0BlbGVjdHJvbi1mb3JnZS9wbHVnaW4tdml0ZTpob3QtcmVzdGFydCcsXHJcblx0XHRjbG9zZUJ1bmRsZSgpIHtcclxuXHRcdFx0aWYgKGNvbW1hbmQgPT09ICdyZWxvYWQnKSB7XHJcblx0XHRcdFx0Zm9yIChjb25zdCBzZXJ2ZXIgb2YgT2JqZWN0LnZhbHVlcyhwcm9jZXNzLnZpdGVEZXZTZXJ2ZXJzKSkge1xyXG5cdFx0XHRcdFx0c2VydmVyLndzLnNlbmQoeyB0eXBlOiAnZnVsbC1yZWxvYWQnIH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHByb2Nlc3Muc3RkaW4uZW1pdCgnZGF0YScsICdycycpXHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fVxyXG59XHJcbiIsICJ7XG4gIFwibmFtZVwiOiBcIm5haXZlLW1xdHRcIixcbiAgXCJwcm9kdWN0TmFtZVwiOiBcIk5haXZlIE1RVFRcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICBcImtleXdvcmRzXCI6IFtdLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwibWFpblwiOiBcIi52aXRlL2J1aWxkL21haW4ubWpzXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJzdGFydFwiOiBcImVsZWN0cm9uLWZvcmdlIHN0YXJ0XCIsXG4gICAgXCJwYWNrYWdlXCI6IFwiZWxlY3Ryb24tZm9yZ2UgcGFja2FnZVwiLFxuICAgIFwibWFrZVwiOiBcImVsZWN0cm9uLWZvcmdlIG1ha2VcIixcbiAgICBcInB1Ymxpc2hcIjogXCJlbGVjdHJvbi1mb3JnZSBwdWJsaXNoXCIsXG4gICAgXCJwcmVwYXJlXCI6IFwiaHVza3lcIixcbiAgICBcInBvc3RpbnN0YWxsXCI6IFwicGF0Y2gtcGFja2FnZVwiXG4gIH0sXG4gIFwibmFuby1zdGFnZWRcIjoge1xuICAgIFwic3JjLyoqLyoue2pzLHRzLGpzb24sY3NzLHNjc3MsdnVlLGh0bWwsbWR9XCI6IFwicHJldHRpZXIgLS13cml0ZVwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBpY29uaWZ5L2pzb25cIjogXCJeMi4yLjI1MlwiLFxuICAgIFwiQGljb25pZnkvdXRpbHNcIjogXCJeMi4xLjMzXCIsXG4gICAgXCJAaWNvbmlmeS92dWVcIjogXCJeNC4xLjJcIixcbiAgICBcIkB2dWV1c2UvY29yZVwiOiBcIl4xMS4xLjBcIixcbiAgICBcImRhdGUtZm5zXCI6IFwiXjIuMzAuMFwiLFxuICAgIFwiZWxlY3Ryb24tc3F1aXJyZWwtc3RhcnR1cFwiOiBcIl4xLjAuMVwiLFxuICAgIFwiZWxlY3Ryb24tc3RvcmVcIjogXCJeMTAuMC4wXCIsXG4gICAgXCJlcy10b29sa2l0XCI6IFwiXjEuMjcuMFwiLFxuICAgIFwibG9jYWxmb3JhZ2VcIjogXCJeMS4xMC4wXCIsXG4gICAgXCJtb25hY28tZWRpdG9yXCI6IFwiXjAuNTIuMFwiLFxuICAgIFwibXF0dFwiOiBcIl41LjEwLjFcIixcbiAgICBcIm5haXZlLXVpXCI6IFwiXjIuNDAuMVwiLFxuICAgIFwibmFub2lkXCI6IFwiXjUuMC43XCIsXG4gICAgXCJvdmVybGF5c2Nyb2xsYmFyc1wiOiBcIl4yLjEwLjBcIixcbiAgICBcIm92ZXJsYXlzY3JvbGxiYXJzLXZ1ZVwiOiBcIl4wLjUuOVwiLFxuICAgIFwicGluaWFcIjogXCJeMi4yLjJcIixcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIl40LjEuMlwiLFxuICAgIFwidnVlXCI6IFwiXjMuNS4xMlwiLFxuICAgIFwidnVlLWkxOG5cIjogXCJeMTAuMC4zXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGVsZWN0cm9uLWZvcmdlL2NsaVwiOiBcIl43LjUuMFwiLFxuICAgIFwiQGVsZWN0cm9uLWZvcmdlL21ha2VyLXNxdWlycmVsXCI6IFwiXjcuNS4wXCIsXG4gICAgXCJAZWxlY3Ryb24tZm9yZ2UvcGx1Z2luLWF1dG8tdW5wYWNrLW5hdGl2ZXNcIjogXCJeNy41LjBcIixcbiAgICBcIkBlbGVjdHJvbi1mb3JnZS9wbHVnaW4tZnVzZXNcIjogXCJeNy41LjBcIixcbiAgICBcIkBlbGVjdHJvbi1mb3JnZS9wbHVnaW4tdml0ZVwiOiBcIl43LjUuMFwiLFxuICAgIFwiQGVsZWN0cm9uL2Z1c2VzXCI6IFwiXjEuOC4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4xLjVcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJeNC4wLjFcIixcbiAgICBcImVsZWN0cm9uXCI6IFwiXjMzLjIuMFwiLFxuICAgIFwiaHVza3lcIjogXCJeOS4xLjZcIixcbiAgICBcIm5hbm8tc3RhZ2VkXCI6IFwiXjAuOC4wXCIsXG4gICAgXCJwYXRjaC1wYWNrYWdlXCI6IFwiXjguMC4wXCIsXG4gICAgXCJwcmV0dGllclwiOiBcIl4zLjMuM1wiLFxuICAgIFwic2Fzc1wiOiBcIl4xLjc5LjNcIixcbiAgICBcInNhc3MtZW1iZWRkZWRcIjogXCJeMS43OS4zXCIsXG4gICAgXCJ0cy1ub2RlXCI6IFwiXjEwLjkuMlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjYuMlwiLFxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xOC4zXCIsXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI3LjRcIixcbiAgICBcInZpdGVcIjogXCJeNS40LjExXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHNcIjogXCJeNy42LjRcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxjQUFjLG1CQUFtQjs7O0FDRDZOLFNBQVMsc0JBQXNCOzs7QUNBdFM7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUNYLGFBQWU7QUFBQSxFQUNmLFVBQVksQ0FBQztBQUFBLEVBQ2IsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLElBQ1QsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gsTUFBUTtBQUFBLElBQ1IsU0FBVztBQUFBLElBQ1gsU0FBVztBQUFBLElBQ1gsYUFBZTtBQUFBLEVBQ2pCO0FBQUEsRUFDQSxlQUFlO0FBQUEsSUFDYiw4Q0FBOEM7QUFBQSxFQUNoRDtBQUFBLEVBQ0Es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
