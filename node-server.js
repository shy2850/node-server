"use strict";
var server = require('./nodeLib/index'),
    CONF = require('./nodeLib/config/conf');

var ports = {}, extCmd = ([]).slice.call( process.argv, 2 ).join(' ');
for(var k in CONF){
    if(k === 'setup'){
        CONF.setup(server);
    }else if(!ports[CONF[k].port]){
        ports[CONF[k].port] = server.start(CONF[k]);
        console.log("Server running at http://127.0.0.1:" + CONF[k].port + '\t[' + k + ']');
    }else{
        console.log("Server running at http://127.0.0.1:" + CONF[k].port + '\t[' + k + ']');
    }
}

if(extCmd === "start"){
	require('child_process').exec( "explorer http://localhost" );
}
