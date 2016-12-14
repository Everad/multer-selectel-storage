## multer-selectel-storage

[multer](https://github.com/expressjs/multer) storage for [selectel cdn](https://selectel.ru/services/cloud-storage/)

### Installation

```
npm install multer-selectel-storage
```

### Usage

```js
var multer = require('multer');
var SelectelStorage = require('multer-selectel-storage');

var upload = multer({
	storage: new SelectelStorage({
		login: 'abc',
		password: 'xyz',
		container: 'development',
		baseUrl: 'https://123.cdn.example.com/development/',

		// optional custom filename generator
		generateFilename: function generateFilename (file, req) {
			return Math.random() + path.extname(file.originalname);
		}
	})
});
```

### License

MIT
