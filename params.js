const params = {
  server:{
    host: '0.0.0.0',
    port: process.env.PORT || 3004,
    historyApiFallback: true,
    get url(){ return 'http://' + this.host + ':' + this.port } 
  },
}

module.exports = params
// export default params;
