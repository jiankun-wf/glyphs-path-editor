<script setup lang="ts">
import { onMounted, ref, unref } from "vue";
import { GlyphsEditor, GlyphsSvg } from "./components/GlyphsEditor";
import { merge } from "lodash-es";

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

const handleSave = (data: { layers: Record<string, any>[] }) => {
  if (!unref(currentSelectData)) {
    return;
  }
  unref(currentSelectData).layers = merge(
    unref(currentSelectData).layers,
    data.layers
  );
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
      <GlyphsEditor
        ref="glyphsEditorRef"
        :width="1000"
        :height="1000"
        @save="handleSave"
      />
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
