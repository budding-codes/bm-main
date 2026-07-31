/**
 * An error carrying the status code and client-safe message to respond with.
 * Anything thrown that is not an HttpError becomes a generic 500.
 */
class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.name = 'HttpError';
		this.status = status;
		this.expose = true;
	}
}

const badRequest = (message) => new HttpError(400, message);
const unauthorized = (message = 'Unauthorized.') => new HttpError(401, message);
const notFound = (message) => new HttpError(404, message);

module.exports = { HttpError, badRequest, unauthorized, notFound };
