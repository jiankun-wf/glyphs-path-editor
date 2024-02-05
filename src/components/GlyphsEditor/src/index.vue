<script setup lang="ts">
import Konva from "konva";
import { onMounted, ref, unref } from "vue";
import type { DotPoint } from "../types/index";

const props = defineProps<{
  width?: number;
  height?: number;
}>();

const emit = defineEmits<{
  (e: "save", data: { layers: Record<string, any>[] }): void;
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
};

const initShap = (data: Record<string, any>) => {
  const currentLayers = unref(stageRef)?.getLayers();

  if (currentLayers?.length) {
    currentLayers.forEach((layer) => {
      layer.destroy();
    });
    unref(stageRef)?.removeChildren();
  }

  const { layers } = data;

  createLayers(layers);
};

const createLayers = (layers: any[]) => {
  layers.forEach(({ layerId, paths, isMain }, index) => {
    const layerIdram = `${layerId}_${index + 1}_${Math.random()
      .toString(24)
      .slice(2)}`;

    const layer = new Konva.Layer({
      id: layerIdram,
      visible: isMain,
    });

    paths.forEach(
      (
        path: { layerId: string; nodesPos: any; lines: any },
        p_index: string
      ) => {
        path.layerId = layerIdram;

        const group = new Konva.Group({
          id: layerId + "_group" + p_index,
          draggable: false,
        });

        layer.add(group);

        createPointsAndLines(group, path);
      }
    );

    unref(stageRef)!.add(layer);
  });
};

const createPointsAndLines = (
  group: Konva.Group,
  path: { nodesPos: any; lines: any }
) => {
  const { nodesPos, lines } = path;
  // 画点
  nodesPos.forEach(({ x, y, id, type }: DotPoint) => {
    const rect = createRect({ x, y, id, type });

    rect.on("dragmove", () => {
      const id = rect.getAttr("id");

      // 查询所有实线（组成线）
      const lines = group.getChildren((node) => {
        const lineId: string[] = node.getAttr("id").split(",");
        return lineId.includes(id) && node.getAttr("name") === "Line";
      });

      // 更新线
      lines.forEach((line) => {
        const ids = line.getAttr("id").split(",");

        const nodes = group.getChildren((node) => {
          return (
            ids.includes(node.getAttr("id")) && node.getAttr("name") === "DOT"
          );
        });

        const updateLineRes = getLine(
          ids.map((i: string) => {
            const rect = nodes.find((o) => o.getAttr("id") === i);

            const { x, y } = rect!.getPosition();
            return { id: i, x, y };
          })
        );

        if (updateLineRes) {
          const { data, lineArr } = updateLineRes;
          line.setAttr("data", data);
          line.setAttr("lineArr", lineArr);
        }
      });
      // 查询所有标注线（贝塞尔曲线标注线）
      const marklines = group.getChildren((node) => {
        const lineId: string[] = node.getAttr("id").split(",");
        return lineId.includes(id) && node.getAttr("name") === "MarkLine";
      });

      // 更新线
      marklines.forEach((line) => {
        const ids = line.getAttr("id").split(",");

        const nodes = group.getChildren((node) => {
          return (
            ids.includes(node.getAttr("id")) && node.getAttr("name") === "DOT"
          );
        });

        const [{ x: x1, y: y1, type }, { x: x2, y: y2 }]: DotPoint[] = ids.map(
          (i: string) => {
            const rect = nodes.find((o) => o.getAttr("id") === i);

            const { x, y } = rect!.getPosition();
            return { id: i, x, y, type: rect!.getAttr("dotType") };
          }
        );

        if (type === "offcurve") {
          line.setAttr("points", [x2 + 4, y2 + 4, x1, y1]);
        } else {
          line.setAttr("points", [x1 + 4, y1 + 4, x2, y2]);
        }
      });
    });

    group.add(rect);
  });

  // 画线

  lines.forEach((lineArr: DotPoint[]) => {
    const res = getLine(lineArr);
    if (res) {
      const { data, id, lineArr } = res;

      const line = new Konva.Path({
        stroke: "#000",
        data,
        strokeWidth: 2,
        id,
        name: "Line",
        lineArr,
      });

      group.add(line);
    }

    if (lineArr.length === 4) {
      drawBezierLine(group, lineArr);
    }
  });

  group.draw();
};

const drawBezierLine = (group: Konva.Group, lineArr: DotPoint[]) => {
  const [
    { x: x, y: y, id: id, type },
    { x: x1, y: y1, id: id1, type: type1 },
    { x: x2, y: y2, id: id2, type: type2 },
    { x: x3, y: y3, id: id3, type: type3 },
  ] = lineArr;

  group.add(
    new Konva.Line({
      points: [x + 4, y + 4, x1, y1],
      stroke: "#999",
      strokeWidth: 1,
      id: `${id},${id1}`,
      name: "MarkLine",
      dash: [3, 1],
      types: `${type},${type1}`,
    }),

    new Konva.Line({
      points: [x3 + 4, y3 + 4, x2, y2],
      stroke: "#999",
      strokeWidth: 1,
      id: `${id2},${id3}`,
      name: "MarkLine",
      dash: [3, 1],
      types: `${type2},${type3}`,
    })
  );
};

const getLine = (lineArr: DotPoint[]) => {
  const l = lineArr.length;
  if (l === 2) {
    const [
      { x: x, y: y, id: id1, type },
      { x: x1, y: y1, id: id2, type: type2 },
    ] = lineArr;
    return {
      data: `M ${x + 4} ${y + 4} L ${x1 + 4} ${y1 + 4}`,
      lineArr: [
        { x: x, y: y, type, id: id1 },
        { x: x1, y: y1, id: id2, type: type2 },
      ],
      id: `${id1},${id2}`,
    };
  }
  if (l === 3) {
    const [
      { x: x, y: y, id: id1, type },
      { x: x1, y: y1, id: id2, type: type2 },
      { x: x3, y: y3, id: id3, type: type3 },
    ] = lineArr;

    return {
      data: `M ${x + 4} ${y + 4} Q ${x1} ${y1} ${x3 + 4} ${y3 + 4}`,
      id: `${id1},${id2},${id3}`,
      lineArr: [
        { x: x, y: y, type, id: id1 },
        { x: x1, y: y1, type: type2, id: id2 },
        { x: x3, y: y3, id: id3, type: type3 },
      ],
    };
  }
  if (l === 4) {
    const [
      { x: x, y: y, id: id1, type },
      { x: x1, y: y1, id: id2, type: type2 },
      { x: x3, y: y3, id: id3, type: type3 },
      { x: x4, y: y4, id: id4, type: type4 },
    ] = lineArr;
    return {
      data: `M ${x + 4} ${y + 4} C ${x1} ${y1} ${x3} ${y3} ${x4 + 4} ${y4 + 4}`,
      id: `${id1},${id2},${id3},${id4}`,
      lineArr: [
        { x: x, y: y, type, id: id1 },
        { x: x1, y: y1, type: type2, id: id2 },
        { x: x3, y: y3, type: type3, id: id3 },
        { x: x4, y: y4, id: id4, type: type4 },
      ],
    };
  }
  return;
};

const createRect = ({ id, x, y, type }: DotPoint) => {
  if (type === "line") {
    return new Konva.Rect({
      x: x,
      y: y,
      width: 8,
      height: 8,
      fill: "transparent",
      stroke: "#666",
      strokeWidth: 1,
      id: id,
      name: "DOT",
      draggable: true,
      dotType: type,
    });
  } else if (type === "curve") {
    return new Konva.Rect({
      x: x,
      y: y,
      width: 8,
      height: 8,
      fill: "transparent",
      stroke: "green",
      strokeWidth: 2,
      id: id,
      name: "DOT",
      draggable: true,
      dotType: type,
    });
  } else {
    return new Konva.Circle({
      x: x,
      y: y,
      radius: 3,
      fill: "transparent",
      stroke: "green",
      strokeWidth: 2,
      id: id,
      name: "DOT",
      draggable: true,
      dotType: type,
    });
  }
};

const handleSave = () => {
  const layers = unref(stageRef)?.getLayers();
  const resultData = layers?.map((l) => {
    const groups = l.getChildren((i) => i.nodeType === "Group");
    return {
      layerId: l.getAttr("id").split("_")[0],
      paths: groups.map((g) => {
        const dots = (g as Konva.Group).getChildren(
          (i) => i.getAttr("name") === "DOT"
        );

        const lines = (g as Konva.Group).getChildren(
          (i) => i.getAttr("name") === "Line"
        );

        const dotsData = dots.map((d) => {
          const { x, y } = d.getPosition();
          const type = d.getAttr("dotType");
          const id = d.getAttr("id");
          return { x, y, type, id };
        });

        const lineArr = lines.map((l) => {
          return l.getAttr("lineArr");
        });

        return {
          nodes: dotsData.map(
            ({ x, y, type }) => `${x} ${880 - y} ${type.toUpperCase()}`
          ),
          nodesPos: dotsData,
          lines: lineArr,
        };
      }),
    };
  });

  console.log(resultData);

  emit("save", { layers: resultData ?? [] });
};

onMounted(() => {
  init();
});

defineExpose({
  initShap,
});
</script>

<template>
  <button @click="handleSave">保存</button>
  <div :id="id" class="shadow"></div>
</template>

<style scoped>
.shadow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
}

:deep(.konvajs-content) {
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px,
    rgba(9, 30, 66, 0.08) 0px 0px 0px 1px;
}
</style>
