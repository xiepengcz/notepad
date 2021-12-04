'use strict';

const Controller = require('egg').Controller;

const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';

class UserController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 获取注册需要的参数
    if (!username || !password) {
      ctx.body = { code: 500, msg: '账号密码不能为空', data: null };
      return;
    }
    // 验证数据库内是否存在该账号
    const userInfo = await ctx.service.user.getUserByName(username);
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账号名已经被注册，请重新输入',
        data: null,
      };
      return;
    }
    const result = await ctx.service.user.register({
      username, password, signature: '世界和平。', avatar: defaultAvatar, ctime: +new Date(),
    });
    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null,
      };
    }

  }

  async login() {
    // app为全局属性 相当于所有的插件方法都植入到了app对象
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 根据用户名，在数据库查找相对应的id操作
    const userInfo = await ctx.service.user.getUserByName(username);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null,
      };
      return;
    }
    // 找到用户，并且判断输入密码与数据库中用户密码
    if (userInfo && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '账号密码错误',
        data: null,
      };
      return;
    }
    // 生成token加盐
    // app.jwt.sign 方法接受两个参数，第一个为对象，对象内是需要加密的内容；第二个是加密字符串，
    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // token时效24小时
    }, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: '登录成功',
      data: {
        token,
      },
    };
  }

  async test() {
    const { ctx, app } = this;
    // 通过token解析，拿到user_id
    const token = ctx.request.header.authorization; // 请求头获取 authorization属性 值为token
    // 通过app.jwt.verify+加密字符串解析出token值
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    // 响应接口
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        ...decode,
      },
    };

  }

  async getUserInfo() {
    const { ctx, app } = this;
    // 通过token解析，拿到user_id
    const token = ctx.request.header.authorization; // 请求头获取 authorization属性 值为token
    // 通过app.jwt.verify+加密字符串解析出token值
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    // 通过 getUserByName 从数据库下获该用户的相关信息
    const userInfo = await ctx.service.user.getUserByName(decode.username);
    // 因为user表中存了用户的密码，所以只返回几项信息
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar || defaultAvatar,
      },
    };
  }

  async editUserInfo() {
    const { ctx, app } = this;
    const { signature = '', avatar = '' } = ctx.request.body;
    try {
      // 通过token解析，拿到user_id
      const token = ctx.request.header.authorization; // 请求头获取 authorization属性 值为token
      // 通过app.jwt.verify+加密字符串解析出token值
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      // 通过 getUserByName 从数据库下获该用户的相关信息
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      await ctx.service.user.editUserInfo({ ...userInfo, signature, avatar });
      ctx.body = {
        code: 200,
        msg: '修改成功',
        data: {
          id: userInfo.id,
          username: userInfo.username,
          signature,
        },
      };
    } catch (error) {
      console.log(error);
    }

  }
}

module.exports = UserController;
