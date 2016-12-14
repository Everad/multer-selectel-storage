var assert = require('assert');
var selectelManager = require('node-selectel-manager');
var path = require('path');

function Storage (opts) {
	this.opts = opts;

	assert(this.opts.login, 'login is required');
	assert(this.opts.password, 'password is required');
	assert(this.opts.container, 'container is required');
}

Storage.prototype._handleFile = function _handleFile (req, file, cb) {
	var cdnContainer = this.opts.container;
	var generateFilename = this.opts.generateFilename || generateDefaultFilename;
	var baseUrl = this.opts.baseUrl;

	selectelManager.authorize(this.opts.login, this.opts.password, function (err) {
		if (err) {
			return cb(err);
		}

		var chunks = [];

		file.stream.on('error', console.log.bind(console));

		file.stream.on('data', function readChunk (chunk) {
			chunks.push(chunk);
		});

		file.stream.on('end', function uploadToCDN () {
			var content = Buffer.concat(chunks);
			var filename = generateFilename(file, req);

			selectelManager.uploadFileByContent(content, path.join(cdnContainer, filename), function onUploadFinished (err, result) {
				cb(err, {
					path: baseUrl + filename,
					size: content.length
				});
			});
		})
	});
};

function generateDefaultFilename (file, req) {
	return Math.random() + path.extname(file.originalname);
}

Storage.prototype._removeFile = function _removeFile (req, file, cb) {
	cb(null);
}

module.exports = function createStorage (opts) {
	return new Storage(opts);
};
