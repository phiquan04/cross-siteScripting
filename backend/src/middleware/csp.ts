import { Request, Response, NextFunction } from "express";

let cspEnabled = false;

export function toggleCSP(enabled: boolean) {
  cspEnabled = enabled;
}

// BE2: expose current CSP state so frontend can sync on load
export function getCSPStatus() {
  return cspEnabled;
}

export function cspMiddleware(req: Request, res: Response, next: NextFunction) {
  if (cspEnabled) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
    );
  }
  next();
}
