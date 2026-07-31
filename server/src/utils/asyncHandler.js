/**
 * Wraps an async route handler so a rejected promise reaches the error middleware
 * instead of hanging the request.
 *
 * `failureMessage` is the client-facing text for unexpected failures. Errors the
 * service raised deliberately (HttpError) keep their own message.
 */
function asyncHandler(handler, failureMessage) {
	return function wrapped(req, res, next) {
		Promise.resolve(handler(req, res, next)).catch((err) => {
			if (failureMessage && err && !err.publicMessage) {
				err.publicMessage = failureMessage;
			}
			next(err);
		});
	};
}

module.exports = { asyncHandler };
