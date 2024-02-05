export type PointType = "line" | "offcurve" | "curve";

export type DotPoint = {
  x: number;
  y: number;
  type: PointType;
  id: string;
};
