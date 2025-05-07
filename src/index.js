import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
const { json } = bodyParser;
import https from 'https';
import { registryToE2C } from './utils/index.js';

const agent = new https.Agent({
  keepAlive: true, // 复用连接
  maxSockets: 100, // 最大并发连接数
});

const proxyMiddlewareMap = {}
async function bootstrap() {
  const app = express();
  app.use(cors())
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(express.json({ limit: '1mb' }));
  // app.use('*', checkWhitelist)

  /**
   * group name
   * worker id
   */
  // 代理路由
  app.use('/proxy', (req, res, next) => {
    globalThis.lastFetchTs = Date.now();
    let { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: 'url is required' });
    }

    url = decodeURIComponent(url);
    const proxyMiddleware = proxyMiddlewareMap[url] || (proxyMiddlewareMap[url] = createProxyMiddleware({
      target: url, // 目标服务器地址
      changeOrigin: true, // 改变源请求的 origin
      logLevel: 'error', // 日志级别
      timeout: 5000, // 设置代理超时时间（5秒）
      agent,
      pathRewrite: (resPath, req) => {
        let path = resPath.replaceAll('/', '');
        const params = new URLSearchParams(req.query);
        params.delete('url');
        return path.split('?')[0] + '?' + params.toString();
      },
    }));
    proxyMiddleware(req, res, next);
  });


  // 自定义接口 1：健康检查
  app.get('/ping', (req, res) => {
    res.send('pong');
  });


  // 启动服务器
  // const port = 6602;
  const server = app.listen(0, async () => {
    const actualPort = server.address().port; // 获取实际分配的端口
    console.log(`代理服务器已启动，监听端口 ${actualPort}`);
    registryToE2C(actualPort)
  });


}

bootstrap()
