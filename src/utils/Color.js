export function rgbaToHex(color) {
  // Ensure the color object has the required properties
  if (
    !color ||
    typeof color !== "object" ||
    isNaN(color.r) ||
    isNaN(color.g) ||
    isNaN(color.b)
  ) {
    return null;
  }
  // Convert the RGBA values to hexadecimal format
  const rHex = Math.round(color.r).toString(16).padStart(2, "0");
  const gHex = Math.round(color.g).toString(16).padStart(2, "0");
  const bHex = Math.round(color.b).toString(16).padStart(2, "0");

  // Create the hex color string (ignoring alpha)
  const hexColor = `#${rHex}${gHex}${bHex}`;

  return hexColor;
}

export function rgbaTorgba(color) {
  // Ensure the color object has the required properties
  if (
    !color ||
    typeof color !== "object" ||
    isNaN(color.r) ||
    isNaN(color.g) ||
    isNaN(color.b)
  ) {
    return null;
  }

  return (
    "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")"
  );
}

export function hexToRgb(hex) {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "");

  // Parse the hex value into separate RGB components
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}
