<script setup lang="ts">
import { onMounted, ref } from "vue";
import { GlyphsEditor, GlyphsSvg } from "./components/GlyphsEditor";

const readGlyphs = async () => {
  const res = await fetch("/test.glyphs");
  const text = await res.text();

  glyphsSvgRef.value.resolveText(text);
};

const glyphsSvgRef = ref();

const glyphsEditorRef = ref();

const currentSelectData = ref();

const handleSelect = (data: any) => {
  currentSelectData.value = data;

  glyphsEditorRef.value.initShap(data);
};

onMounted(() => {
  readGlyphs();
});
</script>

<template>
  <div class="editor-wrapper">
    <div class="editor-menu">
      <GlyphsSvg ref="glyphsSvgRef" :data="[]" @select="handleSelect" />
    </div>

    <div class="editor-content">
      <GlyphsEditor ref="glyphsEditorRef" :width="1000" :height="900" />
    </div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  width: 100%;
  display: flex;
}

.editor-menu {
  width: 758px;
}

.editor-content {
  flex: 1;
}
</style>
