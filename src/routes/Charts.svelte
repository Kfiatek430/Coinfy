<script>
  import { onMount } from "svelte";
  import CurrencyChart from "./../components/CurrencyChart.svelte";
  import CurrencyToCurrencyChart from "./../components/CurrencyToCurrencyChart.svelte";
  import { SharedService } from "./../shared/share.service";
  const shared = new SharedService();

  let currencyCode1 = "USD";
  let currencyCode2 = "EUR";
  let currencies = [];

  let selectedYear1 = "2025";
  let selectedYear2 = "2025";

  let years = [
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011",
    "2010",
    "2009",
    "2008",
    "2007",
    "2006",
    "2005",
    "2004",
    "2003",
    "2002",
  ];

  onMount(async () => {
    try {
      let tables = await shared.getTables();
      currencies = tables.map((element) => ({
        code: element.code,
        currency: element.currency,
      }));
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  });

  function handleCurrencyChange1(event) {
    currencyCode1 = event.target.value;
  }

  function handleCurrencyChange2(event) {
    currencyCode2 = event.target.value;
  }

  function handleYearChange1(event) {
    selectedYear1 = event.target.value;
  }

  function handleYearChange2(event) {
    selectedYear2 = event.target.value;
  }
</script>

<div class="relative min-h-screen flex flex-col items-center justify-center">
  <div
    class="absolute inset-0 bg-gradient-to-b from-blue-900 from-80% to-white to-30%"
  ></div>

  <div class="relative z-10 text-center text-black px-4 py-8 w-full max-w-4xl">
    <h1 class="text-4xl font-bold mt-12 mb-6 text-white">
      Currency Rate Chart to PLN
    </h1>

    <select
      bind:value={currencyCode1}
      on:change={handleCurrencyChange1}
      class="mb-4 p-3 border border-gray-300 text-black bg-white ... border border-gray-300 rounded-md p-3 focus-within:ring-blue-500"
    >
      {#each currencies as currency}
        <option value={currency.code}
          >{currency.code}, {currency.currency}</option
        >
      {/each}
    </select>

    <select
      bind:value={selectedYear1}
      on:change={handleYearChange1}
      class="mb-6 p-3 border border-gray-300 text-black bg-white ... border border-gray-300 rounded-md p-3 focus-within:ring-blue-500"
    >
      {#each years as year}
        <option value={year}>{year}</option>
      {/each}
    </select>

    <div class="bg-white shadow-lg rounded-lg p-6">
      <CurrencyChart currencyCode={currencyCode1} year={selectedYear1} />
    </div>
  </div>

  <div class="relative z-10 text-center text-black px-4 py-8 w-full max-w-4xl">
    <h1 class="text-4xl font-bold mb-6 text-white">
      Currency Comparison Chart
    </h1>

    <select
      bind:value={currencyCode1}
      on:change={handleCurrencyChange1}
      class="mb-4 p-3 border border-gray-300 text-black bg-white ... border border-gray-300 rounded-md p-3 focus-within:ring-blue-500"
    >
      {#each currencies as currency}
        <option value={currency.code}
          >{currency.code}, {currency.currency}</option
        >
      {/each}
    </select>

    <select
      bind:value={currencyCode2}
      on:change={handleCurrencyChange2}
      class="mb-4 p-3 border border-gray-300 text-black bg-white ... border border-gray-300 rounded-md p-3 focus-within:ring-blue-500"
    >
      {#each currencies as currency}
        <option value={currency.code}
          >{currency.code}, {currency.currency}</option
        >
      {/each}
    </select>

    <select
      bind:value={selectedYear2}
      on:change={handleYearChange2}
      class="mb-6 p-3 border border-gray-300 text-black bg-white ... border border-gray-300 rounded-md p-3 focus-within:ring-blue-500"
    >
      {#each years as year}
        <option value={year}>{year}</option>
      {/each}
    </select>

    <div class="bg-white shadow-lg rounded-lg p-6">
      <CurrencyToCurrencyChart
        {currencyCode1}
        {currencyCode2}
        year={selectedYear2}
      />
    </div>
  </div>
</div>

<style>
  select {
    width: fit-content;
  }
</style>
