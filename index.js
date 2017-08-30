var assert = require('assert');
var selectelManager = require('node-selectel-manager');
var path = require('path');

function Storage (opts) {
	this.opts = opts;

	assert(this.opts.login, 'login is required');
	assert(this.opts.password, 'password is required');
	assert(this.opts.container, 'container is required');
	
	this.manager = selectelManager(this.opts);
}

Storage.prototype._handleFile = function _handleFile (req, file, cb) {
	var cdnContainer = this.opts.container;
	var generateFilename = this.opts.generateFilename || generateDefaultFilename;
	var baseUrl = this.opts.baseUrl;
	var extend = this.opts.extend || function (x) { return x; }
	var chunks = [];
	var self = this;

	file.stream.on('error', cb);

	file.stream.on('data', function readChunk (chunk) {
		chunks.push(chunk);
	});

	file.stream.on('end', function uploadToCDN () {
		var content = Buffer.concat(chunks);
		var filename = generateFilename(file, req);
		self.manager.uploadFile(content, path.join(cdnContainer, filename))
			.then(function () {
				var res = extend({
					path: baseUrl + filename,
					size: content.length
				}, content);
				if (!self.opts.clearCache) {
					cb(null, res);
				}
				return self.manager.clearCache([res.path])
					.then(function () {
						cb(null, res);
					});
			})
			.catch(cb);
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
