export function matchesTimeSearch(label: string, query: string, intervalMinutes = 30): boolean {
  let search = query.trim().toLowerCase();
  if (!search) return true;
  const ampmMatch = search.match(/(a|p)m?$/);
  const ampm = ampmMatch ? ` ${ampmMatch[0]}` : "";
  search = search
    .replace(/(a|p)m?$/, "")
    .trim()
    .replace(/^0(?=\d)/, "");

  const minutes = Array.from({ length: 60 / intervalMinutes }, (_, i) => String(i * intervalMinutes).padStart(2, "0"));
  const patterns: string[] = [];
  if (search.includes(":")) {
    const parts = search.split(":");
    if (parts.length !== 2) return false;
    patterns.push(`${parts[0]}:${parts[1]}${ampm}`);
  } else if (/^\d+$/.test(search)) {
    switch (search.length) {
      case 1:
        minutes.forEach((minute) => patterns.push(`${search}:${minute}${ampm}`));
        if (search === "1" && !ampmMatch) {
          [11, 12].forEach((hour) => minutes.forEach((minute) => patterns.push(`${hour}:${minute}`)));
        }
        break;
      case 2:
        minutes.forEach((minute) => patterns.push(`${search}:${minute}${ampm}`));
        patterns.push(`${search[0]}:${search[1]}0${ampm}`);
        break;
      case 3:
        patterns.push(`${search[0]}:${search.slice(1)}${ampm}`, `${search.slice(0, 2)}:${search[2]}0${ampm}`);
        break;
      case 4:
        patterns.push(`${search.slice(0, 2)}:${search.slice(2)}${ampm}`);
        break;
    }
  }
  return patterns.some((pattern) => label.toLowerCase().startsWith(pattern));
}
