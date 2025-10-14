import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      if (required) return res.status(401).json({ message: "Thiếu token xác thực" });
      else return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  };
}
export const requireAdmin = (req,res,next)=>{ if(!req.user || req.user.role!=='ADMIN') return res.status(403).json({ message:'Forbidden' }); next(); };
