function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  // Calculate the input and output ranges
  const inRange = inMax - inMin;
  const outRange = outMax - outMin;

  // Normalize the input value
  const normalizedValue = (value - inMin) / inRange;

  // Map the normalized value to the output range
  const mappedValue = normalizedValue * outRange + outMin;

  return mappedValue;
}

function randomFontWeight(num: number): string {
  return `font-variation-settings: "wght" ${Math.random() * num}`;
}

export { mapRange, randomFontWeight };
