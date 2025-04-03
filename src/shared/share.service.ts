import axios, { type AxiosResponse } from "axios";
import { StaticConfig } from "../static/config";
import type { Currency } from "../interfaces/currency";

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
					> = await axios.get(
						`${StaticConfig.getTablesUrl}/${table}?format=json`
					);

					response.data[0].rates.map((currency) => {
						currency.table = table;
					});
					return response.data[0].rates;
				})
			);

			data = responses.flat();

			data = Array.from(new Map(data.map((it) => [it.code, it])).values());

			data.forEach((currency) => {
				let curr = currency.currency;
				if (curr.includes("(")) {
					curr = curr.slice(0, curr.indexOf("(") - 1);
				}

				curr = curr
					.trim()
					.split(" ")
					.map((el) => el[0].toLocaleUpperCase() + el.slice(1))
					.join(" ");

				currency.currency = curr;

				if (currency.ask && currency.bid) {
					currency.mid = (currency.ask + currency.bid) / 2;
				}
			});

			return data;
		} catch (e) {
			console.error(e);
			return [];
		}
	}

	async getRates(currency: Currency, start: Date, end: Date) {
		console.log(
			currency,
			start.toLocaleDateString("en-CA"),
			end.toLocaleDateString("en-CA")
		);
		const response: AxiosResponse<{
			table: string;
			currency: string;
			code: string;
			rates: [
				{
					currency: string;
					table: string;
					code: string;
					mid?: number;
					ask?: number;
					bid?: number;
				}
			];
		}> = await axios.get(
			`${StaticConfig.getRatesUrl}/${currency.table}/${
				currency.code
			}/${start.toLocaleDateString("en-CA")}/${end.toLocaleDateString("en-CA")}`
		);

    response.data.rates.forEach((rate) => {
      if (rate.ask && rate.bid) {
        rate.mid = (rate.ask + rate.bid) / 2;
      }
    })

		return response.data.rates;
	}
}
