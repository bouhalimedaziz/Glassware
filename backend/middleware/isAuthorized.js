export function isAuthorized(roles = []) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" })
    }
    next()
  }
}
