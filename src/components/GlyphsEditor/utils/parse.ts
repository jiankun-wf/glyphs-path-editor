type StackItem = Record<string, any> | Record<string, any>[];

export class Glyphs {
  private text: string;

  reslut: Record<string, any> | null = null;

  constructor(text: string) {
    this.text = text;

    this.parse();
  }

  private parse = () => {
    const { text } = this;

    const splitArr = text.split(/\n/g);

    const result = this.arrayParse(splitArr);

    this.reslut = result as StackItem;
  };

  /*
  [
     "{",
    ".appVersion = \"1364\";",
    "date = \"2024-01-27 02:29:49 +0000\";",
    "familyName = \"New Font\";",
    "fontMaster = (",
    "{",
    "ascender = 800;",
    "capHeight = 700;",
    "descender = -200;",
    "id = \"9EB94418-E213-4BD6-BCD0-14719C066E6E\";",
    "xHeight = 500;",
    "}",
    ");",
    "glyphs = (",
    "{",
    "color = 10;",
    "glyphname = uni4E00;",
    "lastChange = \"2024-01-27 02:46:33 +0000\";",
    "layers = (",
    "{",
    "layerId = \"ADC43DF4-FA5C-4D9F-AD76-44151B2CA413\";",
    "paths = (",
    "{",
    "closed = 1;",
    "nodes = (",
    "\"48 416 LINE\",",
    "\"943 416 LINE\",",
    "\"943 359 LINE\",",
    "\"48 359 LINE\"",
    ");",
    "}",
    ");",
    "vertWidth = 1000;",
    "width = 1000;",
    "}",
    ");",
    "unicode = 4E00;",
    "},",
    "{",
    "color = 10;",
    "glyphname = uni4E01;",
    "lastChange = \"2024-01-27 02:46:33 +0000\";",
    "layers = (",
    "{",
    "layerId = \"ADC43DF4-FA5C-4D9F-AD76-44151B2CA413\";",
    "paths = (",
    "{",
    "closed = 1;",
    "nodes = (",
    "\"551 689 LINE\",",
    "\"551 25 LINE SMOOTH\",",
    "\"551 -23 OFFCURVE\",",
    "\"515.667 -52 OFFCURVE\",",
    "\"461 -52 CURVE SMOOTH\",",
    "\"336 -52 LINE\",",
    "\"324 9 LINE\",",
    "\"431 9 LINE SMOOTH\",",
    "\"463 9 OFFCURVE\",",
    "\"479 23 OFFCURVE\",",
    "\"479 51 CURVE SMOOTH\",",
    "\"479 689 LINE\"",
    ");",
    "},",
    "{",
    "closed = 1;",
    "nodes = (",
    "\"60 732 LINE\",",
    "\"938 732 LINE\",",
    "\"938 681 LINE\",",
    "\"60 681 LINE\"",
    ");",
    "}",
    ");",
    "vertWidth = 1000;",
    "width = 1000;",
    "}",
    ");",
    "unicode = 4E01;",
    "}",
    ");",
    "unitsPerEm = 1000;",
    "versionMajor = 1;",
    "versionMinor = 0;",
    "}",
    ""
  ]   
   */

  private radomId = () => {
    return Math.random().toString(24).slice(2);
  };

  //    解析上述数组为json
  private arrayParse = (arr: string[]) => {
    const positionStack: StackItem[] = [];

    const arrL = arr.length;

    for (let i = 0; i < arrL; i++) {
      const line = arr[i];
      if (/.* = \(/.test(line)) {
        // 以 key = ( 的 为数组，
        const key = (line.match(/[^\s]+/)?.[0] ?? this.radomId()).trim();

        const arr: Record<string, any>[] = [];

        const lastObj = positionStack[positionStack.length - 1];

        (lastObj as Record<string, any>)[key] = arr;

        positionStack.push(arr);

        continue;
      }

      if (line.endsWith("{")) {
        // 以 { 开头的是一个对象
        if (/.* = {/.test(line)) {
          // json嵌套
          const key = (line.match(/[^\s]+/)?.[0] ?? this.radomId()).trim();

          const obj: Record<string, any> = {};

          const currentObj = positionStack[positionStack.length - 1];

          (currentObj as Record<string, any>)[key] = obj;

          positionStack.push(obj);
        } else {
          // 普通json
          const obj: Record<string, any> = {};

          if (positionStack.length > 0) {
            const currentStack = positionStack[positionStack.length - 1];
            if (currentStack.length !== undefined) {
              currentStack.push(obj);
            }
          }
          positionStack.push(obj);
        }
        continue;
      }

      if (line.indexOf("}") >= 0 && line.indexOf("{") < 0) {
        const resultJson = positionStack.pop();

        if (positionStack.length === 0) {
          return resultJson;
        }
        continue;
      }

      if (line.indexOf(")") >= 0) {
        positionStack.pop();
        continue;
      }

      if (line.indexOf("=") > 0) {
        const currentObj = positionStack[positionStack.length - 1];

        const [key, value] = line.split(/=/);

        const resultValue = value
          .trim()
          .replace(/\\\\/, "")
          .replace(/\"|,|;/g, "");

        if (currentObj.length !== void 0) {
          currentObj.push(resultValue);
        } else {
          (currentObj as any)[key.trim()] = resultValue;
        }
        continue;
      }

      const currentObj = positionStack[positionStack.length - 1];
      if (currentObj.length !== void 0) {
        currentObj.push(
          line
            .trim()
            .replace(/\\\\/, "")
            .replace(/\"|,|;/g, "")
        );
      }
    }

    return positionStack[positionStack.length - 1];
  };
}
