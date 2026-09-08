// A small custom error class that carries an HTTP status code with it.
// Needed starting Phase 5 because business logic lives in services
// (cartService.js, orderService.js, etc.), which don't have access to `res`
// to call res.status() directly the way controllers do — the service just
// throws, and the controller's catch(error) → next(error) forwards it to
// errorHandler, which reads error.statusCode.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError;