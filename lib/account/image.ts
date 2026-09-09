/**
 * Bağımlılıksız WebP doğrulayıcı: tek kare duran görüntüler kabul edilir
 * (düz VP8/VP8L ya da ICCP/ALPHA taşıyan VP8X kapsayıcıları).
 * Animasyonlu dosyalar (ANIM/ANMF) reddedilir.
 */

export interface WebPInfo {
  width: number;
  height: number;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(bytes[offset + i]);
  return out;
}

function u16le(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32le(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

/** Kayıplı VP8 bit akışından boyut çıkarır (start code + 14 bit boyutlar). */
function parseVP8(data: Uint8Array): WebPInfo | null {
  if (data.length < 10) return null;
  if (data[3] !== 0x9d || data[4] !== 0x01 || data[5] !== 0x2a) return null;
  const width = u16le(data, 6) & 0x3fff;
  const height = u16le(data, 8) & 0x3fff;
  if (width < 1 || height < 1 || width > 16383 || height > 16383) return null;
  return { width, height };
}

/** Kayıpsız VP8L bit akışından boyut çıkarır (0x2F imzası + paketlenmiş boyutlar). */
function parseVP8L(data: Uint8Array): WebPInfo | null {
  if (data.length < 5 || data[0] !== 0x2f) return null;
  const width = 1 + (data[1] | ((data[2] & 0x3f) << 8));
  const height = 1 + (((data[2] >> 6) | (data[3] << 2) | ((data[4] & 0x0f) << 10)) & 0x3fff);
  if (width < 1 || height < 1 || width > 16384 || height > 16384) return null;
  return { width, height };
}

export function parseWebP(input: Uint8Array): WebPInfo | null {
  if (input.length < 12) return null;
  if (ascii(input, 0, 4) !== "RIFF" || ascii(input, 8, 4) !== "WEBP") return null;
  if (u32le(input, 4) + 8 !== input.length) return null;

  let offset = 12;
  let found: WebPInfo | null = null;
  let decided = false;
  while (offset + 8 <= input.length) {
    const fourcc = ascii(input, offset, 4);
    const size = u32le(input, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + size;
    if (dataEnd > input.length) return null;
    // Animasyonlu kareler kesin ret.
    if (fourcc === "ANIM" || fourcc === "ANMF") return null;
    if (!decided && (fourcc === "VP8 " || fourcc === "VP8L")) {
      decided = true;
      found = fourcc === "VP8 " ? parseVP8(input.subarray(dataStart, dataEnd)) : parseVP8L(input.subarray(dataStart, dataEnd));
      if (!found) return null;
    }
    offset = dataEnd + (size % 2);
  }
  return found;
}

export function isValidWebPImage(input: Uint8Array, maxWidth: number, maxHeight: number): WebPInfo | null {
  const info = parseWebP(input);
  if (!info) return null;
  if (info.width > maxWidth || info.height > maxHeight) return null;
  return info;
}
