<script setup lang="ts">
import Konva from "konva";
import { onMounted, ref, unref } from "vue";

const props = defineProps<{
  width?: number;
  height?: number;
}>();

const id = Math.random().toString(24).slice(2);

const stageRef = ref<Konva.Stage | null>(null);

const init = () => {
  const stage = new Konva.Stage({
    container: id,
    width: props.width ?? 700,
    height: props.height ?? 700,
  });

  stageRef.value = stage;

  // then create layer
  var layer = new Konva.Layer();
  layer.setZIndex(2);
  var lineLayer = new Konva.Layer();
  lineLayer.setZIndex(1);
};

const initShap = (data: Record<string, any>) => {
  unref(stageRef)?.clear();

  const { layers } = data;

  createLayers(layers);
};

const createLayers = (layers: any[]) => {
  layers.forEach(({ layerId, paths }, index) => {
    const layerIdram = `${layerId}_${index + 1}_${Math.random()
      .toString(24)
      .slice(2)}`;

    const layer = new Konva.Layer({
      id: layerIdram,
    });

    unref(stageRef)!.add(layer);

    paths.forEach((path, p_index) => {
      path.layerId = layerIdram;

      const group = new Konva.Group({
        id: layerId + "_group" + p_index,
      });

      layer.add(group);

      createPointsAndLines(layer, group, path);
    });
  });
};

const createPointsAndLines = (
  currentLayer: Konva.Layer,
  group: Konva.Group,
  path
) => {
  const { nodesPos, lines } = path;
  // 画点
  nodesPos.forEach(({ x, y, id, type }) => {
    const rect = new Konva.Rect({
      x: x,
      y: y,
      width: 8,
      height: 8,
      fill: "transparent",
      stroke: "#666",
      strokeWidth: 1,
      id: id,
      name: type,
      draggable: true,
    });

    rect.on("dragmove", () => {
      const id = rect.getAttr("id");

      const lines = group.getChildren((node) => {
        const lineId: string[] = node.getAttr("id").split(",");
        return lineId.includes(id) && node.getAttr("name") === "Line";
      });
    });

    group.add(rect);
  });

  // 画线

  lines.forEach((lineArr) => {
    const l = lineArr.length;

    if (l === 2) {
      const [{ x: x, y: y, id: id1 }, { x: x1, y: y1, id: id2 }] = lineArr;
      const line = new Konva.Path({
        stroke: "#000",
        data: `M ${x + 4} ${y + 4} L ${x1 + 4} ${y1 + 4}`,
        strokeWidth: 1,
        id: `${id1},${id2}`,
        name: "Line",
      });
      group.add(line);
      return;
    }
    if (l === 3) {
      const [
        { x: x, y: y, id: id1 },
        { x: x1, y: y1, id: id2 },
        { x: x3, y: y3, id: id3 },
      ] = lineArr;
      const line = new Konva.Path({
        data: `M ${x + 4} ${y + 4} Q ${x1 + 4} ${y1 + 4} ${x3 + 4} ${y3 + 4}`,
        stroke: "#000",
        strokeWidth: 1,
        id: `${id1},${id2},${id3}`,
        name: "Line",
      });
      group.add(line);
    }
    if (l === 4) {
      const [
        { x: x, y: y, id: id1 },
        { x: x1, y: y1, id: id2 },
        { x: x3, y: y3, id: id3 },
        { x: x4, y: y4, id: id4 },
      ] = lineArr;
      const line = new Konva.Path({
        data: `M ${x + 4} ${y + 4} C ${x1 + 4} ${y1 + 4} ${x3 + 4} ${y3 + 4} ${
          x4 + 4
        } ${y4 + 4}`,
        stroke: "#000",
        name: "Line",
        strokeWidth: 1,
        id: `${id1},${id2},${id3},${id4}`,
      });
      group.add(line);
    }
  });

  // 点的拖动绑定线

  const rects = group.getChildren((node) => {
    console.log(node.getType());
    return node.getType() === "rect";
  });

  group.draw();
};

onMounted(() => {
  init();
});

defineExpose({
  initShap,
});
</script>

<template>
  <div :id="id" class="shadow"></div>
</template>

<style scoped>
.shadow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
}
:deep(.konvajs-content) {
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
    rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;

  transform: rotateX("180deg");
}
</style>
