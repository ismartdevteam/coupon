var _oraclesql,
_dbConfig,
    _connection, // This is used as a singleton in a single connection strategy
    _pool; // Pool singleton

/**
 * Handling connection disconnects, as defined here: https://github.com/felixge/node-mysql
 */
 function handleDisconnect() {
    _connection = _oraclesql.createConnection(_dbConfig);

    _connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    _connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}


module.exports = function (oracle, dbConfig, strategy) {

    if (null == oracle) throw new Error('Missing oracle module param!');
    if (null == dbConfig) throw new Error('Missing dbConfig module param!');
    if (null == strategy) strategy = 'single';

    // Setting _oraclesql module ref
    _oraclesql = oracle;

    // Setting _dbConfig ref
    _dbConfig = dbConfig;

    // Configuring strategies
    switch (strategy) {
        case 'single':
            // Creating single connection instance
            _connection = _oraclesql.createConnection(dbConfig);
            handleDisconnect(dbConfig);
            break;
            case 'pool':
            // Creating pool instance
            _oraclesql.createPool(dbConfig,     function(err, pool) {
              if (err) {
                console.error("createPool() error: " + err.message);
                return;
            }
            _pool=pool;
        }
        );
            
            break;
            case 'request':
            // Nothing at this point do be done
            break;
            default:
            throw new Error('Not supported connection strategy!');
        }

        return function (req, res, next) {
            var poolConnection,
            requestConnection;

            switch (strategy) {
                case 'single':
                // getConnection will return singleton connection
                req.getConnection = function (callback) {
                    callback(null, _connection);
                }
                break;

                case 'pool':
                // getConnection handled by mysql pool
                req.getConnection = function (callback) {
                    // Returning cached connection from a pool, caching is on request level
                    if (poolConnection) return callback(null, poolConnection);
                    // Getting connection from a pool
                    _pool.getConnection(function (err, connection) {
                        if (err) return callback(err);
                        poolConnection = connection;
                        callback(null, poolConnection);
                    });
                }
                break;

                case 'request':
                // getConnection creates new connection per request
                req.getConnection = function (callback) {
                    // Returning cached connection, caching is on request level
                    if (requestConnection) return callback(null, requestConnection);
                    // Creating new connection
                    var connection = _oraclesql.createConnection(dbConfig);
                    connection.connect(function (err) {
                        if (err) return callback(err);
                        requestConnection = connection;
                        callback(null, requestConnection);
                    });
                }
                break;
            }

            var end = res.end;
            res.end = function (data, encoding) {

            // Ending request connection if available
            if (requestConnection) requestConnection.end();

            // Releasing pool connection if available
            if (poolConnection) {
                   console.error('poolConnection release ok');
                poolConnection.release(
                function(err) {
                  if (err) {
                    console.error(err.message);
                }
            });
            }

                res.end = end;
            res.end(data, encoding);
        }

        next();
    }
}
