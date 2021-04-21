module.exports = {
  devServer: {
    // 配置反向代理
    proxy: {
      '/ajax': {  // 以/ajax开头的请求
        target: 'https://m.maoyan.com',  // 以/ajax开头的请求，全部代理到https://m.maoyan.com上
        // ws: true,
        changeOrigin: true
      },
      '/foo': {
        target: '<other_url>'
      }
    }
  }
}
