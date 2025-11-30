import jwt from "jsonwebtoken"

export function isAuth(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "placeholder")
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" })
  }
}
