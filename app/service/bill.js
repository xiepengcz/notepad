'use strict';

const Service = require('egg').Service;

class BillService extends Service {
  // 添加账单
  async addBill(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = BillService;
