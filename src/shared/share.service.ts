import axios, { type AxiosResponse } from "axios";
import { StaticConfig } from "../static/config";
import type { Currency } from "../interfaces/currency";
import type { Rate } from "../interfaces/rate";

export class SharedService {
  constructor() {}
  async getTables() {
    try {
      let data: Currency[] = [];

      let responses = await Promise.all(
          StaticConfig.tablesNames.map(async (table) => {
            const response: AxiosResponse<
              [
                {
                  table: string;
                  no: string;
                  effectiveDate: Date;
                  rates: Currency[];
                }
              ]
              > = await axios.get(`${StaticConfig.getTablesUrl}/${table}?format=json`);
            
            response.data[0].rates.map(currency => {
              currency.table = table
            })
            return response.data[0].rates
          }  
        )
      )
      
      data = responses.flat()
      
      data.forEach(currency => {
        let curr = currency.currency;
        if (curr.includes("(")) {
          curr = curr.slice(0, curr.indexOf("(") - 1);
        }

        curr = curr
          .trim()
          .split(" ")
          .map(el => el[0].toLocaleUpperCase() + el.slice(1))
          .join(" ");
      });

      return data;
    } catch (e) {
      console.error(e);
      return []
    }
  }

  async getRates(currency: Currency, start: Date, end: Date) {
    console.log(currency, start.toLocaleDateString('en-CA'), end.toLocaleDateString('en-CA'))
    const response: AxiosResponse<
      {
        table: string,
        currency: string,
        code: string,
        rates: Rate[]
      }
    > = await axios.get(`${StaticConfig.getRatesUrl}/${currency.table}/${currency.code}/${start.toLocaleDateString('en-CA')}/${end.toLocaleDateString('en-CA')}`)

    console.log(`${StaticConfig.getRatesUrl}/${currency.table}/${currency.code}/${start.toLocaleDateString('en-CA')}/${end.toLocaleDateString('en-CA')}`)
    return response.data.rates
  }
}
