import axios, { type AxiosResponse } from "axios";
import { StaticConfig } from "../static/config";
import type { Currency } from "../interfaces/currency";

export class SharedService {
  constructor() {}
  async getTables() {
    try {
      let data: Array<Currency> = [];
      StaticConfig.tablesNames.forEach(async (e) => {
        const response: AxiosResponse<
          [
            {
              table: string;
              no: string;
              effectiveDate: Date;
              rates: Array<Currency>;
            }
          ]
        > = await axios.get(`${StaticConfig.getTablesUrl}/${e}?format=json`);
        const responseData = response.data;
        data.push(...responseData[0].rates);
        data.forEach(currency => {
          let curr = currency.currency

          if (curr.indexOf("(") != -1) {
            currency.currency = curr.slice(0, curr.indexOf("(") - 1)
          }
        })
      });

      return data;
    } catch (e) {
      console.error(e);
    }
  }
}
