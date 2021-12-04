'use strict';

const Controller = require('egg').Controller;

class BillController extends Controller {
  async register() {
    const { ctx, app } = this;
    const { amount, type_id, type_name, data, pay_type, remark = '' } = ctx.request.body; // 账单参数
    if (!amount || !type_id || !type_name || !data || !pay_type) {
      ctx.body = { code: 400, msg: '参数错误', data: null };
      return;
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = await this.app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // user_id 默认添加到每个账单项，作为后续获取指定用户账单的标示。
      // 可以理解为，我登录 A 账户，那么所做的操作都得加上 A 账户的 id，后续获取的时候，就过滤出 A 账户 id 的账单信息。
      await ctx.service.bill.add({
        amount, type_id, type_name, data, pay_type, remark, user_id,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: null,
      };

    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }

  }
}

module.exports = BillController;
