<script lang="ts">
  import { onMount } from "svelte";

  let goldPricePerGram: number = 0;
  let amount: number = 1;
  let convertedAmount: string = "";
  let isGoldToPLN: boolean = true;

  const fetchGoldPrice = async () => {
    try {
      const response = await fetch(
        "https://api.nbp.pl/api/cenyzlota/?format=json"
      );
      const data = await response.json();
      if (data && data.length > 0) {
        goldPricePerGram = data[0].cena;
      }
    } catch (error) {
      console.error("Error fetching gold price: ", error);
    }
  };

  const convert = () => {
    if (!amount || isNaN(Number(amount))) {
      convertedAmount = "";
      return;
    }
    convertedAmount = isGoldToPLN
      ? (amount * goldPricePerGram).toFixed(2)
      : (amount / goldPricePerGram).toFixed(4);
  };

  const swapConversion = () => {
    isGoldToPLN = !isGoldToPLN;
    convert();
  };

  onMount(async () => {
    await fetchGoldPrice();
    convert();
  });
</script>

<div class="relative">
  <div
    class="absolute inset-0 bg-gradient-to-b from-blue-900 from-80% to-white to-30%"
  ></div>

  <div class="relative px-4 py-8 text-center text-white">
    <h1
      class="relative pt-15 mb-4 z-10 text-4xl text-center leading-none tracking-tight md:text-4xl lg:text-5xl text-white"
    >
      Gold converter
    </h1>
    <p class="relative z-10 text-lg text-center text-white md:text-xl">
      Check daily gold rates
    </p>
  </div>

  <div class="relative mx-auto w-full md:w-2/3 px-4 py-4">
    <div
      class="bg-white p-6 rounded-lg w-full flex flex-col items-center gap-6 shadow-lg min-h-[232px]"
    >
      <div class="flex flex-col items-center gap-4 w-full">
        <div
          class="relative w-64 border border-gray-300 rounded-md p-3 flex items-center justify-center"
        >
          <input
            id="amount"
            type="number"
            class="w-full text-lg font-semibold focus:outline-none bg-transparent text-center"
            placeholder="10"
            bind:value={amount}
            on:input={convert}
          />
        </div>
      </div>
      <div
        class="relative flex flex-row items-center justify-center gap-4 text-lg font-bold"
      >
        <span>{isGoldToPLN ? "g Au" : "PLN"}</span>

        <button
          class="cursor-pointer flex items-center justify-center rounded-full border border-gray-300 bg-white p-3 hover:bg-gray-200 transition-colors shadow-md"
          aria-label="Swap conversion"
          type="button"
          on:click={swapConversion}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-6 w-6 text-gray-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <span>{isGoldToPLN ? "PLN" : "g Au"}</span>
      </div>
      {#if Number(convertedAmount) > 0}
        <div class="flex w-full flex-col items-center mt-5">
          <p class="text-lg font-bold text-gray-500">
            {amount}
            {isGoldToPLN ? "g Au" : "PLN"}
          </p>
          <p class="text-3xl font-bold text-gray-700">
            {convertedAmount}
            {isGoldToPLN ? "PLN" : "g Au"}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  nav {
    height: 120%;
  }
</style>
