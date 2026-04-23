const XSS_PATTERNS: { pattern: RegExp; label: string; severity: number }[] = [
  { pattern: /<script[\s>]/i, label: "<script> tag", severity: 3 },
  { pattern: /on\w+\s*=/i, label: "Event handler (onXXX=)", severity: 3 },
  { pattern: /javascript:/i, label: "javascript: URI", severity: 3 },
  { pattern: /<iframe/i, label: "<iframe> tag", severity: 2 },
  { pattern: /<object/i, label: "<object> tag", severity: 2 },
  { pattern: /<embed/i, label: "<embed> tag", severity: 2 },
  { pattern: /<svg[\s>]/i, label: "<svg> tag", severity: 1 },
  { pattern: /eval\s*\(/i, label: "eval()", severity: 3 },
  { pattern: /document\.cookie/i, label: "document.cookie access", severity: 3 },
  { pattern: /document\.write/i, label: "document.write()", severity: 2 },
  { pattern: /window\.location/i, label: "window.location redirect", severity: 2 },
  { pattern: /fetch\s*\(/i, label: "fetch() call", severity: 2 },
  { pattern: /XMLHttpRequest/i, label: "XMLHttpRequest", severity: 2 },
  { pattern: /\.innerHTML\s*=/i, label: "innerHTML assignment", severity: 2 },
  { pattern: /atob\s*\(/i, label: "atob() Base64 decode", severity: 1 },
  { pattern: /String\.fromCharCode/i, label: "String.fromCharCode obfuscation", severity: 1 },
];

export interface XSSDetectionResult {
  isXSS: boolean;
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  score: number;
  matchedPatterns: string[];
}

export function detectXSS(content: string): XSSDetectionResult {
  const matched = XSS_PATTERNS.filter((p) => p.pattern.test(content));
  const score = matched.reduce((sum, m) => sum + m.severity, 0);

  let riskLevel: XSSDetectionResult["riskLevel"];
  if (score === 0) riskLevel = "none";
  else if (score <= 2) riskLevel = "low";
  else if (score <= 5) riskLevel = "medium";
  else if (score <= 8) riskLevel = "high";
  else riskLevel = "critical";

  return {
    isXSS: matched.length > 0,
    riskLevel,
    score,
    matchedPatterns: matched.map((m) => m.label),
  };
}
