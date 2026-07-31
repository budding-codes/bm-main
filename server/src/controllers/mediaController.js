const mediaService = require('../services/mediaService');
const { badRequest } = require('../utils/httpError');

async function upload(req, res) {
	if (!req.file) {
		throw badRequest('No file was provided.');
	}

	const asset = await mediaService.uploadFile(req.file, { uploadedBy: req.admin?.email || '' });
	res.status(201).json({ asset });
}

async function uploadMany(req, res) {
	if (!req.files || req.files.length === 0) {
		throw badRequest('No files were provided.');
	}

	const { assets, failures } = await mediaService.uploadFiles(req.files, {
		uploadedBy: req.admin?.email || ''
	});

	// Partial success is reported as 207 so the client can surface which files failed.
	res.status(failures.length > 0 ? 207 : 201).json({ assets, failures });
}

async function list(req, res) {
	const { kind, search, tag, page, pageSize } = req.query;
	const result = await mediaService.listAssets({ kind, search, tag, page, pageSize });

	res.json(result);
}

async function getOne(req, res) {
	const asset = await mediaService.getAsset(req.params.id);
	res.json({ asset });
}

async function update(req, res) {
	const asset = await mediaService.updateAsset(req.params.id, req.body);
	res.json({ asset });
}

async function remove(req, res) {
	const asset = await mediaService.deleteAsset(req.params.id, {
		force: req.query.force === 'true'
	});

	res.json({ asset, message: 'Media asset deleted.' });
}

module.exports = { upload, uploadMany, list, getOne, update, remove };
