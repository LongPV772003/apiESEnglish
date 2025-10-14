export function errorHandler(err, _req, res, _next){
    const status = err.status || 500;
    res.status(status).json({ success:false, message: err.message || 'Internal error' });
}