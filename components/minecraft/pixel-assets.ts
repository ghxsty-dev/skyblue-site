export type PixelValue = string | null;
export type PixelAssetGrid = PixelValue[][];

export interface PixelAsset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  preview: string;
  create: (width: number) => PixelAssetGrid;
}

const HEIGHT = 9;

function createGrid(width: number, paint: (x: number, y: number) => PixelValue): PixelAssetGrid {
  return Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: width }, (_, x) => paint(x, y))
  );
}

const assets: readonly PixelAsset[] = [
  {
    id: "skyblue",
    name: "SkyBlue",
    nameEn: "SkyBlue",
    description: "SkyBlue mavi zemin",
    descriptionEn: "SkyBlue blue base",
    preview: "linear-gradient(135deg, #97cdf2, #59abfe)",
    create: (width) => createGrid(width, () => "#59abfe"),
  },
  {
    id: "checker",
    name: "Pixel dama",
    nameEn: "Pixel checker",
    description: "İki tonlu pixel dama deseni",
    descriptionEn: "Two-tone pixel checker pattern",
    preview: "conic-gradient(#59abfe 25%, #173c62 0 50%, #59abfe 0 75%, #173c62 0)",
    create: (width) => createGrid(width, (x, y) => (x + y) % 2 === 0 ? "#59abfe" : "#173c62"),
  },
  {
    id: "stripes",
    name: "Çizgili",
    nameEn: "Stripes",
    description: "Diagonal pixel çizgileri",
    descriptionEn: "Diagonal pixel stripes",
    preview: "repeating-linear-gradient(135deg, #59abfe 0 5px, #173c62 5px 10px)",
    create: (width) => createGrid(width, (x, y) => (x + y * 2) % 6 < 3 ? "#59abfe" : "#173c62"),
  },
  {
    id: "frame",
    name: "Çerçeve",
    nameEn: "Frame",
    description: "İçi koyu, dışı mavi çerçeve",
    descriptionEn: "Blue border with a dark center",
    preview: "linear-gradient(#59abfe 0 20%, #0b0d10 20% 80%, #59abfe 80%)",
    create: (width) => createGrid(width, (x, y) =>
      x === 0 || x === width - 1 || y === 0 || y === HEIGHT - 1 ? "#97cdf2" : "#0b0d10"
    ),
  },
  {
    id: "night",
    name: "Gece",
    nameEn: "Midnight",
    description: "Koyu zeminde mavi ışık noktaları",
    descriptionEn: "Blue sparks on a midnight base",
    preview: "radial-gradient(circle at 30% 30%, #97cdf2 0 8%, transparent 9%), #0b0d10",
    create: (width) => createGrid(width, (x, y) => {
      if ((x * 7 + y * 3) % 19 === 0) return "#97cdf2";
      if ((x * 5 + y) % 23 === 0) return "#59abfe";
      return "#0b0d10";
    }),
  },
  {
    id: "transparent",
    name: "Şeffaf",
    nameEn: "Transparent",
    description: "Tamamen şeffaf başlangıç",
    descriptionEn: "Fully transparent base",
    preview: "repeating-conic-gradient(#26313d 0 25%, #1d252f 0 50%) 50% / 8px 8px",
    create: (width) => createGrid(width, () => null),
  },
];

export const PIXEL_ASSETS = assets;

export function getPixelAsset(id: string): PixelAsset {
  return PIXEL_ASSETS.find((asset) => asset.id === id) || PIXEL_ASSETS[0];
}
