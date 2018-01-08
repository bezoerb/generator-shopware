const debug = require('debug')('<%= themename %>:components');

// Initialize swag comonents as they are required by some plugins
debug('Initializing swag responsive components');
require('./legacy');
