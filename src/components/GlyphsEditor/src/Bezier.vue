<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Glyphs } from "../utils/parse";
import { DotPoint } from "../types";

const offset = { x: 0, y: 120 };

const emit = defineEmits<{
  select: [any];
}>();

const getLines = (
  data: DotPoint[],
  result: DotPoint[][] = []
): DotPoint[][] => {
  if (data.length <= 1) return result;

  let first = false;
  const index = data.findIndex((o) => {
    if (!first) {
      first = true;
      return false;
    } else return o.type !== "offcurve";
  });

  result.push(
    data
      .slice(0, index + 1)
      .map((i) => ({ x: i.x, y: i.y, type: i.type, id: i.id }))
  );

  return getLines(data.slice(index), result);
};

// const getLocationDecritionSum = (val: number) => {
//   const base = 200;
//   switch (val) {
//     case 1:
//       return { x: base, y: 0 };
//     case 2:
//       return { x: base, y: base };
//     case 3:
//       return { x: 0, y: base };
//     case 4:
//       return { x: -base, y: base };
//     case 5:
//       return { x: -base, y: 0 };
//     case 6:
//       return { x: -base, y: -base };
//     case 7:
//       return { x: 0, y: -base };
//     case 8:
//       return { x: base, y: -base };
//     default:
//       return { x: 0, y: 0 };
//   }
// };

// const getLocationArrow = (x: number, y: number, location: number) => {
//   const basel = 20;
//   switch (location) {
//     case 1:
//       return [
//         { x: x - basel, y: y - basel },
//         { x: x - basel, y: y + basel },
//       ];
//     case 2:
//       return [
//         { x: x - basel, y: y },
//         { x: x, y: y - basel },
//       ];
//     case 3:
//       return { x: 0, y: basel };
//     case 4:
//       return { x: -basel, y: basel };
//     case 5:
//       return { x: -basel, y: 0 };
//     case 6:
//       return { x: -basel, y: -basel };
//     case 7:
//       return { x: 0, y: -basel };
//     case 8:
//       return { x: basel, y: -basel };
//     default:
//       return { x: 0, y: 0 };
//   }
// };

// const getLocations = (locations: number[]) => {
//   const s = locations.reduce<Path[][]>((s, i, index) => {
//     if (index === 0) {
//       const { x, y } = getLocationDecritionSum(i);
//       s.push([
//         { x: 200, y: 200, type: "line" },
//         { x: 200 + x, y: y + 200, type: "line" },
//       ]);
//     } else {
//       const { x, y } = s[index - 1][1];
//       const { x: offsetX, y: offsetY } = getLocationDecritionSum(i);
//       s.push([
//         { x, y, type: "line" },
//         { x: x + offsetX, y: y + offsetY, type: "line" },
//       ]);
//     }

//     return s;
//   }, []);
//   return s;
// };

// const justmentPosition = (paths: Path[]) => {
//   const xArr = paths.map((o) => o.x);
//   const yArr = paths.map((o) => o.y);

//   const minX = Math.min(...xArr);
//   const maxX = Math.max(...xArr);
//   const minY = Math.min(...yArr);
//   const maxY = Math.max(...yArr);

//   let res = paths.map((i) => ({ ...i }));

//   if (minX <= 30) {
//     res = res.map((i) => ({
//       x: i.x + Math.abs(minX) + 30,
//       y: i.y,
//       type: i.type,
//     }));
//   }

//   if (maxX >= 980) {
//     res = res.map((i) => ({
//       x: i.x - (maxX - 980),
//       y: i.y,
//       type: i.type,
//     }));
//   }

//   if (minY <= 30) {
//     res = res.map((i) => ({
//       y: i.y + Math.abs(minY) + 30,
//       x: i.x,
//       type: i.type,
//     }));
//   }

//   if (maxY >= 980) {
//     res = res.map((i) => ({
//       y: i.y - (maxY - 980),
//       x: i.x,
//       type: i.type,
//     }));
//   }

//   return res;
// };

const getPath = (lines: DotPoint[]) => {
  if (lines.length === 2) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = lines;
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (lines.length === 3) {
    const [{ x: x1, y: y1 }, { x, y }, { x: x2, y: y2 }] = lines;
    return `M ${x1} ${y1} Q ${x} ${y} ${x2} ${y2}`;
  }

  if (lines.length === 4) {
    const [{ x: x1, y: y1 }, { x, y }, { x: _x, y: _y }, { x: x2, y: y2 }] =
      lines;
    return `M ${x1} ${y1} C ${x} ${y} ${_x} ${_y} ${x2} ${y2}`;
  }

  return "";
};

const getSinglePath = (lines: DotPoint[]) => {
  const ls = lines.slice(1);
  if (ls.length === 1) {
    const [{ x: x1, y: y1 }] = ls;
    return `L ${x1} ${y1}`;
  }

  if (ls.length === 2) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = ls;
    return `Q ${x1} ${y1} ${x2} ${y2}`;
  }

  if (ls.length === 3) {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }] = ls;
    return `C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
  }

  return "";
};

const getPathLines = (lines: DotPoint[][]) => {
  const arr = lines.reduce<string[]>((s, i, index) => {
    const j = index === 0 ? getPath(i) : getSinglePath(i);
    s.push(j);
    return s;
  }, []);
  return arr.join(" ");
};

const getWholePath = (paths: { lines: DotPoint[][] }[]) => {
  const path = paths.reduce<string[]>((s, i) => {
    s.push(getPathLines(i.lines));
    return s;
  }, []);
  return path.join(" ");
};

// const getFont = (val: string) => {
//   return eval("'" + val.replace(/uni/, "\\u").split(".")[0] + "'");
// };

const componentsData = ref<Record<string, any>[]>([]);

const resolveText = (text: string) => {
  const glyphsJson = new Glyphs(text).reslut;

  if (!glyphsJson) return;

  const { glyphs, fontMaster = [] } = glyphsJson;

  const res = glyphs.filter((i: { layers: any }) => {
    const { layers } = i;

    return layers.every((o: { paths: any }) => o.paths);
  });

  const components = res.map((g: { layers: any }) => {
    const { layers } = g;

    return {
      ...g,
      layers: layers.map((l: { paths: any; layerId: string }) => {
        const { paths } = l;

        return {
          ...l,
          isMain: fontMaster.some((f: { id: string }) => f.id === l.layerId),
          paths: paths.map((p: { nodes: any }) => {
            const { nodes } = p;

            const nodesPos = nodes.reverse().map((n: string) => {
              const [x, y, type] = n.split(/\s/);
              return {
                id: Math.random().toString(24).slice(2),
                x: Number(x) + offset.x,
                y: 880 - Number(y),
                type: type.toLowerCase(),
              };
            });

            const iIndex = nodesPos.findIndex(
              (n: DotPoint) => n.type !== "offcurve"
            );

            if (iIndex !== 0) {
              const noEndPoints = nodesPos.splice(iIndex);
              nodesPos.splice(0, 0, ...noEndPoints);
            }

            // nodesPos.push(nodesPos[0]);
            return {
              ...p,
              nodes,
              nodesPos,
              lines: [...getLines(nodesPos.concat(nodesPos[0]), [])],
            };
          }),
        };
      }),
    };
  });

  componentsData.value = components;
};

const handleSelect = (data: any) => {
  emit("select", data);
};

const handleListenUpload = () => {
  const input = document.getElementById("glyphs-upload") as HTMLInputElement;

  input.addEventListener("change", () => {
    if (input.files?.length) {
      const currentFile = input.files[0];
      const fileReader = new FileReader();

      fileReader.onload = () => {
        try {
          resolveText(fileReader.result as string);
        } catch (e) {
          alert(e?.toString());
        }
      };

      fileReader.onerror = () => {
        alert("Failed to read file:" + fileReader.error?.toString());
      };

      fileReader.readAsText(currentFile);
    }
  });
};

onMounted(() => {
  handleListenUpload();
});

defineExpose({
  resolveText,
});
</script>

<template>
  <div class="input-wrapper">
    <input type="file" accept=".glyphs" id="glyphs-upload" />
  </div>
  <div class="flex">
    <div
      class="shadow line-1 p-3"
      v-for="(i, index) in componentsData"
      :key="index"
      @click.stop="handleSelect(i)"
    >
      <svg width="120px" height="120px" viewBox="0 0 1200 1200">
        <g v-for="layer in i.layers" :key="layer.layerId" v-show="layer.isMain">
          <path :d="getWholePath(layer.paths)" />
        </g>
      </svg>
    </div>
  </div>
</template>

<!-- 
        <g v-for="(p, p_index) in layer.paths" :key="p_index">
            <path
              v-for="(line, l_index) in p.lines"
              :key="l_index"
              fill="none"
              fillOpacity="1"
              stroke-width="8"
              stroke="#333"
              :d="getPath(line)"
            />
          </g>
 -->

<style scoped>
.input-wrapper {
  padding: 20px 16px;
}
.flex {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 4px 16px 24px;
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
}

.p-3 {
  padding: 12px;
  box-sizing: border-box;
  position: relative;
}

.shadow {
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.line-1 {
  line-height: 1;
}
</style>
