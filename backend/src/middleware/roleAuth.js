function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user; // set by JWT middleware
    if (!user || !user.role || !roles.includes(user.role)) {
      return res
        .status(403)
        .json({
          error: `Forbidden User Role is : ${user?.role || "undefined"}`,
        });
    }
    next();
  };
}

module.exports = { requireRole };
