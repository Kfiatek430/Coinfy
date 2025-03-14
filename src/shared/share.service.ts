import axios, { type AxiosResponse } from "axios";
import { StaticConfig } from "../static/config";

export class SharedService {
  constructor() {}
  async getTables() {
    try {
      let data: Array<unknown> = [];
      StaticConfig.tablesNames.forEach(async (e) => {
        const response: AxiosResponse<
          [
            {
              table: string;
              no: string;
              effectiveDate: Date;
              rates: Array<{
                currency: string;
                code: string;
                mid: number;
              }>;
            }
          ]
        > = await axios.get(`${StaticConfig.getTablesUrl}/${e}?format=json`);
        const responseData = response.data;
        data.push(...responseData[0].rates);
      });

      return data;
    } catch (e) {
      console.error(e);
    }
  }
}
