<script lang="ts">
  import CurrencyDropdown from "./../components/CurrencyDropdown.svelte";
  import { SharedService } from "../shared/share.service";
  import { onMount } from "svelte";
  import type { Currency } from "../interfaces/currency"

  const sharedService = new SharedService() 

  // const currencies: Currency[] = [
  //   { code: "USD", name: "US Dollar", countryCode: "us" },
  //   { code: "EUR", name: "Euro", countryCode: "eu" },
  //   { code: "GBP", name: "British Pound", countryCode: "gb" },
  //   { code: "JPY", name: "Japanese Yen", countryCode: "jp" },
  // ];

  let fromCurrency: Currency;
  let toCurrency: Currency;
  let currencies: Currency[] = []
  
  const swapCurrencies = () => {
    const temp = fromCurrency;
    fromCurrency = toCurrency;
    toCurrency = temp;
  };

  onMount(async () => {
    currencies = await sharedService.getTables();
    fromCurrency = currencies[0]
    toCurrency = currencies[1]
  })
</script>

<div class="relative">
  <div
    class="absolute inset-0 bg-gradient-to-b from-blue-900 from-80% to-white to-30%"
  ></div>

  <div class="relative px-4 py-8 text-center text-white">
    <h1
      class="relative pt-15 mb-4 z-10 text-4xl text-center leading-none tracking-tight md:text-4xl lg:text-5xl text-white"
    >
      Currency converter
    </h1>
    <p class="relative z-10 text-lg text-center text-white md:text-xl">
      Check daily foreign currency exchange rates
    </p>
  </div>

  <div class="relative mx-auto w-full md:w-1/2 px-4 py-4">
    <div
      class="bg-white p-6 rounded-lg w-full flex flex-col items-end gap-3 shadow-lg"
    >
      <div class="flex flex-col lg:flex-row gap-5 w-full">
        <div
          class="relative w-full lg:w-1/3 border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 flex items-center"
        >
          <input
            id="amount"
            class="w-full text-lg font-semibold focus:outline-none bg-transparent"
            placeholder="123"
          />
        </div>

        <div class="relative flex flex-col lg:flex-row gap-5 lg:w-2/3 w-full">
          {#if currencies.length > 0}
          <CurrencyDropdown bind:selectedCurrency={fromCurrency} bind:excludedCurrency={toCurrency} bind:currencies={currencies} id={"0"} />
          {:else}
          <p>Ładowanie</p>
          {/if}
          <button
            class="absolute cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 inline-flex rounded-full border border-gray-300 border-solid border-gray-250 bg-white p-3 hover:bg-gray-150 transition-colors"
            aria-label="Swap currencies"
            type="button"
            on:click={swapCurrencies}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 17"
              aria-hidden="true"
              class="h-4 w-4 rotate-90 text-greyblue-400 md:rotate-0"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          {#if currencies.length > 0}
          <CurrencyDropdown bind:selectedCurrency={toCurrency} bind:excludedCurrency={fromCurrency} currencies={currencies} id={"1"} />
          {/if}
        </div>
      </div>

      <button
        type="button"
        class="text-white cursor-pointer text-center w-1/2 lg:w-1/4 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >Convert</button
      >
    </div>
  </div>
</div>
